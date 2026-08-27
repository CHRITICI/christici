import { Hono } from 'hono'
import type { Bindings } from '../types'

const home = new Hono<{ Bindings: Bindings }>()

// GET /api/home — agrégat complet pour la page d'accueil
home.get('/', async (c) => {
  const db = c.env.DB

  const [churches, organisations, profils, events, news, jobs, publications, videos, music, images, articles, stats] = await Promise.all([
    db.prepare(`SELECT id, name, slug, denomination, city, region, district, image_url FROM churches
                WHERE published = 1 ORDER BY featured DESC, created_at DESC LIMIT 6`).all(),
    db.prepare(`SELECT e.id, e.name, e.slug, e.city, e.image_url, cat.name AS category_name, cat.icon FROM directory_entries e
                JOIN categories cat ON cat.id = e.category_id
                WHERE e.published = 1 AND cat.grp = 'organisation' ORDER BY e.featured DESC, e.created_at DESC LIMIT 6`).all(),
    db.prepare(`SELECT p.id, p.full_name, p.slug, p.title, p.city, p.photo_url, cat.name AS category_name, cat.icon FROM profiles p
                JOIN categories cat ON cat.id = p.category_id
                WHERE p.published = 1 ORDER BY p.featured DESC, p.created_at DESC LIMIT 6`).all(),
    db.prepare(`SELECT id, title, slug, event_type, start_date, city, location_name, image_url FROM events
                WHERE published = 1 AND date(start_date) >= date('now') ORDER BY featured DESC, start_date ASC LIMIT 4`).all(),
    db.prepare(`SELECT id, title, slug, excerpt, image_url, created_at FROM news
                WHERE published = 1 ORDER BY created_at DESC LIMIT 4`).all(),
    db.prepare(`SELECT id, title, slug, organization, city, contract_type, deadline FROM jobs
                WHERE published = 1 ORDER BY created_at DESC LIMIT 3`).all(),
    db.prepare(`SELECT id, title, slug, author, description, cover_url, published_date FROM publications
                WHERE published = 1 ORDER BY featured DESC, published_date DESC LIMIT 3`).all(),
    db.prepare(`SELECT id, title, slug, description, thumbnail_url, metadata FROM media_items
                WHERE published = 1 AND type = 'video' ORDER BY featured DESC, created_at DESC LIMIT 4`).all(),
    db.prepare(`SELECT id, title, slug, description, thumbnail_url, metadata FROM media_items
                WHERE published = 1 AND type = 'music' ORDER BY featured DESC, created_at DESC LIMIT 4`).all(),
    db.prepare(`SELECT id, title, slug, description, thumbnail_url, metadata FROM media_items
                WHERE published = 1 AND type = 'image' ORDER BY featured DESC, created_at DESC LIMIT 4`).all(),
    db.prepare(`SELECT id, title, slug, description, thumbnail_url, metadata FROM media_items
                WHERE published = 1 AND type = 'article' ORDER BY featured DESC, created_at DESC LIMIT 4`).all(),
    db.batch([
      db.prepare('SELECT COUNT(*) AS n FROM churches WHERE published = 1'),
      db.prepare(`SELECT COUNT(*) AS n FROM directory_entries e JOIN categories cat ON cat.id = e.category_id WHERE e.published = 1 AND cat.grp = 'organisation'`),
      db.prepare(`SELECT COUNT(*) AS n FROM directory_entries e JOIN categories cat ON cat.id = e.category_id WHERE e.published = 1 AND cat.grp = 'affaire'`),
      db.prepare('SELECT COUNT(*) AS n FROM profiles WHERE published = 1'),
      db.prepare(`SELECT COUNT(*) AS n FROM events WHERE published = 1 AND date(start_date) >= date('now')`),
      db.prepare('SELECT COUNT(*) AS n FROM media_items WHERE published = 1'),
    ]),
  ])

  return c.json({
    churches: churches.results,
    organisations: organisations.results,
    profils: profils.results,
    events: events.results,
    news: news.results,
    jobs: jobs.results,
    publications: publications.results,
    media: {
      video: videos.results,
      music: music.results,
      image: images.results,
      article: articles.results,
    },
    stats: {
      churches: (stats[0].results[0] as { n: number })?.n ?? 0,
      organisations: (stats[1].results[0] as { n: number })?.n ?? 0,
      affaires: (stats[2].results[0] as { n: number })?.n ?? 0,
      profils: (stats[3].results[0] as { n: number })?.n ?? 0,
      events: (stats[4].results[0] as { n: number })?.n ?? 0,
      medias: (stats[5].results[0] as { n: number })?.n ?? 0,
    },
  })
})

export default home
