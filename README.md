# Christici

> Le 1er site 100% chrétien au Togo — *Jusqu'au bout du monde !*

## Project Overview
- **Name**: Christici — https://christici.com
- **Goal**: Révéler l'environnement chrétien au monde : répertorier les Églises, organisations, profils et services chrétiens sur une seule plateforme (annuaire + médias + infos), en démarrant par le Togo, conçue pour s'étendre à d'autres pays.
- **Stack**: Hono + TypeScript + Cloudflare Pages + D1 (SQLite) + TailwindCSS (CDN)

## Fonctionnalités terminées
- ✅ **Accueil** : hero, recherche rapide, statistiques, catégories, églises/organisations/profils mis en avant, événements, nouvelles, médias, CTA inscription
- ✅ **Trouver une église** : filtres région / ville / confession / mot-clé + **géolocalisation** (« autour de ma position », non bloquante si refusée) + pagination
- ✅ **Organisations chrétiennes** : associations, bibliothèques, instituts bibliques, centres & camps de prière, formations musicales (15 catégories)
- ✅ **Profils chrétiens** : musiciens, sociologues, groupes musicaux (architecture extensible)
- ✅ **Affaires chrétiennes** : microfinances, hôpitaux, bars sans alcool, restaurants, librairies, studios
- ✅ **Infos** : événements, nouvelles, offres d'emploi, publications
- ✅ **Médias** : vidéos, musique, images, articles (onglets)
- ✅ **Recherche globale** sur toutes les entités
- ✅ **Inscription** : formulaire public de demande (table `submissions`, modération prévue)
- ✅ **SEO** : title/meta par page, Open Graph, favicon logo officiel, canonical, robots.txt, sitemap.xml, page 404
- ✅ **Identité visuelle** : logo Christici officiel, charte bleu/orange inspirée des documents historiques

## URLs (API)
- `GET /api/home` — agrégat page d'accueil (+ stats)
- `GET /api/churches` — filtres : `country, region, city, district, denomination, q, near=lat,lng, radius, page, limit`
- `GET /api/churches/filters` · `GET /api/churches/:slug`
- `GET /api/directory?grp=organisation|affaire&category=&city=&q=` · `/categories` · `/:slug`
- `GET /api/profiles?category=&city=&available=1&q=` · `/:slug`
- `GET /api/infos/events|news|jobs|publications` (+ `/events/:slug`, `/news/:slug`)
- `GET /api/search?q=` — recherche globale
- `POST /api/submissions` — demande d'inscription `{kind, name, contact, category?, city?, message?}`
- `GET /api/health`

## Data Architecture
- **Tables D1** : `media_items` (vidéos/musique/images/articles), `categories` (15 catégories, 3 groupes), `churches` (géolocalisées, multi-pays), `directory_entries` (organisations & affaires), `profiles`, `events`, `news`, `jobs`, `publications`, `submissions`
- **Index** : région, ville, quartier, confession, pays, catégorie, dates, featured/published
- **Géolocalisation** : pré-filtre SQL (bounding box) + distance Haversine exacte en JS (D1 n'autorise pas les fonctions math SQL)
- **Données** : entrées de **démonstration** clairement marquées « (démo) » — aucune institution réelle

## Non implémenté (prochaines étapes)
- ⬜ Pages fiches détaillées (`/eglises/:slug`, fiche organisation/profil) avec carte
- ⬜ Back-office d'administration sécurisé (validation des inscriptions, CRUD contenus)
- ⬜ Comptes utilisateurs & modification de fiche par le propriétaire
- ⬜ Carte interactive (Leaflet) et upload de fichiers (R2)
- ⬜ Tailwind en build local (remplacer le CDN avant montée en charge)
- ⬜ Déploiement production + domaine christici.com

## Dev local (sandbox)
```bash
npm run build
npx wrangler d1 migrations apply christici-production --local
npx wrangler d1 execute christici-production --local --file=./seed.sql
npx wrangler d1 execute christici-production --local --file=./seed_directory.sql
pm2 start ecosystem.config.cjs   # wrangler pages dev dist --d1 --local :3000
```

## Deployment
- **Platform**: Cloudflare Pages · **Status**: ❌ Pas encore déployé (en attente du choix du chemin : hébergement Genspark ou compte Cloudflare propre)
- **Domaine cible**: christici.com · **Secrets**: aucun dans le dépôt
- **Last Updated**: 2026-08-27
