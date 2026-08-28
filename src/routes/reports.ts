// Signalements d'erreurs et revendications de fiches (publics, sans compte requis)
import { Hono } from 'hono'
import type { Bindings, AppVariables } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: AppVariables }>()

const REPORT_ENTITY_TYPES = ['church', 'directory', 'profile', 'event', 'news', 'job', 'publication', 'media', 'other']
const CLAIM_ENTITY_TYPES = ['church', 'directory', 'profile']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// POST /api/reports — un utilisateur signale une erreur ou une fiche inexistante
app.post('/reports', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Corps de requête invalide (JSON attendu)' }, 400)
  }
  const entityType = String(body.entity_type ?? '').trim()
  const entityId = body.entity_id != null ? Number(body.entity_id) : null
  const reason = String(body.reason ?? '').trim()
  const details = String(body.details ?? '').trim() || null
  const reporterEmail = String(body.reporter_email ?? '').trim() || null

  if (!REPORT_ENTITY_TYPES.includes(entityType))
    return c.json({ error: "Type d'entité invalide" }, 400)
  if (entityId !== null && (!Number.isInteger(entityId) || entityId <= 0))
    return c.json({ error: 'Identifiant de fiche invalide' }, 400)
  if (reason.length < 3 || reason.length > 200)
    return c.json({ error: 'Le motif doit contenir entre 3 et 200 caractères' }, 400)
  if (details && details.length > 2000)
    return c.json({ error: 'Les détails sont trop longs (2000 caractères max)' }, 400)
  if (reporterEmail && !EMAIL_RE.test(reporterEmail))
    return c.json({ error: 'Adresse email invalide' }, 400)

  const user = c.get('user')
  const result = await c.env.DB
    .prepare(
      `INSERT INTO reports (entity_type, entity_id, reason, details, reporter_email, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(entityType, entityId, reason, details, reporterEmail, user ? user.id : null)
    .run()

  return c.json({ ok: true, id: result.meta.last_row_id }, 201)
})

// POST /api/claims — un responsable revendique une fiche (église, organisation, profil)
app.post('/claims', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Corps de requête invalide (JSON attendu)' }, 400)
  }
  const entityType = String(body.entity_type ?? 'church').trim()
  const entityId = Number(body.entity_id)
  const contactName = String(body.contact_name ?? '').trim()
  const contactEmail = String(body.contact_email ?? '').trim().toLowerCase()
  const contactPhone = String(body.contact_phone ?? '').trim() || null
  const roleInEntity = String(body.role_in_entity ?? '').trim() || null
  const message = String(body.message ?? '').trim() || null

  if (!CLAIM_ENTITY_TYPES.includes(entityType))
    return c.json({ error: "Type d'entité invalide" }, 400)
  if (!Number.isInteger(entityId) || entityId <= 0)
    return c.json({ error: 'Identifiant de fiche invalide' }, 400)
  if (contactName.length < 2 || contactName.length > 120)
    return c.json({ error: 'Le nom du contact doit contenir entre 2 et 120 caractères' }, 400)
  if (!EMAIL_RE.test(contactEmail) || contactEmail.length > 150)
    return c.json({ error: 'Adresse email de contact invalide' }, 400)
  if (message && message.length > 2000)
    return c.json({ error: 'Le message est trop long (2000 caractères max)' }, 400)

  // Vérifier que la fiche existe réellement (pas de revendication sur du vide)
  const table = entityType === 'church' ? 'churches' : entityType === 'directory' ? 'directory_entries' : 'profiles'
  const exists = await c.env.DB.prepare(`SELECT id FROM ${table} WHERE id = ?`).bind(entityId).first()
  if (!exists) return c.json({ error: "Cette fiche n'existe pas" }, 404)

  // Un seul dossier en attente par fiche
  const pending = await c.env.DB
    .prepare("SELECT id FROM claims WHERE entity_type = ? AND entity_id = ? AND status = 'pending'")
    .bind(entityType, entityId)
    .first()
  if (pending)
    return c.json({ error: 'Une demande de revendication est déjà en cours pour cette fiche' }, 409)

  const user = c.get('user')
  const result = await c.env.DB
    .prepare(
      `INSERT INTO claims (entity_type, entity_id, user_id, contact_name, contact_email, contact_phone, role_in_entity, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(entityType, entityId, user ? user.id : null, contactName, contactEmail, contactPhone, roleInEntity, message)
    .run()

  return c.json({ ok: true, id: result.meta.last_row_id }, 201)
})

export default app
