// Routes d'authentification : inscription, connexion, déconnexion, profil courant
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import type { Bindings, AppVariables, User } from '../types'
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
} from '../lib/auth'

const auth = new Hono<{ Bindings: Bindings; Variables: AppVariables }>()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function bad(c: any, message: string, status = 400) {
  return c.json({ error: message }, status)
}

// POST /api/auth/register — création de compte public
auth.post('/register', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return bad(c, 'Corps de requête invalide (JSON attendu)')
  }
  const email = String(body.email ?? '').trim().toLowerCase()
  const name = String(body.name ?? '').trim()
  const password = String(body.password ?? '')

  if (!EMAIL_RE.test(email) || email.length > 150) return bad(c, 'Adresse email invalide')
  if (name.length < 2 || name.length > 120) return bad(c, 'Le nom doit contenir entre 2 et 120 caractères')
  if (password.length < 8 || password.length > 200)
    return bad(c, 'Le mot de passe doit contenir au moins 8 caractères')

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return bad(c, 'Un compte existe déjà avec cette adresse email', 409)

  const passwordHash = await hashPassword(password)
  const result = await c.env.DB
    .prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'user')")
    .bind(email, name, passwordHash)
    .run()

  const userId = Number(result.meta.last_row_id)
  const token = await createSession(c.env.DB, userId)
  setSessionCookie(c, token)

  const user: User = {
    id: userId,
    email,
    name,
    role: 'user',
    created_at: new Date().toISOString(),
  }
  return c.json({ user }, 201)
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return bad(c, 'Corps de requête invalide (JSON attendu)')
  }
  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  if (!email || !password) return bad(c, 'Email et mot de passe requis')

  const row = await c.env.DB
    .prepare('SELECT id, email, name, role, password_hash, created_at FROM users WHERE email = ?')
    .bind(email)
    .first<any>()

  // message générique pour ne pas révéler l'existence d'un compte
  if (!row || !(await verifyPassword(password, String(row.password_hash))))
    return bad(c, 'Identifiants incorrects', 401)

  const token = await createSession(c.env.DB, Number(row.id))
  setSessionCookie(c, token)

  const user: User = { id: row.id, email: row.email, name: row.name, role: row.role, created_at: row.created_at }
  return c.json({ user })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const token = getCookie(c, 'christici_session')
  if (token) await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  clearSessionCookie(c)
  return c.json({ ok: true })
})

// GET /api/auth/me — utilisateur courant (ou null)
auth.get('/me', (c) => {
  return c.json({ user: c.get('user') ?? null })
})

export default auth
