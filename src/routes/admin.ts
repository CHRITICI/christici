// Back-office administrateur Christici.
// Toutes les routes exigent le rôle admin (middleware requireAdmin).
// Permet de gérer : statistiques, églises, annuaire, profils, infos (événements,
// nouvelles, emplois, publications), médias, catégories, soumissions publiques,
// signalements, revendications, pays, utilisateurs, et la détection de doublons.
import { Hono } from 'hono'
import type { Bindings, AppVariables } from '../types'
import { requireAdmin } from '../lib/auth'

const admin = new Hono<{ Bindings: Bindings; Variables: AppVariables }>()

admin.use('/*', requireAdmin)

// ---------------------------------------------------------------- helpers

/** Configuration des entités gérables : table, colonnes listées, champs éditables. */
const ENTITIES: Record<
  string,
  {
    table: string
    label: string
    listSelect: string
    searchCols: string[]
    orderBy: string
    editable: string[]
    hasStatus: boolean
    hasPublished: boolean
  }
> = {
  churches: {
    table: 'churches',
    label: 'Églises',
    listSelect:
      "id, name, slug, denomination, country, region, city, address, latitude, longitude, status, source, source_ref, featured, published, claimed_by, created_at",
    searchCols: ['name', 'city', 'region', 'denomination'],
    orderBy: 'created_at DESC',
    editable: [
      'name', 'denomination', 'description', 'country', 'region', 'city', 'district', 'address',
      'phone', 'email', 'website', 'latitude', 'longitude', 'pastor_name', 'service_times',
      'image_url', 'featured', 'published', 'status',
    ],
    hasStatus: true,
    hasPublished: true,
  },
  directory: {
    table: 'directory_entries',
    label: 'Annuaire (organisations / affaires)',
    listSelect:
      "id, category_id, name, slug, country, region, city, phone, email, website, status, source, featured, published, created_at",
    searchCols: ['name', 'city', 'region'],
    orderBy: 'created_at DESC',
    editable: [
      'category_id', 'name', 'description', 'country', 'region', 'city', 'district', 'address',
      'phone', 'email', 'website', 'social_links', 'latitude', 'longitude', 'opening_hours',
      'image_url', 'featured', 'published', 'status',
    ],
    hasStatus: true,
    hasPublished: true,
  },
  profiles: {
    table: 'profiles',
    label: 'Profils chrétiens',
    listSelect:
      "id, category_id, full_name, slug, title, country, region, city, email, phone, website, available, status, featured, published, created_at",
    searchCols: ['full_name', 'title', 'city'],
    orderBy: 'created_at DESC',
    editable: [
      'category_id', 'full_name', 'title', 'bio', 'skills', 'country', 'region', 'city',
      'phone', 'email', 'website', 'photo_url', 'available', 'featured', 'published', 'status',
    ],
    hasStatus: true,
    hasPublished: true,
  },
  events: {
    table: 'events',
    label: 'Événements',
    listSelect: "id, title, slug, event_type, start_date, end_date, location_name, city, region, country, organizer, featured, published, created_at",
    searchCols: ['title', 'location_name', 'city', 'organizer'],
    orderBy: 'start_date DESC',
    editable: [
      'title', 'description', 'event_type', 'start_date', 'end_date', 'location_name',
      'city', 'region', 'country', 'organizer', 'image_url', 'featured', 'published',
    ],
    hasStatus: false,
    hasPublished: true,
  },
  news: {
    table: 'news',
    label: 'Nouvelles',
    listSelect: "id, title, slug, excerpt, source, featured, published, created_at",
    searchCols: ['title', 'excerpt', 'source'],
    orderBy: 'created_at DESC',
    editable: ['title', 'excerpt', 'body', 'image_url', 'source', 'featured', 'published'],
    hasStatus: false,
    hasPublished: true,
  },
  jobs: {
    table: 'jobs',
    label: "Offres d'emploi",
    listSelect: "id, title, slug, organization, city, country, contract_type, deadline, published, created_at",
    searchCols: ['title', 'organization', 'city'],
    orderBy: 'created_at DESC',
    editable: [
      'title', 'organization', 'description', 'city', 'country', 'contract_type',
      'apply_email', 'apply_url', 'deadline', 'published',
    ],
    hasStatus: false,
    hasPublished: true,
  },
  publications: {
    table: 'publications',
    label: 'Publications',
    listSelect: "id, title, slug, author, published_date, featured, published, created_at",
    searchCols: ['title', 'author'],
    orderBy: 'created_at DESC',
    editable: ['title', 'author', 'description', 'cover_url', 'link', 'published_date', 'featured', 'published'],
    hasStatus: false,
    hasPublished: true,
  },
  media: {
    table: 'media_items',
    label: 'Médias',
    listSelect: "id, type, title, slug, description, thumbnail_url, media_url, featured, published, created_at",
    searchCols: ['title', 'description'],
    orderBy: 'created_at DESC',
    editable: ['type', 'title', 'description', 'thumbnail_url', 'media_url', 'body', 'metadata', 'featured', 'published'],
    hasStatus: false,
    hasPublished: true,
  },
}

