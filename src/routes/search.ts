import { Hono } from 'hono'
import type { Bindings } from '../types'

const search = new Hono<{ Bindings: Bindings }>()

// GET /api/search?q=... — recherche globale sur toutes les entités
search.get('/', async (c) => {
  const q = (c.req.query('q') || '').trim().slice(0, 100)
  if (q.length < 2) {
    return c.json({ query: q, results: {}, total: 0 })
  }
  const like = `%${q}%`
  const db = c.env.DB

  const [churches, entries, profs, events, news, media] = await Promise.all([
    db.prepare(`SELECT id, name, slug, denomination, city, region, 'church' AS kind FROM churches
                WHERE published = 1 AND (name LIKE ? OR description LIKE ? OR city LIKE ? OR district LIKE ?) LIMIT 6`)
      .bind(like, like, like, like).all(),
    db.prepare(`SELECT e.id, e.name, e.slug, e.city, cat.name AS category_name, cat.grp AS kind FROM directory_entries e
                JOIN categories cat ON cat.id = e.category_id
                WHERE e.published = 1 AND (e.name LIKE ? OR e.description LIKE ? OR e.city LIKE ?) LIMIT 6`)
      .bind(like, like, like).all(),
    db.prepare(`SELECT p.id, p.full_name AS name, p.slug, p.title, p.city, cat.name AS category_name, 'profil' AS kind FROM profiles p
                JOIN categories cat ON cat.id = p.category_id
                WHERE p.published = 1 AND (p.full_name LIKE ? OR p.title LIKE ? OR p.bio LIKE ? OR p.city LIKE ?) LIMIT 6`)
      .bind(like, like, like, like).all(),
    db.prepare(`SELECT id, title AS name, slug, city, event_type, 'event' AS kind FROM events
                WHERE published = 1 AND (title LIKE ? OR description LIKE ?) LIMIT 6`)
      .bind(like, like).all(),
    db.prepare(`SELECT id, title AS name, slug, excerpt, 'news' AS kind FROM news
                WHERE published = 1 AND (title LIKE ? OR excerpt LIKE ? OR body LIKE ?) LIMIT 6`)
      .bind(like, like, like).all(),
    db.prepare(`SELECT id, title AS name, slug, type AS kind, description FROM media_items
                WHERE published = 1 AND (title LIKE ? OR description LIKE ? OR body LIKE ?) LIMIT 6`)
      .bind(like, like, like).all(),
  ])

  const results = {
    churches: churches.results,
    directory: entries.results,
    profiles: profs.results,
    events: events.results,
    news: news.results,
    media: media.results,
  }
  const total = Object.values(results).reduce((acc, arr) => acc + arr.length, 0)
  return c.json({ query: q, results, total })
})

export default search
