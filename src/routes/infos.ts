import { Hono } from 'hono'
import type { Bindings } from '../types'

const infos = new Hono<{ Bindings: Bindings }>()

function paginate(c: { req: { query: (k: string) => string | undefined } }) {
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 20, 1), 100)
  const page = Math.max(Number(c.req.query('page')) || 1, 1)
  return { limit, page, offset: (page - 1) * limit }
}

// ===== Événements =====
// GET /api/infos/events?type= &city= &upcoming=1 &limit= &page=
infos.get('/events', async (c) => {
  const q = c.req.query()
  const { limit, page, offset } = paginate(c)

  let where = ' WHERE published = 1'
  const params: unknown[] = []

  if (q.type) { where += ' AND event_type = ?'; params.push(q.type) }
  if (q.city) { where += ' AND city = ?'; params.push(q.city) }
  // Par défaut : uniquement les événements à venir
  if (q.upcoming !== '0') {
    where += " AND date(start_date) >= date('now')"
  }

  const countSql = `SELECT COUNT(*) AS total FROM events${where}`
  const listSql = `SELECT * FROM events${where} ORDER BY featured DESC, start_date ASC LIMIT ? OFFSET ?`

  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare(countSql).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(listSql).bind(...params, limit, offset).all(),
  ])

  return c.json({ items: listResult.results, total: countResult?.total ?? 0, page, pages: Math.ceil((countResult?.total ?? 0) / limit) })
})

infos.get('/events/:slug', async (c) => {
  const item = await c.env.DB.prepare('SELECT * FROM events WHERE slug = ? AND published = 1').bind(c.req.param('slug')).first()
  if (!item) return c.json({ error: 'Événement introuvable' }, 404)
  return c.json({ item })
})

// ===== Actualités =====
infos.get('/news', async (c) => {
  const { limit, page, offset } = paginate(c)
  const q = c.req.query('q')
  let where = ' WHERE published = 1'
  const params: unknown[] = []
  if (q) {
    where += ' AND (title LIKE ? OR excerpt LIKE ?)'
    const like = `%${q.slice(0, 100)}%`
    params.push(like, like)
  }
  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) AS total FROM news${where}`).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(`SELECT id, title, slug, excerpt, image_url, source, featured, created_at FROM news${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all(),
  ])
  return c.json({ items: listResult.results, total: countResult?.total ?? 0, page, pages: Math.ceil((countResult?.total ?? 0) / limit) })
})

infos.get('/news/:slug', async (c) => {
  const item = await c.env.DB.prepare('SELECT * FROM news WHERE slug = ? AND published = 1').bind(c.req.param('slug')).first()
  if (!item) return c.json({ error: 'Actualité introuvable' }, 404)
  return c.json({ item })
})

// ===== Offres d'emploi =====
infos.get('/jobs', async (c) => {
  const { limit, page, offset } = paginate(c)
  const city = c.req.query('city')
  let where = ' WHERE published = 1'
  const params: unknown[] = []
  if (city) { where += ' AND city = ?'; params.push(city) }
  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) AS total FROM jobs${where}`).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(`SELECT * FROM jobs${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all(),
  ])
  return c.json({ items: listResult.results, total: countResult?.total ?? 0, page, pages: Math.ceil((countResult?.total ?? 0) / limit) })
})

// ===== Publications =====
infos.get('/publications', async (c) => {
  const { limit, page, offset } = paginate(c)
  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS total FROM publications WHERE published = 1').first<{ total: number }>(),
    c.env.DB.prepare('SELECT * FROM publications WHERE published = 1 ORDER BY featured DESC, published_date DESC LIMIT ? OFFSET ?').bind(limit, offset).all(),
  ])
  return c.json({ items: listResult.results, total: countResult?.total ?? 0, page, pages: Math.ceil((countResult?.total ?? 0) / limit) })
})

export default infos