function entityConfig(key: string) {
  return ENTITIES[key]
}

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'item'
}

async function uniqueSlug(db: D1Database, table: string, base: string, excludeId?: number): Promise<string> {
  let slug = base
  let i = 1
  for (;;) {
    const row = excludeId
      ? await db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).bind(slug, excludeId).first()
      : await db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).bind(slug).first()
    if (!row) return slug
    i++
    slug = `${base}-${i}`
  }
}

// ---------------------------------------------------------------- tableau de bord

admin.get('/stats', async (c) => {
  const db = c.env.DB
  // Une seule requête avec sous-requêtes scalaires — fiable sur D1
  const row = await db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM churches) AS churches,
        (SELECT COUNT(*) FROM churches WHERE status = 'a_verifier') AS churches_a_verifier,
        (SELECT COUNT(*) FROM churches WHERE status = 'verifiee') AS churches_verifiees,
        (SELECT COUNT(*) FROM churches WHERE status = 'signalee') AS churches_signalees,
        (SELECT COUNT(*) FROM directory_entries) AS directory,
        (SELECT COUNT(*) FROM profiles) AS profiles,
        (SELECT COUNT(*) FROM events) AS events,
        (SELECT COUNT(*) FROM news) AS news,
        (SELECT COUNT(*) FROM jobs) AS jobs,
        (SELECT COUNT(*) FROM publications) AS publications,
        (SELECT COUNT(*) FROM media_items) AS media,
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
        (SELECT COUNT(*) FROM claims WHERE status = 'pending') AS pending_claims,
        (SELECT COUNT(*) FROM submissions WHERE status = 'pending') AS pending_submissions`
    )
    .first<Record<string, number>>()
  return c.json(row ?? {})
})

// ---------------------------------------------------------------- CRUD générique

// GET /api/admin/list/:entity?q=&status=&published=&page=
admin.get('/list/:entity', async (c) => {
  const key = c.req.param('entity')
  const cfg = entityConfig(key)
  if (!cfg) return c.json({ error: 'Entité inconnue' }, 404)

  const q = (c.req.query('q') ?? '').trim()
  const status = (c.req.query('status') ?? '').trim()
  const published = (c.req.query('published') ?? '').trim()
  const page = Math.max(1, Number(c.req.query('page') ?? 1) || 1)
  const limit = 20
  const offset = (page - 1) * limit

  const where: string[] = []
  const params: any[] = []

  if (q) {
    where.push('(' + cfg.searchCols.map((col) => `${col} LIKE ?`).join(' OR ') + ')')
    cfg.searchCols.forEach(() => params.push(`%${q}%`))
  }
  if (status && cfg.hasStatus) {
    where.push('status = ?')
    params.push(status)
  }
  if ((published === '0' || published === '1') && cfg.hasPublished) {
    where.push('published = ?')
    params.push(Number(published))
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : ''
  const total = await c.env.DB
    .prepare(`SELECT COUNT(*) AS n FROM ${cfg.table} ${whereSql}`)
    .bind(...params)
    .first<number>('n')
  const rows = await c.env.DB
    .prepare(`SELECT ${cfg.listSelect} FROM ${cfg.table} ${whereSql} ORDER BY ${cfg.orderBy} LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all()

  return c.json({
    entity: key,
    label: cfg.label,
    items: rows.results,
    total: Number(total ?? 0),
    page,
    pages: Math.max(1, Math.ceil(Number(total ?? 0) / limit)),
    editable: cfg.editable,
    hasStatus: cfg.hasStatus,
    hasPublished: cfg.hasPublished,
  })
})

