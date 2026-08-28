-- Christici — plateforme à données réelles vérifiables
-- Ajoute : provenance, statuts de vérification, comptes utilisateurs, sessions,
-- signalements, revendications de fiches, pays et journal d'imports.

-- ===== Provenance + statuts sur les entités existantes =====
ALTER TABLE churches ADD COLUMN status TEXT NOT NULL DEFAULT 'a_verifier';
ALTER TABLE churches ADD COLUMN source TEXT;
ALTER TABLE churches ADD COLUMN source_ref TEXT;
ALTER TABLE churches ADD COLUMN verified_at DATETIME;
ALTER TABLE churches ADD COLUMN claimed_by INTEGER;

ALTER TABLE directory_entries ADD COLUMN status TEXT NOT NULL DEFAULT 'a_verifier';
ALTER TABLE directory_entries ADD COLUMN source TEXT;
ALTER TABLE directory_entries ADD COLUMN source_ref TEXT;
ALTER TABLE directory_entries ADD COLUMN verified_at DATETIME;

ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'a_verifier';
ALTER TABLE profiles ADD COLUMN source TEXT;
ALTER TABLE profiles ADD COLUMN source_ref TEXT;
ALTER TABLE profiles ADD COLUMN verified_at DATETIME;

-- ===== Comptes utilisateurs =====
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== Signalements d'erreurs / fiches inexistantes =====
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('church','directory','profile','event','news','job','publication','media','other')),
  entity_id INTEGER,
  reason TEXT NOT NULL,
  details TEXT,
  reporter_email TEXT,
  user_id INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewer_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== Revendication des fiches (églises d'abord, extensible) =====
CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL DEFAULT 'church' CHECK (entity_type IN ('church','directory','profile')),
  entity_id INTEGER NOT NULL,
  user_id INTEGER,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  role_in_entity TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  reviewer_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== Pays couverts / activation progressive =====
CREATE TABLE IF NOT EXISTS countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== Audit des imports de données =====
CREATE TABLE IF NOT EXISTS import_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  country TEXT,
  iso TEXT,
  file_name TEXT,
  raw_candidates INTEGER DEFAULT 0,
  duplicates_removed INTEGER DEFAULT 0,
  records_ready INTEGER DEFAULT 0,
  inserted_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validated','imported','rejected')),
  report_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== Index utiles =====
CREATE INDEX IF NOT EXISTS idx_churches_status ON churches(status);
CREATE INDEX IF NOT EXISTS idx_churches_source_ref ON churches(source, source_ref);
CREATE INDEX IF NOT EXISTS idx_churches_claimed_by ON churches(claimed_by);
CREATE INDEX IF NOT EXISTS idx_directory_status ON directory_entries(status);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON reports(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_claims_entity ON claims(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_import_runs_status ON import_runs(status);
