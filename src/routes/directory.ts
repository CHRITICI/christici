import { Hono } from 'hono'
import type { Bindings } from '../types'

const directory = new Hono<{ Bindings: Bindings }>()

// GET /api/directory/categories?grp=organisation|profil|affaire
directory.get('/categories', async (c) => {
  const grp = c.req.query('grp')
  let sql = 'SELECT * FROM categories'
  const params: string[] = []
  if (grp) {
    sql += ' WHERE grp = ?'
    params.push(grp)
  }
  sql += ' ORDER BY sort_order, name'
  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ items: results })
})

// GET /api/directory — entrées organisations & affaires
// ?grp=organisation|affaire &category=slug &q= &city= &region= &limit= &page=
directory.get('/', async (c) => {
  const q = c.req.query()
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100)
  const page = Math.max(Number(q.page) || 1, 1)
  const offset = (page - 1) * limit

  let sql = `SELECT e.*, cat.slug AS category_slug, cat.name AS category_name, cat.grp AS category_grp
             FROM directory_entries e JOIN categories cat ON cat.id = e.category_id`
  let where = ' WHERE e.published = 1'
  const params: unknown[] = []

  if (q.grp && ['organisation', 'affaire'].includes(q.grp)) {
    where += ' AND cat.grp = ?'
    params.push(q.grp)
  }
  if (q.category) { where += ' AND cat.slug = ?'; params.push(q.category) }
  if (q.city) { where += ' AND e.city = ?'; params.push(q.city) }
  if (q.region) { where += ' AND e.region = ?'; params.push(q.region) }
  if (q.q) {
    where += ' AND (e.name LIKE ? OR e.description LIKE ?)'
    const like = `%${q.q.slice(0, 100)}%`
    params.push(like, like)
  }

  const countSql = `SELECT COUNT(*) AS total FROM (${sql}${where})`
  const listSql = `${sql}${where} ORDER BY e.featured DESC, e.name ASC LIMIT ? OFFSET ?`

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

// GET /api/directory/:slug — fiche détaillée
directory.get('/:slug', async (c) => {
  const item = await c.env.DB
    .prepare(`SELECT e.*, cat.slug AS category_slug, cat.name AS category_name, cat.grp AS category_grp
              FROM directory_entries e JOIN categories cat ON cat.id = e.category_id
              WHERE e.slug = ? AND e.published = 1`)
    .bind(c.req.param('slug'))
    .first()
  if (!item) return c.json({ error: 'Entrée introuvable' }, 404)
  return c.json({ item })
})

export default directory