// GET /api/admin/item/:entity/:id — fiche complète (toutes colonnes)
admin.get('/item/:entity/:id', async (c) => {
  const cfg = entityConfig(c.req.param('entity'))
  if (!cfg) return c.json({ error: 'Entité inconnue' }, 404)
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'ID invalide' }, 400)
  const row = await c.env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).bind(id).first()
  if (!row) return c.json({ error: 'Fiche introuvable' }, 404)
  return c.json({ item: row, editable: cfg.editable, hasStatus: cfg.hasStatus, hasPublished: cfg.hasPublished })
})

// POST /api/admin/item/:entity — création
admin.post('/item/:entity', async (c) => {
  const key = c.req.param('entity')
  const cfg = entityConfig(key)
  if (!cfg) return c.json({ error: 'Entité inconnue' }, 404)
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Corps de requête invalide (JSON attendu)' }, 400)
  }

  const nameField = key === 'profiles' ? 'full_name' : 'title'
  const rawName = String(body[key === 'profiles' ? 'full_name' : key === 'churches' || key === 'directory' ? 'name' : 'title'] ?? '').trim()
  if (rawName.length < 2 || rawName.length > 200) return c.json({ error: 'Le nom/titre est requis (2-200 caractères)' }, 400)

  const cols: string[] = []
  const vals: any[] = []
  for (const field of cfg.editable) {
    if (body[field] !== undefined) {
      cols.push(field)
      vals.push(body[field] === '' ? null : body[field])
    }
  }
  if (!cols.includes(nameField === 'full_name' ? 'full_name' : key === 'churches' || key === 'directory' ? 'name' : 'title')) {
    // garantir le nom
  }
  const slug = await uniqueSlug(c.env.DB, cfg.table, slugify(rawName))
  cols.push('slug')
  vals.push(slug)

  const placeholders = cols.map(() => '?').join(', ')
  const result = await c.env.DB
    .prepare(`INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${placeholders})`)
    .bind(...vals)
    .run()
  return c.json({ ok: true, id: result.meta.last_row_id, slug }, 201)
})

