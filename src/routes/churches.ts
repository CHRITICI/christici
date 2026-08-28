import { Hono } from 'hono'
import type { Bindings, Church } from '../types'

const churches = new Hono<{ Bindings: Bindings }>()

// Distance Haversine en km (calcul JS — D1 n'autorise pas les fonctions math SQL)
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// GET /api/churches/filters — listes distinctes pour les filtres
churches.get('/filters', async (c) => {
  const db = c.env.DB
  const [countries, regions, cities, denominations] = await Promise.all([
    db.prepare('SELECT DISTINCT country FROM churches WHERE published = 1 ORDER BY country').all(),
    db.prepare('SELECT DISTINCT region FROM churches WHERE published = 1 AND region IS NOT NULL ORDER BY region').all(),
    db.prepare('SELECT DISTINCT region, city FROM churches WHERE published = 1 AND city IS NOT NULL ORDER BY region, city').all(),
    db.prepare('SELECT DISTINCT denomination FROM churches WHERE published = 1 AND denomination IS NOT NULL ORDER BY denomination').all(),
  ])
  return c.json({
    countries: countries.results.map((r) => (r as { country: string }).country),
    regions: regions.results.map((r) => (r as { region: string }).region),
    cities: cities.results,
    denominations: denominations.results.map((r) => (r as { denomination: string }).denomination),
  })
})

// GET /api/churches — liste + filtres
// ?country= &region= &city= &district= &denomination= &q= &near=lat,lng &radius=km &limit= &page=
churches.get('/', async (c) => {
  const q = c.req.query()
  const limit = Math.min(Math.max(Number(q.limit) || 20, 1), 100)
  const page = Math.max(Number(q.page) || 1, 1)
  const offset = (page - 1) * limit

  // --- Recherche par proximité géographique ---
  if (q.near) {
    const parts = q.near.split(',').map(Number)
    if (parts.length !== 2 || !parts.every((n) => Number.isFinite(n))) {
      return c.json({ error: 'Paramètre "near" invalide (format : lat,lng)' }, 400)
    }
    const [lat, lng] = parts
    const radius = Math.min(Math.max(Number(q.radius) || 50, 1), 500)

    // Pré-filtre SQL : cadre englobant (bounding box) — 1° latitude ≈ 111 km
    const dLat = radius / 111
    const dLng = radius / (111 * Math.cos((lat * Math.PI) / 180) || 1)
    const { results } = await c.env.DB
      .prepare(`SELECT * FROM churches
                WHERE published = 1 AND latitude IS NOT NULL AND longitude IS NOT NULL
                  AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`)
      .bind(lat - dLat, lat + dLat, lng - dLng, lng + dLng)
      .all<Church>()

    // Distance exacte + tri en JS
    const withDistance = results
      .map((ch) => ({ ...ch, distance_km: haversineKm(lat, lng, ch.latitude!, ch.longitude!) }))
      .filter((ch) => ch.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km)

    const total = withDistance.length
    return c.json({
      items: withDistance.slice(offset, offset + limit),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  }

  // --- Recherche classique par filtres ---
  const params: unknown[] = []
  let where = ' WHERE published = 1'

  if (q.country) { where += ' AND country = ?'; params.push(q.country) }
  if (q.region) { where += ' AND region = ?'; params.push(q.region) }
  if (q.city) { where += ' AND city = ?'; params.push(q.city) }
  if (q.district) { where += ' AND district = ?'; params.push(q.district) }
  if (q.denomination) { where += ' AND denomination = ?'; params.push(q.denomination) }
  // Filtre par statut de vérification (a_verifier | verifiee | signalee)
  if (q.status && ['a_verifier', 'verifiee', 'signalee'].includes(q.status)) {
    where += ' AND status = ?'; params.push(q.status)
  }
  if (q.q) {
    where += ' AND (name LIKE ? OR description LIKE ? OR district LIKE ?)'
    const like = `%${q.q.slice(0, 100)}%`
    params.push(like, like, like)
  }

  const [countResult, listResult] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) AS total FROM churches${where}`).bind(...params).first<{ total: number }>(),
    c.env.DB.prepare(`SELECT * FROM churches${where} ORDER BY featured DESC, name ASC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all(),
  ])

  return c.json({
    items: listResult.results,
    total: countResult?.total ?? 0,
    page,
    pages: Math.ceil((countResult?.total ?? 0) / limit),
  })
})

// GET /api/churches/:slug — fiche détaillée
churches.get('/:slug', async (c) => {
  const item = await c.env.DB
    .prepare('SELECT * FROM churches WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first()
  if (!item) return c.json({ error: 'Église introuvable' }, 404)
  return c.json({ item })
})

export default churches
