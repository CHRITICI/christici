# AGENTS.md — Guide de reprise pour agents IA

Ce document permet à **n'importe quelle IA de développement** de reprendre intégralement
le projet Christici sans contexte préalable. Lisez-le en entier avant de modifier quoi
que ce soit.

---

## 1. Qu'est-ce que Christici ?

**Christici** (https://christici.com) est un **annuaire mondial des églises chrétiennes**
basé sur des **données réelles et vérifiables uniquement**. Le projet démarre par le
Togo et s'étend pays par pays.

### Règles absolues du projet (imposées par le propriétaire)

1. **AUCUNE donnée inventée** — ne jamais créer de noms, adresses, téléphones,
   responsables, horaires, coordonnées GPS ou sites web fictifs. **Jamais.**
2. **Aucune donnée de démonstration en production.** Les seeds démo
   (`seed.sql`, `seed_directory.sql`) sont réservés à l'environnement **local de test**.
3. **Avant toute insertion massive de données en production**, présenter à
   l'utilisateur : la source utilisée, le nombre d'enregistrements prévus et le pays
   concerné — et **attendre sa validation explicite**.
4. Chaque fiche porte un **statut** (`a_verifier` / `verifiee` / `signalee`) et sa
   **provenance** (`source` + `source_ref`). Ne jamais les supprimer.
5. Si aucune donnée réelle n'est disponible pour une catégorie → afficher **zéro
   résultat** / « en attente de contenu réel », jamais du faux contenu.
6. **Ne supprimer aucune fonctionnalité sans sauvegarde** ; committer avant chaque
   modification importante.
7. Sécurité : **jamais de clé API ou mot de passe dans le code ou le dépôt**.

### Source de données : OpenStreetMap

- **Source unique actuelle** : OpenStreetMap via extraits **Geofabrik** (`.osm.pbf`),
  licence **ODbL 1.0**. L'attribution « © OpenStreetMap contributors » est
  **obligatoire** et déjà affichée sur le site — la conserver.
- L'API Overpass est inaccessible depuis le sandbox Genspark (timeouts) → toujours
  utiliser les extraits Geofabrik téléchargeables.
- Pipeline d'import : `tools/import_osm.py` (voir §7).

---

## 2. Stack technique

| Couche | Technologie |
|---|---|
| Backend | **Hono 4** + TypeScript + JSX (SSR) |
| Plateforme | **Cloudflare Pages/Workers** (hébergement géré Genspark, Workers for Platform) |
| Base de données | **Cloudflare D1** (SQLite) |
| Build | Vite → `dist/_worker.js` |
| Frontend | Tailwind CSS (CDN), Font Awesome (CDN), Axios (CDN), **Leaflet 1.9.4** (CDN) + tuiles OSM |
| Auth | PBKDF2 maison via Web Crypto (voir §5) |
| Dev sandbox | PM2 + `wrangler pages dev dist --d1 --local` sur le port 3000 |

### Contraintes Cloudflare Workers (critiques)

- **Pas d'API Node.js** au runtime (`fs`, `path`, `crypto` Node, `child_process`…).
  Utiliser les Web APIs (Fetch, Web Crypto).
- Fichiers statiques : obligatoirement via `serveStatic` de **`hono/cloudflare-workers`**
  (jamais `@hono/node-server`), fichiers dans `public/static/` servis sous `/static/*`.
- Hébergement géré Genspark : bindings supportés = **1 D1 + 1 R2 max** (auto-provisionnés).
  **KV et `triggers` (cron) NON supportés** — ne jamais les ajouter à `wrangler.jsonc`.
- `db.batch()` ne fonctionne **pas** avec `.first()` — utiliser des sous-requêtes SQL
  scalaires dans une seule requête (voir `GET /api/admin/stats` dans `src/routes/admin.ts`).

---

## 3. Structure du projet

```
webapp/
├── src/
│   ├── index.tsx            # Entrée Hono : routes, authMiddleware, pages SSR
│   ├── renderer.tsx         # Layout JSX global (header nav, footer)
│   ├── types.ts             # Types TS + AppVariables { user }
│   ├── lib/
│   │   └── auth.ts          # PBKDF2, sessions, cookies, requireAuth/requireAdmin
│   ├── routes/              # API (Hono)
│   │   ├── churches.ts      # /api/churches (+ filtre ?status=)
│   │   ├── directory.ts     # /api/directory (organisations & affaires)
│   │   ├── profiles.ts      # /api/profiles
│   │   ├── infos.ts         # /api/infos (events/news/jobs/publications)
│   │   ├── media.ts         # /api/media
│   │   ├── home.ts          # /api/home (agrégat accueil + stats)
│   │   ├── search.ts        # /api/search (recherche globale)
│   │   ├── submissions.ts   # POST /api/submissions (inscription publique)
│   │   ├── auth.ts          # /api/auth register/login/logout/me
│   │   ├── reports.ts       # POST /api/reports + /api/claims
│   │   └── admin.ts         # /api/admin/* (back-office, requireAdmin)
│   └── pages/               # Pages SSR (JSX)
│       ├── home.tsx         # /
│       ├── eglises.tsx      # /eglises (liste + carte Leaflet + filtres)
│       ├── eglise-detail.tsx# /eglises/:slug (fiche + carte OSM + report/claim)
│       ├── directory.tsx    # /organisations, /affaires
│       ├── infos.tsx        # /infos/*
│       ├── medias.tsx       # /medias
│       ├── search.tsx       # /recherche
│       ├── inscription.tsx  # /inscription
│       ├── account.tsx      # /compte (login/register/session)
│       ├── admin.tsx        # /admin (shell back-office, 13 onglets)
│       └── about.tsx        # /a-propos
├── public/static/
│   ├── app.js               # JS partagé (statusBadge, churchCard…)
│   ├── style.css            # CSS custom (badges, modales, admin…)
│   ├── images/              # Logo Christici etc.
│   └── pages/               # JS spécifique par page (account/admin/eglise-detail…)
├── migrations/              # Migrations D1 incrémentales (ordre = préfixe)
│   ├── 0001_initial_schema.sql
│   ├── 0002_directory_schema.sql
│   └── 0003_real_data_platform.sql  # statuts, provenance, users, sessions,
│                                    # reports, claims, countries, import_runs
├── tools/
│   ├── import_osm.py        # Pipeline Geofabrik PBF → SQL (dry-run, déduponnage)
│   └── prod_import.py       # Chargement production par lots via gsk hosted d1_execute
├── seed.sql                 # DONNÉES DÉMO — LOCAL UNIQUEMENT, jamais en production
├── seed_directory.sql       # DONNÉES DÉMO — LOCAL UNIQUEMENT
├── wrangler.jsonc           # name=christici, 1 binding D1 (DB)
├── ecosystem.config.cjs     # PM2 : wrangler pages dev dist --d1 --local :3000
└── package.json
```

---

## 4. Modèle de données (D1)

### Entités de contenu (9 tables, migration 0001/0002)
`churches`, `directory_entries` (organisations + affaires), `profiles`, `events`,
`news`, `jobs`, `publications`, `media_items`, `categories` + `submissions`.

### Colonnes ajoutées par la migration 0003 (sur churches/directory_entries/profiles)
- `status` TEXT NOT NULL DEFAULT `'a_verifier'` — valeurs : `a_verifier` | `verifiee` | `signalee`
- `source` TEXT (ex. `'OpenStreetMap'`)
- `source_ref` TEXT (ex. `'node/631716353'` ou `'way/123456'`)
- `verified_at` DATETIME (renseigné automatiquement quand status → `verifiee`)
- `claimed_by` INTEGER (churches uniquement — FK users.id)

### Tables plateforme (migration 0003)
- `users` : id, email UNIQUE, name, password_hash, role (`user` | `admin`)
- `sessions` : token PK (64 hex = 256 bits), user_id FK CASCADE, expires_at (14 jours)
- `reports` : signalements d'erreur (entity_type enum 9 valeurs, status pending/resolved/rejected)
- `claims` : revendications de fiches (entity_type church/directory/profile,
  status pending/approved/rejected — une seule pending par fiche)
- `countries` : code ISO-2 PK, name, enabled, priority (pilotage de l'extension mondiale)
- `import_runs` : journal des imports (source, country, iso, volumes, status
  draft/validated/imported/rejected, report_json)

---

## 5. Authentification (maison, Workers-compatible)

Implémentation dans `src/lib/auth.ts` :

- **PBKDF2** : 100 000 itérations, SHA-256, sel 128 bits, via **Web Crypto natif**
  (`crypto.subtle`). Format stocké : `pbkdf2$iter$salt_hex$hash_hex`.
- Comparaison à **temps constant** (anti timing attack).
- **Sessions** : token aléatoire 32 octets (64 hex), stocké en BDD avec expiration
  14 jours. Cookie `christici_session` : **httpOnly + secure + sameSite=Lax**.
- Middlewares Hono :
  - `authMiddleware` : charge `c.var.user` depuis le cookie (appliqué sur `/api/*`)
  - `requireAuth` : 401 si non connecté
  - `requireAdmin` : 403 si `role !== 'admin'` (appliqué sur tout `/api/admin/*`)
- Compte admin production : `admin@christici.com` (mot de passe communiqué une seule
  fois au propriétaire, **jamais commité**).

---

## 6. API — résumé des routes

### Publiques
- `GET /api/churches` — filtres : `country, region, city, district, denomination,
  status, q, near=lat,lng, radius, page, limit` (+ `/filters`, `/:slug`)
- `GET /api/directory?grp=organisation|affaire&category=&city=&status=&q=` (+ `/categories`, `/:slug`)
- `GET /api/profiles?category=&city=&available=1&status=&q=` (+ `/:slug`)
- `GET /api/infos/events|news|jobs|publications` (+ `/:slug` pour events/news)
- `GET /api/home` · `GET /api/search?q=` · `GET /api/health`
- `POST /api/submissions` — demande d'inscription publique

### Auth
- `POST /api/auth/register` `{name, email, password}` → 201 + session (409 si doublon email)
- `POST /api/auth/login` `{email, password}` → 200 + session (401 générique « Identifiants incorrects »)
- `POST /api/auth/logout` · `GET /api/auth/me`

### Contribution
- `POST /api/reports` `{entity_type, entity_id, reason, details?, reporter_email?}`
- `POST /api/claims` `{entity_type, entity_id, contact_name, contact_email, …}`
  (409 si une revendication est déjà en attente sur cette fiche)

### Admin (rôle admin requis) — `src/routes/admin.ts`
- `GET /api/admin/stats` — compteurs globaux (requête unique à sous-requêtes)
- `GET /api/admin/list/:entity` (+ `GET/POST/PUT/DELETE /api/admin/item/:entity[/:id]`)
  pour : churches, directory, profiles, events, news, jobs, publications, media
- `GET /api/admin/reports` + `POST /api/admin/reports/:id/resolve`
- `GET /api/admin/claims` + `POST /api/admin/claims/:id/review`
  (approve → fiche `verifiee` + `verified_at` + `claimed_by` pour churches)
- `GET /api/admin/submissions` + `POST /api/admin/submissions/:id/status`
- `GET/POST/DELETE /api/admin/countries`
- `GET /api/admin/users` + `POST /api/admin/users/:id/role` (anti auto-rétrogradation)
- `GET /api/admin/imports`
- `GET /api/admin/duplicates/churches` (doublons par nom+ville et par géo)

---

## 7. Import de données réelles (OpenStreetMap)

### Prérequis
```bash
pip install osmium   # pyosmium
# Télécharger l'extrait Geofabrik du pays, ex. Togo :
curl -L -o /tmp/togo.osm.pbf https://download.geofabrik.de/africa/togo-latest.osm.pbf
```

### Dry-run (TOUJOURS en premier)
```bash
python3 tools/import_osm.py --pbf /tmp/togo.osm.pbf --country Togo --iso TG \
  --out /tmp/import_togo.sql --report /tmp/report_togo.json --dry-run
```
Le rapport JSON indique : `raw_candidates`, `duplicates_removed`, `records_ready`,
`with_coordinates`, `with_phone`, `with_website`, `denominations`, `status_assigned`.

**→ Présenter ce rapport à l'utilisateur et ATTENDRE sa validation avant tout import
en production** (règle absolue n°3).

### Garanties du pipeline (`tools/import_osm.py`)
- Filtre `amenity=place_of_worship` + `religion=christian` (nodes + ways, centroïde
  moyen pour les ways).
- **Refuse toute fiche sans nom réel** (`len(name) < 2` → rejetée).
- Déduponnage : même `source_ref`, puis même nom normalisé à < ~110 m (0.001°).
- Normalisation : slug ASCII (NFKD), téléphone normalisé.
- Statut initial forcé : `a_verifier` ; provenance : `source='OpenStreetMap'`,
  `source_ref='node/<id>'` ou `'way/<id>'`.

### Chargement local (test)
```bash
npx wrangler d1 execute christici-production --local --file=/tmp/import_togo.sql
```

### Chargement production (après validation utilisateur uniquement)
```bash
python3 tools/prod_import.py --file /tmp/import_togo.sql --batch 100
```
(utilise `gsk hosted d1_execute` en subprocess — pas de souci d'échappement shell)

### Référence : import Togo (2026-08-28)
1051 candidats → 9 doublons retirés → **1042 églises réelles** (1042 GPS, 43 téléphones,
11 sites web ; dénominations : non précisée 547, roman_catholic 104, baptist 86,
catholic 83, evangelical 71, pentecostal 44, protestant 41…).

---

## 8. Développement local (sandbox Genspark)

```bash
cd /home/user/webapp
npm run build                                                # build → dist/
npx wrangler d1 migrations apply christici-production --local # migrations locales
# (optionnel, LOCAL UNIQUEMENT) données démo :
npx wrangler d1 execute christici-production --local --file=./seed.sql
npx wrangler d1 execute christici-production --local --file=./seed_directory.sql
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs                               # sert :3000
curl http://localhost:3000/api/health
pm2 logs webapp --nostream                                   # logs sans blocage
```

Comptes de test locaux : `admin@christici.dev` / `AdminLocal123!` (admin),
`test@christici.dev` / `motdepasse123` (user) — **locaux uniquement**.

---

## 9. Déploiement production (hébergement géré Genspark)

Le déploiement passe par le **skill `gsk-hosted-deploy`** (CLI `gsk hosted *`) :

```bash
cd /home/user/webapp && npm run build
gsk hosted deploy                       # → pending_approval (l'utilisateur approuve dans l'UI)
gsk hosted action_wait --id <id>        # attendre la décision (max 3 tentatives)
```

- Les **migrations SQL sont appliquées automatiquement** au déploiement (wrangler
  détecte les nouveaux fichiers `migrations/*.sql`).
- Commandes utiles : `gsk hosted d1_query --sql "SELECT …"` (lecture),
  `gsk hosted d1_execute --sql "INSERT/UPDATE/DELETE …"` (écriture directe),
  `gsk hosted d1_schema` (schéma), `gsk hosted worker_get` (URL),
  `gsk hosted custom_domain_status` (domaine).
- **Ne jamais** utiliser `wrangler login` / OAuth (ne fonctionne pas dans le sandbox).
- Ne jamais ajouter `kv_namespaces` ni `triggers` à `wrangler.jsonc` (rejetés par le
  pipeline hébergé).

---

## 10. Tests à effectuer après toute modification

1. `npm run build` → succès
2. Pages : `curl -o /dev/null -w "%{http_code}" http://localhost:3000/<route>` pour
   `/`, `/eglises`, `/eglises/<slug-existant>`, `/compte`, `/admin`, `/organisations`,
   `/infos`, `/medias`, `/recherche`, `/inscription` → attendus 200 (+ 404 propre sur
   un slug inexistant)
3. API : `/api/health`, `/api/churches`, `/api/churches?status=verifiee`, `/api/directory`,
   `/api/profiles`, `/api/search?q=test`, `/api/auth/me`
4. Cycle auth complet : register 201 → me → logout → login → me (cookies `-c`/`-b`)
5. Cycle modération (admin local) : report → resolve ; claim → review approve →
   vérifier `status=verifiee` + `verified_at` + `claimed_by`
6. Test navigateur (Playwright) sur l'URL publique du sandbox (localhost n'est pas
   joignable par le navigateur Playwright — utiliser l'URL fournie par GetServiceUrl) :
   absence d'erreurs JS autres que le warning connu « cdn.tailwindcss.com should not
   be used in production ».

---

## 11. État actuel et prochaines étapes

### En production (2026-08-28)
- christici.com actif ; **1042 églises réelles du Togo** (OSM, toutes `a_verifier`).
- Autres entités (organisations, profils, événements, nouvelles…) : **vides en
  production** par conception (« en attente de contenu réel »).

### Prochaines étapes recommandées
1. Extension pays par pays (prochain pays à valider avec l'utilisateur — même
   pipeline OSM/Geofabrik + rapport préalable).
2. Vérification communautaire des fiches togolaises (workflow claims/reports).
3. Fiches détaillées organisations/profils (sur le modèle de `eglise-detail.tsx`).
4. Upload de photos via R2 (binding supporté par l'hébergement géré).
5. Tailwind en build local (remplacer le CDN avant montée en charge).

### Ne pas faire
- ❌ Injecter des données sans validation préalable de l'utilisateur (rapport
  source/volume/pays).
- ❌ Remettre des données de démo en production.
- ❌ Exposer de clés/secrets dans le code, les pages publiques ou le dépôt.
- ❌ Supprimer les colonnes `status`/`source`/`source_ref` ou les désactiver.
- ❌ Utiliser l'API Overpass depuis le sandbox (timeouts) — utiliser Geofabrik.

---

## 12. Liens et références

- **Production** : https://christici.com
- **Dépôt GitHub** : https://github.com/CHRITICI/christici
- **Licence des données** : OpenStreetMap ODbL 1.0 — attribution
  « © OpenStreetMap contributors » obligatoire (déjà en place)
- **Extraits pays** : https://download.geofabrik.de/
- Hono : https://hono.dev · Cloudflare D1 : https://developers.cloudflare.com/d1/
- Leaflet : https://leafletjs.com · Tuiles OSM : https://wiki.openstreetmap.org/wiki/Tile_usage_policy
