// Types partagés Christici

export type MediaType = 'video' | 'music' | 'image' | 'article'

export interface MediaItem {
  id: number
  type: MediaType
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  media_url: string | null
  body: string | null
  metadata: string // JSON sérialisé
  featured: number
  published: number
  created_at: string
  updated_at: string
}

export type Bindings = {
  DB: D1Database
}
