-- Christici - Schéma annuaire chrétien
-- Églises, organisations, profils, affaires, événements, actualités, emplois, publications

-- Catégories de l'annuaire (organisations, profils, affaires)
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  grp TEXT NOT NULL CHECK (grp IN ('organisation', 'profil', 'affaire')),
  icon TEXT DEFAULT 'fa-folder',
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Églises (annuaire géolocalisé, multi-pays dès la conception)
CREATE TABLE IF NOT EXISTS churches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  denomination TEXT,
  description TEXT,
  country TEXT NOT NULL DEFAULT 'Togo',
  region TEXT,
  city TEXT,
  district TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude REAL,
  longitude REAL,
  pastor_name TEXT,
  service_times TEXT,
  image_url TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Organisations chrétiennes et affaires chrétiennes (entrées génériques catégorisées)
CREATE TABLE IF NOT EXISTS directory_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  country TEXT NOT NULL DEFAULT 'Togo',
  region TEXT,
  city TEXT,
  district TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_links TEXT DEFAULT '{}',
  latitude REAL,
  longitude REAL,
  opening_hours TEXT,
  image_url TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Profils chrétiens (musiciens, sociologues, groupes musicaux, extensible)
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  full_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  bio TEXT,
  skills TEXT DEFAULT '[]',
  country TEXT NOT NULL DEFAULT 'Togo',
  region TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  photo_url TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Événements
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  location_name TEXT,
  city TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'Togo',
  organizer TEXT,
  image_url TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actualités (les nouvelles)
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body TEXT,
  image_url TEXT,
  source TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Offres d'emploi
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organization TEXT,
  description TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'Togo',
  contract_type TEXT,
  apply_email TEXT,
  apply_url TEXT,
  deadline TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nouvelles publications (ouvrages en ligne)
CREATE TABLE IF NOT EXISTS publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT,
  description TEXT,
  cover_url TEXT,
  link TEXT,
  published_date TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Demandes d'inscription (églises, organisations, profils, affaires)
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('church', 'organisation', 'profil', 'affaire', 'autre')),
  name TEXT NOT NULL,
  category TEXT,
  city TEXT,
  contact TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_churches_region ON churches(region);
CREATE INDEX IF NOT EXISTS idx_churches_city ON churches(city);
CREATE INDEX IF NOT EXISTS idx_churches_district ON churches(district);
CREATE INDEX IF NOT EXISTS idx_churches_denom ON churches(denomination);
CREATE INDEX IF NOT EXISTS idx_churches_country ON churches(country);
CREATE INDEX IF NOT EXISTS idx_churches_pub ON churches(published, featured);
CREATE INDEX IF NOT EXISTS idx_entries_cat ON directory_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_entries_city ON directory_entries(city);
CREATE INDEX IF NOT EXISTS idx_entries_region ON directory_entries(region);
CREATE INDEX IF NOT EXISTS idx_entries_pub ON directory_entries(published, featured);
CREATE INDEX IF NOT EXISTS idx_profiles_cat ON profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_pub ON profiles(published, featured);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_pub ON events(published, featured);
CREATE INDEX IF NOT EXISTS idx_news_pub ON news(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_pub ON jobs(published);
CREATE INDEX IF NOT EXISTS idx_publications_pub ON publications(published, featured);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
