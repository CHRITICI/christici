# Christici

> Annuaire mondial des églises chrétiennes — données réelles et vérifiables — *Jusqu'au bout du monde !*

## Project Overview
- **Name**: Christici — https://christici.com
- **Goal**: Répertorier les églises, organisations, profils et services chrétiens du monde entier sur une seule plateforme, en commençant par le Togo, avec des **données réelles et vérifiables uniquement** (règle absolue : aucune donnée inventée).
- **Stack**: Hono + TypeScript + Cloudflare Pages/Workers + D1 (SQLite) + TailwindCSS (CDN) + Leaflet (cartes OSM)

## Principe fondateur : données réelles uniquement
- **Source** : OpenStreetMap (extraits Geofabrik `.osm.pbf`, licence **ODbL 1.0** — attribution « © OpenStreetMap contributors » affichée sur le site).
- Chaque fiche porte un **statut** : `a_verifier` / `verifiee` / `signalee`, et sa **provenance** (`source` + `source_ref`, ex. `node/631716353`).
- Aucune fiche n'est créée sans nom réel ; les catégories vides affichent « en attente de contenu réel ».
- Pipeline d'import : `tools/import_osm.py` (pyosmium) — déduponnage, normalisation, rapport JSON ; `tools/prod_import.py` pour le chargement production par lots.

## Fonctionnalités terminées
- ✅ **Annuaire églises** : 1042 églises réelles du Togo (OSM), filtres pays/région/ville/confession/statut/mot-clé, géolocalisation, pagination
- ✅ **Carte interactive Leaflet** (tuiles OSM) sur la liste + embed OSM sur chaque fiche
- ✅ **Fiche détaillée** `/eglises/:slug` : statut, provenance ODbL, carte, Signaler une erreur, Revendiquer la fiche
- ✅ **Comptes utilisateurs** : inscription/connexion (PBKDF2 100k itérations via Web Crypto, sessions 14 j, cookie httpOnly/secure/Lax)
- ✅ **Signalements** (`/api/reports`) et **revendications de fiches** (`/api/claims`) avec modération
- ✅ **Back-office admin** `/admin` : statistiques, CRUD 8 entités, signalements, revendications (approbation → fiche vérifiée), inscriptions, pays, utilisateurs, détection de doublons (nom+ville / géo)
- ✅ Organisations, profils, affaires, infos (événements/nouvelles/emplois/publications), médias, recherche globale, inscription publique, SEO complet

## URLs (API)
- `GET /api/churches` — filtres : `country, region, city, district, denomination, status, q, near=lat,lng, radius, page, limit`
- `GET /api/churches/:slug` · `/api/churches/filters`
- `GET /api/directory?status=` · `GET /api/profiles?status=`
- `POST /api/auth/register|login|logout` · `GET /api/auth/me`
- `POST /api/reports` · `POST /api/claims`
- `GET /api/admin/stats|list/:entity|reports|claims|submissions|countries|users|imports|duplicates/churches` (rôle admin requis)
- `GET /api/home` · `/api/search?q=` · `/api/infos/*` · `POST /api/submissions` · `GET /api/health`

## Data Architecture
- **Tables D1** : `churches`, `directory_entries`, `profiles`, `events`, `news`, `jobs`, `publications`, `media_items`, `categories`, `submissions` + `users`, `sessions`, `reports`, `claims`, `countries`, `import_runs` (migration 0003)
- **Statuts & provenance** : colonnes `status`, `source`, `source_ref`, `verified_at`, `claimed_by` sur les entités principales
- **Géolocalisation** : pré-filtre SQL (bounding box) + distance Haversine exacte en JS

## Données en production
- **Togo** : 1042 églises (OpenStreetMap/Geofabrik, ODbL) — toutes au statut « À vérifier », en attente de validation communautaire
- Autres entités : vides en production (« en attente de contenu réel ») — les données de démonstration ne sont chargées qu'en environnement local de test

## Non implémenté (prochaines étapes)
- ⬜ Extension pays par pays (prochain pays à valider avec l'utilisateur)
- ⬜ Fiches détaillées organisations/profils
- ⬜ Upload de fichiers (R2), Tailwind en build local
- ⬜ Vérification de masse des fiches (workflow communautaire)

## Dev local (sandbox)
```bash
npm run build
npx wrangler d1 migrations apply christici-production --local
pm2 start ecosystem.config.cjs   # wrangler pages dev dist --d1 --local :3000
```

## Deployment
- **Platform**: Cloudflare (hébergement géré Genspark, Workers for Platform)
- **Status**: ✅ Actif — https://christici.com (custom domain lié)
- **Compte admin**: `admin@christici.com` (mot de passe communiqué une seule fois à l'utilisateur, jamais commité)
- **Last Updated**: 2026-08-28
