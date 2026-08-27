-- Christici - Schéma initial
-- Table unique polymorphe pour les contenus multimédia (vidéos, musique, images, articles)

CREATE TABLE IF NOT EXISTS media_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('video', 'music', 'image', 'article')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  -- URL de la miniature (image de couverture / poster)
  thumbnail_url TEXT,
  -- URL du média : vidéo (embed ou fichier), audio, image pleine résolution
  media_url TEXT,
  -- Corps de texte (articles uniquement)
  body TEXT,
  -- Métadonnées libres en JSON (durée, auteur, tags, etc.)
  metadata TEXT DEFAULT '{}',
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media_items(featured);
CREATE INDEX IF NOT EXISTS idx_media_published ON media_items(published);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_items(created_at DESC);
