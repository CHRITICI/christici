# Christici

## Project Overview
- **Name**: Christici
- **Goal**: Plateforme multimédia moderne réunissant vidéos, musique, images et articles — destinée à être publiée sur **christici.com**.
- **Features**: Page d'accueil responsive, navigation claire, sections multimédia alimentées par API, base de données D1.

## URLs
- **Production**: pas encore déployé (cible : https://christici.com)
- **API (local)**: http://localhost:3000/api/media, /api/media/home, /api/media/:slug, /api/health

## Fonctionnalités terminées
- ✅ Page d'accueil responsive (mobile → desktop) : hero, présentation, 4 sections multimédia, à propos, footer
- ✅ Navigation fixe avec menu mobile (hamburger)
- ✅ API REST Hono : liste par type, agrégat page d'accueil, détail par slug
- ✅ Base de données Cloudflare D1 (SQLite) avec migrations et données d'exemple génériques
- ✅ Cartes média dynamiques (miniature, badge type, mise en avant, métadonnées)

## Fonctionnalités non encore implémentées
- ⬜ Pages de détail pour chaque contenu (lecture vidéo/audio, article complet, galerie)
- ⬜ Interface d'administration pour publier/modifier des contenus
- ⬜ Upload de fichiers média (R2)
- ⬜ Recherche et filtrage par tags
- ⬜ Déploiement en production + domaine christici.com

## Prochaines étapes recommandées
1. Créer la base D1 de production (`npx wrangler d1 create christici-production`) et renseigner `database_id` dans `wrangler.jsonc`
2. Déployer sur Cloudflare Pages puis lier le domaine **christici.com**
3. Ajouter les pages de détail (`/media/:slug`)
4. Mettre en place un espace d'administration protégé

## Data Architecture
- **Data Models**: table unique `media_items` (type polymorphe : `video` | `music` | `image` | `article`) — titre, slug, description, thumbnail_url, media_url, body (articles), metadata (JSON : durée, genre, tags…), featured, published
- **Storage Services**: Cloudflare D1 (SQLite distribué) ; R2 prévu pour les fichiers média
- **Data Flow**: Frontend (axios) → API Hono (`/api/media/*`) → D1 → rendu dynamique des cartes

## Structure du projet
```
webapp/
├── src/
│   ├── index.tsx        # Entrée Hono + page d'accueil JSX
│   ├── renderer.tsx     # Layout HTML global
│   ├── types.ts         # Types TypeScript partagés
│   └── routes/media.ts  # Routes API /api/media
├── public/static/       # app.js + style.css (servis en /static/*)
├── migrations/          # Migrations D1
├── seed.sql             # Données d'exemple (génériques)
├── ecosystem.config.cjs # Config PM2 (dev sandbox)
└── wrangler.jsonc       # Config Cloudflare (binding D1)
```

## User Guide
- **Dev local (sandbox)** : `npm run build` puis `pm2 start ecosystem.config.cjs`
- **Base locale** : `npm run db:migrate:local` puis `npm run db:seed`
- **Tester** : `curl http://localhost:3000/api/health`

## Deployment
- **Platform**: Cloudflare Pages (Hono + TypeScript + TailwindCSS via CDN)
- **Status**: ❌ Pas encore déployé — prêt pour une première mise en ligne
- **Domaine cible**: christici.com (à configurer dans Cloudflare Pages → Custom domains)
- **Secrets**: aucun — aucune clé ni donnée personnelle dans le dépôt
- **Last Updated**: 2026-08-27
