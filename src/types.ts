// Types partagés Christici

export type MediaType = 'video' | 'music' | 'image' | 'article'
export type CategoryGroup = 'organisation' | 'profil' | 'affaire'

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

export interface Category {
  id: number
  slug: string
  name: string
  grp: CategoryGroup
  icon: string
  description: string | null
  sort_order: number
}

export interface Church {
  id: number
  name: string
  slug: string
  denomination: string | null
  description: string | null
  country: string
  region: string | null
  city: string | null
  district: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  pastor_name: string | null
  service_times: string | null
  image_url: string | null
  featured: number
  published: number
  created_at: string
  updated_at: string
}

export interface DirectoryEntry {
  id: number
  category_id: number
  name: string
  slug: string
  description: string | null
  country: string
  region: string | null
  city: string | null
  district: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  social_links: string
  latitude: number | null
  longitude: number | null
  opening_hours: string | null
  image_url: string | null
  featured: number
  published: number
  created_at: string
  updated_at: string
  // jointure
  category_slug?: string
  category_name?: string
  category_grp?: string
}

export interface Profile {
  id: number
  category_id: number
  full_name: string
  slug: string
  title: string | null
  bio: string | null
  skills: string // JSON array sérialisé
  country: string
  region: string | null
  city: string | null
  phone: string | null
  email: string | null
  website: string | null
  photo_url: string | null
  available: number
  featured: number
  published: number
  created_at: string
  updated_at: string
  // jointure
  category_slug?: string
  category_name?: string
  category_grp?: string
}

export interface EventItem {
  id: number
  title: string
  slug: string
  description: string | null
  event_type: string | null
  start_date: string
  end_date: string | null
  location_name: string | null
  city: string | null
  region: string | null
  country: string
  organizer: string | null
  image_url: string | null
  featured: number
  published: number
  created_at: string
}

export interface NewsItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  image_url: string | null
  source: string | null
  featured: number
  published: number
  created_at: string
}

export interface JobItem {
  id: number
  title: string
  slug: string
  organization: string | null
  description: string | null
  city: string | null
  country: string
  contract_type: string | null
  apply_email: string | null
  apply_url: string | null
  deadline: string | null
  published: number
  created_at: string
}

export interface PublicationItem {
  id: number
  title: string
  slug: string
  author: string | null
  description: string | null
  cover_url: string | null
  link: string | null
  published_date: string | null
  featured: number
  published: number
  created_at: string
}

// ===== Statuts de vérification des fiches (données réelles) =====
export type EntityStatus = 'a_verifier' | 'verifiee' | 'signalee'

export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Report {
  id: number
  entity_type: string
  entity_id: number | null
  reason: string
  details: string | null
  reporter_email: string | null
  user_id: number | null
  status: 'pending' | 'resolved' | 'rejected'
  created_at: string
}

export interface Claim {
  id: number
  entity_type: string
  entity_id: number
  user_id: number | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  role_in_entity: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Country {
  code: string
  name: string
  enabled: number
  priority: number
}

export type Bindings = {
  DB: D1Database
}

// Variables injectées par les middlewares (utilisateur courant)
export type AppVariables = {
  user: User | null
}
