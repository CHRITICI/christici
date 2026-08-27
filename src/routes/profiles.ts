import { Hono } from 'hono'
import type { Bindings } from '../types'

const profiles = new Hono<{ Bindings: Bindings }>()

// GET /api/profiles — liste des profils chrétiens
// ?category=slug &q= &city= &available=1 &limit= &page=
profiles.get('/', async (c) => {
  const q = c.req.query()
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100)
  const page = Math.max(Number(q.page) || 1, 1)
  const offset = (page - 1) * limit

  let sql = `SELECT p.*, cat.slug AS category_slug, cat.name AS category_name, cat.grp AS category_grp
             FROM profiles p JOIN categories cat ON cat.id = p.category_id`
  let where = ' WHERE p.published = 1'
  const params: unknown[] = []

  if (q.category) { where += ' AND cat.slug = ?'; params.push(q.category) }
  if (q.city) { where += ' AND p.city = ?'; params.push(q.city) }
  if (q.available === '1') { where += ' AND p.available = 1' }
  if (q.q) {
    where += ' AND (p.full_name LIKE ? OR p.title LIKE ? OR p.bio LIKE ? OR p.skills LIKE ?)'
    const like = `%${q.q.slice(0, 100)}%`
    params.push(like, like, like, like)
  }

  const countSql = `SELECT COUNT(*) AS total FROM (${sql}${where})`
  const listSql = `${sql}${where} ORDER BY p.featured DESC, p.full_name ASC LIMIT ? OFFSET ?`

  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare(countSql).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(listSql).bind(...params, limit, offset).all(),
  ])

  return c.json({
    items: listResult.results,
    total: countResult?.total ?? 0,
    page,
    pages: Math.ceil((countResult?.total ?? 0) / limit),
  })
})

// GET /api/profiles/:slug — fiche détaillée
profiles.get('/:slug', async (c) => {
  const item = await c.env.DB
    .prepare(`SELECT p.*, cat.slug AS category_slug, cat.name AS category_name, cat.grp AS category_grp
              FROM profiles p JOIN categories cat ON cat.id = p.category_id
              WHERE p.slug = ? AND p.published = 1`)
    .bind(c.req.param('slug'))
    .first()
  if (!item) return c.json({ error: 'Profil introuvable' }, 404)
  return c.json({ item })
})

export default profiles