// PUT /api/admin/item/:entity/:id — mise à jour (champs whitelistés)
admin.put('/item/:entity/:id', async (c) => {
  const cfg = entityConfig(c.req.param('entity'))
  if (!cfg) return c.json({ error: 'Entité inconnue' }, 404)
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'ID invalide' }, 400)

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Corps de requête invalide (JSON attendu)' }, 400)
  }

  const sets: string[] = []
  const vals: any[] = []
  for (const field of cfg.editable) {
    if (body[field] !== undefined) {
      sets.push(`${field} = ?`)
      vals.push(body[field] === '' ? null : body[field])
    }
  }
  if (!sets.length) return c.json({ error: 'Aucun champ à mettre à jour' }, 400)

  // si on passe au statut vérifiée, horodater
  if (cfg.hasStatus && body.status === 'verifiee') {
    sets.push("verified_at = datetime('now')")
  }

  const result = await c.env.DB
    .prepare(`UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals, id)
    .run()
  if (!result.meta.changes) return c.json({ error: 'Fiche introuvable' }, 404)
  return c.json({ ok: true })
})

// DELETE /api/admin/item/:entity/:id — suppression définitive (modération)
admin.delete('/item/:entity/:id', async (c) => {
  const cfg = entityConfig(c.req.param('entity'))
  if (!cfg) return c.json({ error: 'Entité inconnue' }, 404)
  const id = Number(c.req.param('id'))
  const result = await c.env.DB.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).bind(id).run()
  if (!result.meta.changes) return c.json({ error: 'Fiche introuvable' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- signalements

admin.get('/reports', async (c) => {
  const status = c.req.query('status') ?? 'pending'
  const rows = await c.env.DB
    .prepare(
      `SELECT r.*, u.email AS user_email FROM reports r LEFT JOIN users u ON u.id = r.user_id
       WHERE (? = 'all' OR r.status = ?) ORDER BY r.created_at DESC LIMIT 100`
    )
    .bind(status, status)
    .all()
  return c.json({ items: rows.results })
})

admin.post('/reports/:id/resolve', async (c) => {
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json().catch(() => ({ status: 'resolved' })) as any
  const finalStatus = status === 'rejected' ? 'rejected' : 'resolved'
  const reviewer = c.get('user')
  const result = await c.env.DB
    .prepare("UPDATE reports SET status = ?, reviewed_at = datetime('now'), reviewer_id = ? WHERE id = ?")
    .bind(finalStatus, reviewer?.id ?? null, id)
    .run()
  if (!result.meta.changes) return c.json({ error: 'Signalement introuvable' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- revendications

admin.get('/claims', async (c) => {
  const status = c.req.query('status') ?? 'pending'
  const rows = await c.env.DB
    .prepare(
      `SELECT cl.*, u.email AS user_email,
              CASE cl.entity_type
                WHEN 'church' THEN (SELECT name FROM churches WHERE id = cl.entity_id)
                WHEN 'directory' THEN (SELECT name FROM directory_entries WHERE id = cl.entity_id)
                WHEN 'profile' THEN (SELECT full_name FROM profiles WHERE id = cl.entity_id)
              END AS entity_name
       FROM claims cl LEFT JOIN users u ON u.id = cl.user_id
       WHERE (? = 'all' OR cl.status = ?) ORDER BY cl.created_at DESC LIMIT 100`
    )
    .bind(status, status)
    .all()
  return c.json({ items: rows.results })
})

admin.post('/claims/:id/review', async (c) => {
  const id = Number(c.req.param('id'))
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'JSON invalide' }, 400)
  }
  const decision = body.decision === 'approved' ? 'approved' : 'rejected'
  const reviewer = c.get('user')

  const claim = await c.env.DB.prepare('SELECT * FROM claims WHERE id = ?').bind(id).first<any>()
  if (!claim) return c.json({ error: 'Revendication introuvable' }, 404)

  await c.env.DB
    .prepare("UPDATE claims SET status = ?, reviewed_at = datetime('now'), reviewer_id = ? WHERE id = ?")
    .bind(decision, reviewer?.id ?? null, id)
    .run()

  // Approuvée → marquer la fiche comme revendiquée (églises : claimed_by) et la passer en vérifiée
  if (decision === 'approved') {
    if (claim.entity_type === 'church') {
      await c.env.DB
        .prepare("UPDATE churches SET claimed_by = ?, status = 'verifiee', verified_at = datetime('now') WHERE id = ?")
        .bind(claim.user_id ?? null, claim.entity_id)
        .run()
    } else if (claim.entity_type === 'directory') {
      await c.env.DB
        .prepare("UPDATE directory_entries SET status = 'verifiee', verified_at = datetime('now') WHERE id = ?")
        .bind(claim.entity_id)
        .run()
    } else if (claim.entity_type === 'profile') {
      await c.env.DB
        .prepare("UPDATE profiles SET status = 'verifiee', verified_at = datetime('now') WHERE id = ?")
        .bind(claim.entity_id)
        .run()
    }
  }
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- soumissions publiques

admin.get('/submissions', async (c) => {
  const status = c.req.query('status') ?? 'pending'
  const rows = await c.env.DB
    .prepare("SELECT * FROM submissions WHERE (? = 'all' OR status = ?) ORDER BY created_at DESC LIMIT 100")
    .bind(status, status)
    .all()
  return c.json({ items: rows.results })
})

admin.post('/submissions/:id/status', async (c) => {
  const id = Number(c.req.param('id'))
  const { status } = await c.req.json().catch(() => ({})) as any
  const s = ['pending', 'approved', 'rejected'].includes(status) ? status : null
  if (!s) return c.json({ error: 'Statut invalide' }, 400)
  const result = await c.env.DB.prepare('UPDATE submissions SET status = ? WHERE id = ?').bind(s, id).run()
  if (!result.meta.changes) return c.json({ error: 'Soumission introuvable' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- pays

admin.get('/countries', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM countries ORDER BY priority, name').all()
  return c.json({ items: rows.results })
})

admin.post('/countries', async (c) => {
  const { code, name, enabled, priority } = (await c.req.json().catch(() => ({}))) as any
  const cc = String(code ?? '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(cc)) return c.json({ error: 'Code pays ISO-2 invalide' }, 400)
  if (!name || String(name).trim().length < 2) return c.json({ error: 'Nom de pays requis' }, 400)
  await c.env.DB
    .prepare(
      `INSERT INTO countries (code, name, enabled, priority) VALUES (?, ?, ?, ?)
       ON CONFLICT(code) DO UPDATE SET name = excluded.name, enabled = excluded.enabled, priority = excluded.priority`
    )
    .bind(cc, String(name).trim(), enabled === 0 ? 0 : 1, Number(priority) || 100)
    .run()
  return c.json({ ok: true }, 201)
})

admin.delete('/countries/:code', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM countries WHERE code = ?').bind(c.req.param('code').toUpperCase()).run()
  if (!result.meta.changes) return c.json({ error: 'Pays introuvable' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- utilisateurs

admin.get('/users', async (c) => {
  const rows = await c.env.DB
    .prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 200')
    .all()
  return c.json({ items: rows.results })
})

admin.post('/users/:id/role', async (c) => {
  const id = Number(c.req.param('id'))
  const { role } = (await c.req.json().catch(() => ({}))) as any
  if (!['user', 'admin'].includes(role)) return c.json({ error: 'Rôle invalide' }, 400)
  const me = c.get('user')
  if (me && me.id === id && role !== 'admin')
    return c.json({ error: 'Vous ne pouvez pas retirer votre propre rôle administrateur' }, 400)
  const result = await c.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(role, id).run()
  if (!result.meta.changes) return c.json({ error: 'Utilisateur introuvable' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------- journal des imports

admin.get('/imports', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM import_runs ORDER BY created_at DESC LIMIT 50').all()
  return c.json({ items: rows.results })
})

// ---------------------------------------------------------------- doublons

admin.get('/duplicates/churches', async (c) => {
  // Doublons exacts : même nom normalisé + même ville
  const byNameCity = await c.env.DB
    .prepare(
      `SELECT lower(trim(name)) AS nkey, COALESCE(city,'') AS ckey, COUNT(*) AS n,
              GROUP_CONCAT(id) AS ids, GROUP_CONCAT(name, ' | ') AS names
       FROM churches GROUP BY nkey, ckey HAVING n > 1 ORDER BY n DESC LIMIT 50`
    )
    .all()
  // Doublons spatiaux : coordonnées quasi identiques (< ~110 m)
  const byGeo = await c.env.DB
    .prepare(
      `SELECT ROUND(latitude, 3) AS lat3, ROUND(longitude, 3) AS lng3, COUNT(*) AS n,
              GROUP_CONCAT(id) AS ids, GROUP_CONCAT(name, ' | ') AS names
       FROM churches WHERE latitude IS NOT NULL
       GROUP BY lat3, lng3 HAVING n > 1 ORDER BY n DESC LIMIT 50`
    )
    .all()
  return c.json({ by_name_city: byNameCity.results, by_geo: byGeo.results })
})

export default admin
