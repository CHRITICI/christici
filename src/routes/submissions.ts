import { Hono } from 'hono'
import type { Bindings } from '../types'

const submissions = new Hono<{ Bindings: Bindings }>()

const VALID_KINDS = ['church', 'organisation', 'profil', 'affaire', 'autre'] as const

// POST /api/submissions — demande d'inscription publique (sans authentification pour l'instant)
submissions.post('/', async (c) => {
  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Corps de requête JSON invalide' }, 400)
  }

  const kind = String(body.kind ?? '')
  const name = String(body.name ?? '').trim()
  const contact = String(body.contact ?? '').trim()
  const category = body.category ? String(body.category).trim().slice(0, 100) : null
  const city = body.city ? String(body.city).trim().slice(0, 100) : null
  const message = body.message ? String(body.message).trim().slice(0, 2000) : null

  // Validation stricte
  if (!VALID_KINDS.includes(kind as (typeof VALID_KINDS)[number])) {
    return c.json({ error: 'Type d\'inscription invalide' }, 400)
  }
  if (name.length < 2 || name.length > 150) {
    return c.json({ error: 'Le nom doit contenir entre 2 et 150 caractères' }, 400)
  }
  if (contact.length < 5 || contact.length > 150) {
    return c.json({ error: 'Un contact valide (téléphone ou email) est requis' }, 400)
  }

  const result = await c.env.DB
    .prepare('INSERT INTO submissions (kind, name, category, city, contact, message) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(kind, name.slice(0, 150), category, city, contact.slice(0, 150), message)
    .run()

  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

export default submissions
