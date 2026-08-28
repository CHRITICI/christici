// Authentification Christici — PBKDF2 (Web Crypto natif, compatible Workers)
// Aucun secret n'est stocké dans le code : les mots de passe sont hachés (sel aléatoire par utilisateur),
// les sessions sont des tokens aléatoires 256 bits stockés en base avec expiration.

import type { Context, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Bindings, AppVariables, User } from '../types'

const ITERATIONS = 100_000
const SESSION_COOKIE = 'christici_session'
const SESSION_TTL_HOURS = 24 * 14 // 14 jours

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes)
}

async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex) as BufferSource, iterations: ITERATIONS },
    keyMaterial,
    256
  )
  return bytesToHex(bits)
}

/** Hash au format stocké : "pbkdf2$<iterations>$<sel_hex>$<hash_hex>" */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const saltHex = bytesToHex(salt)
  const hashHex = await pbkdf2(password, saltHex)
  return `pbkdf2$${ITERATIONS}$${saltHex}$${hashHex}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const hashHex = await pbkdf2(password, parts[2])
  // comparaison à temps constant
  const a = hexToBytes(hashHex)
  const b = hexToBytes(parts[3])
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function createSession(db: D1Database, userId: number): Promise<string> {
  const token = randomToken()
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString()
  await db
    .prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(token, userId, expires)
    .run()
  return token
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_HOURS * 3600,
  })
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
}

async function userFromToken(db: D1Database, token: string | undefined): Promise<User | null> {
  if (!token) return null
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')`
    )
    .bind(token)
    .first<User>()
  return row ?? null
}

type AppCtx = Context<{ Bindings: Bindings; Variables: AppVariables }>

/** Middleware : charge l'utilisateur courant (null si non connecté) dans c.var.user */
export async function authMiddleware(c: AppCtx, next: Next): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE)
  c.set('user', await userFromToken(c.env.DB, token))
  await next()
}

/** Middleware : exige un utilisateur connecté (401 sinon) */
export async function requireAuth(c: AppCtx, next: Next): Promise<Response | void> {
  if (!c.get('user')) return c.json({ error: 'Authentification requise' }, 401)
  await next()
}

/** Middleware : exige le rôle admin (403 sinon) */
export async function requireAdmin(c: AppCtx, next: Next): Promise<Response | void> {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Authentification requise' }, 401)
  if (user.role !== 'admin') return c.json({ error: 'Accès réservé aux administrateurs' }, 403)
  await next()
}
