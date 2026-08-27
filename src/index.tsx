import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import media from './routes/media'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// CORS pour les appels API
app.use('/api/*', cors())

// Fichiers statiques (public/static/* → /static/*)
app.use('/static/*', serveStatic({ root: './public' }))

// Routes API
app.route('/api/media', media)

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'christici' }))

// Renderer JSX pour les pages HTML
app.use(renderer)

// Page d'accueil
app.get('/', (c) => {
  return c.render(
    <>
      {/* ===== Navigation ===== */}
      <header id="site-header" class="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <nav class="max-w-6xl mx-auto flex items-center justify-between px-5 py-4" aria-label="Navigation principale">
          <a href="/" class="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">
            Christici
          </a>
          <button id="nav-toggle" class="md:hidden text-slate-300 hover:text-white text-xl" aria-label="Ouvrir le menu" aria-expanded="false">
            <i class="fas fa-bars"></i>
          </button>
          <ul id="nav-menu" class="hidden md:flex flex-col md:flex-row absolute md:static top-full left-0 right-0 bg-slate-950 md:bg-transparent border-b md:border-0 border-slate-800 gap-1 md:gap-7 px-5 py-4 md:p-0 text-sm font-medium text-slate-300">
            <li><a href="#videos" class="nav-link">Vidéos</a></li>
            <li><a href="#musique" class="nav-link">Musique</a></li>
            <li><a href="#images" class="nav-link">Images</a></li>
            <li><a href="#articles" class="nav-link">Articles</a></li>
            <li><a href="#a-propos" class="nav-link">À propos</a></li>
          </ul>
        </nav>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section id="hero-section" class="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="relative z-10 max-w-3xl mx-auto text-center px-5 pt-24 pb-16">
            <p class="text-teal-400 font-semibold tracking-widest uppercase text-sm mb-4">
              Plateforme multimédia
            </p>
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Bienvenue sur{' '}
              <span class="bg-gradient-to-r from-teal-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Christici
              </span>
            </h1>
            <p class="text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
              Un espace unique pour découvrir et partager des vidéos, de la musique,
              des images et des articles. Un contenu vivant, une expérience soignée.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#videos" class="btn-primary">
                <i class="fas fa-play mr-2"></i>Explorer les contenus
              </a>
              <a href="#a-propos" class="btn-secondary">
                En savoir plus
              </a>
            </div>
          </div>
          <a href="#presentation" class="absolute bottom-8 text-slate-500 hover:text-teal-400 transition-colors animate-bounce" aria-label="Défiler vers le bas">
            <i class="fas fa-chevron-down text-xl"></i>
          </a>
        </section>

        {/* ===== Présentation ===== */}
        <section id="presentation" class="max-w-6xl mx-auto px-5 py-20">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="section-title">Qu'est-ce que Christici&nbsp;?</h2>
              <p class="text-slate-400 leading-relaxed mb-4">
                Christici est une plateforme multimédia moderne qui rassemble quatre
                formes de création : la vidéo, la musique, l'image et l'écrit.
              </p>
              <p class="text-slate-400 leading-relaxed mb-6">
                Conçue pour être rapide, élégante et accessible sur tous les écrans,
                elle évoluera au fil du temps avec de nouveaux contenus et de
                nouvelles fonctionnalités.
              </p>
              <ul class="space-y-3 text-slate-300">
                <li class="flex items-start gap-3">
                  <i class="fas fa-bolt text-teal-400 mt-1"></i>
                  <span>Rapide et accessible partout dans le monde</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="fas fa-layer-group text-teal-400 mt-1"></i>
                  <span>Architecture évolutive : frontend, API et base de données</span>
                </li>
                <li class="flex items-start gap-3">
                  <i class="fas fa-mobile-screen text-teal-400 mt-1"></i>
                  <span>Design responsive, du mobile au grand écran</span>
                </li>
              </ul>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="pillar-card">
                <i class="fas fa-video text-3xl text-teal-400 mb-3"></i>
                <h3 class="font-semibold">Vidéos</h3>
                <p class="text-sm text-slate-400">Films, extraits et créations en mouvement</p>
              </div>
              <div class="pillar-card">
                <i class="fas fa-music text-3xl text-violet-400 mb-3"></i>
                <h3 class="font-semibold">Musique</h3>
                <p class="text-sm text-slate-400">Compositions et univers sonores</p>
              </div>
              <div class="pillar-card">
                <i class="fas fa-image text-3xl text-cyan-400 mb-3"></i>
                <h3 class="font-semibold">Images</h3>
                <p class="text-sm text-slate-400">Photographies et séries visuelles</p>
              </div>
              <div class="pillar-card">
                <i class="fas fa-pen-nib text-3xl text-amber-400 mb-3"></i>
                <h3 class="font-semibold">Articles</h3>
                <p class="text-sm text-slate-400">Textes, réflexions et coulisses</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Sections multimédia (remplies dynamiquement via l'API) ===== */}
        <section id="videos" class="media-section">
          <div class="max-w-6xl mx-auto px-5">
            <div class="section-header">
              <h2 class="section-title"><i class="fas fa-video mr-3 text-teal-400"></i>Vidéos</h2>
              <p class="text-slate-500">Les dernières créations vidéo</p>
            </div>
            <div id="videos-grid" class="media-grid" data-type="video">
              <div class="media-loading"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
        </section>

        <section id="musique" class="media-section media-section-alt">
          <div class="max-w-6xl mx-auto px-5">
            <div class="section-header">
              <h2 class="section-title"><i class="fas fa-music mr-3 text-violet-400"></i>Musique</h2>
              <p class="text-slate-500">Titres et compositions</p>
            </div>
            <div id="musique-grid" class="media-grid" data-type="music">
              <div class="media-loading"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
        </section>

        <section id="images" class="media-section">
          <div class="max-w-6xl mx-auto px-5">
            <div class="section-header">
              <h2 class="section-title"><i class="fas fa-image mr-3 text-cyan-400"></i>Images</h2>
              <p class="text-slate-500">Séries photographiques et visuels</p>
            </div>
            <div id="images-grid" class="media-grid" data-type="image">
              <div class="media-loading"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
        </section>

        <section id="articles" class="media-section media-section-alt">
          <div class="max-w-6xl mx-auto px-5">
            <div class="section-header">
              <h2 class="section-title"><i class="fas fa-pen-nib mr-3 text-amber-400"></i>Articles</h2>
              <p class="text-slate-500">Textes et réflexions</p>
            </div>
            <div id="articles-grid" class="media-grid" data-type="article">
              <div class="media-loading"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
        </section>

        {/* ===== À propos / contact ===== */}
        <section id="a-propos" class="max-w-3xl mx-auto px-5 py-24 text-center">
          <h2 class="section-title mb-6">À propos</h2>
          <p class="text-slate-400 leading-relaxed mb-8">
            Christici est en construction. Cette première version pose les bases
            d'une plateforme qui grandira avec ses contenus et ses visiteurs.
            Revenez régulièrement pour découvrir les nouveautés.
          </p>
          <div class="inline-flex items-center gap-2 text-sm text-slate-500 border border-slate-800 rounded-full px-5 py-2">
            <i class="fas fa-globe text-teal-400"></i>
            Bientôt disponible sur <span class="text-slate-300 font-medium">christici.com</span>
          </div>
        </section>
      </main>

      {/* ===== Pied de page ===== */}
      <footer class="border-t border-slate-800/60 py-10">
        <div class="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            <span class="font-bold bg-gradient-to-r from-teal-400 to-violet-400 bg-clip-text text-transparent">Christici</span>
            {' '}© {new Date().getFullYear()} — Tous droits réservés
          </p>
          <ul class="flex gap-6">
            <li><a href="#videos" class="hover:text-teal-400 transition-colors">Vidéos</a></li>
            <li><a href="#musique" class="hover:text-teal-400 transition-colors">Musique</a></li>
            <li><a href="#images" class="hover:text-teal-400 transition-colors">Images</a></li>
            <li><a href="#articles" class="hover:text-teal-400 transition-colors">Articles</a></li>
          </ul>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      <script src="/static/app.js"></script>
    </>
  )
})

export default app
