import { Hono } from 'hono'
import type { Bindings, MediaType } from '../types'

const VALID_TYPES: MediaType[] = ['video', 'music', 'image', 'article']

const media = new Hono<{ Bindings: Bindings }>()

// GET /api/media — liste tous les contenus publiés, groupés par type
// Paramètres optionnels : ?type=video|music|image|article & ?featured=1 & ?limit=N
media.get('/', async (c) => {
  const type = c.req.query('type')
  const featured = c.req.query('featured')
  const limit = Math.min(Number(c.req.query('limit')) || 50, 100)

  let sql = 'SELECT * FROM media_items WHERE published = 1'
  const params: unknown[] = []

  if (type && VALID_TYPES.includes(type as MediaType)) {
    sql += ' AND type = ?'
    params.push(type)
  }
  if (featured === '1') {
    sql += ' AND featured = 1'
  }
  sql += ' ORDER BY featured DESC, created_at DESC LIMIT ?'
  params.push(limit)

  const { results } = await c.env.DB.prepare(sql).bind(...params).all()
  return c.json({ items: results })
})

// GET /api/media/home — agrégat pour la page d'accueil (derniers contenus de chaque type)
media.get('/home', async (c) => {
  const sections: Record<string, unknown[]> = {}
  for (const type of VALID_TYPES) {
    const { results } = await c.env.DB
      .prepare(
        'SELECT * FROM media_items WHERE published = 1 AND type = ? ORDER BY featured DESC, created_at DESC LIMIT 4'
      )
      .bind(type)
      .all()
    sections[type] = results
  }
  return c.json(sections)
})

// GET /api/media/:slug — détail d'un contenu par son slug
media.get('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const item = await c.env.DB
    .prepare('SELECT * FROM media_items WHERE slug = ? AND published = 1')
    .bind(slug)
    .first()

  if (!item) {
    return c.json({ error: 'Contenu introuvable' }, 404)
  }
  return c.json({ item })
})

export default media
