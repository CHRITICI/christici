import { jsxRenderer } from 'hono/jsx-renderer'

export interface LayoutProps {
  title?: string
  description?: string
  currentPath?: string
}

const NAV_ITEMS = [
  { href: '/', label: 'Accueil' },
  { href: '/eglises', label: 'Églises' },
  { href: '/organisations', label: 'Organisations' },
  { href: '/profils', label: 'Profils' },
  { href: '/affaires', label: 'Affaires' },
  { href: '/infos', label: 'Infos' },
  { href: '/medias', label: 'Médias' },
  { href: '/a-propos', label: 'À propos' },
]

function isActive(currentPath: string, href: string): boolean {
  if (href === '/') return currentPath === '/'
  return currentPath.startsWith(href)
}

export const renderer = jsxRenderer(
  ({ children }, c) => {
    const props = (c.get('layoutProps') || {}) as LayoutProps
    const title = props.title ? `${props.title} — Christici` : 'Christici — Le 1er site 100% chrétien au Togo'
    const description =
      props.description ||
      "Christici est la plateforme chrétienne qui référence églises, organisations, profils et services chrétiens au Togo et au-delà. Jusqu'au bout du monde !"
    const currentPath = props.currentPath || new URL(c.req.url).pathname
    const canonical = `https://christici.com${currentPath}`

    return (
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonical} />
          <link rel="icon" type="image/png" href="/static/images/favicon.png" />
          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Christici" />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:url" content={canonical} />
          <meta property="og:image" content="https://christici.com/static/images/og-image.jpg" />
          <meta name="twitter:card" content="summary_large_image" />
          {/* Libs */}
          <script src="https://cdn.tailwindcss.com"></script>
          <link
            href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
            rel="stylesheet"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800;900&display=swap"
            rel="stylesheet"
          />
          <link href="/static/style.css" rel="stylesheet" />
        </head>
        <body class="bg-slate-50 text-slate-800 font-sans antialiased flex flex-col min-h-screen">
          <a href="#main-content" class="skip-link">Aller au contenu principal</a>
          {/* ===== Bandeau slogan ===== */}
          <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white text-center text-xs sm:text-sm py-1.5 px-4 font-medium tracking-wide">
            Le 1<sup>er</sup> site 100% chrétien au Togo — <span class="italic">Jusqu'au bout du monde&nbsp;!</span>
          </div>

          {/* ===== Navigation ===== */}
          <header id="site-header" class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <nav class="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3" aria-label="Navigation principale">
              <a href="/" class="flex-shrink-0" aria-label="Christici — Accueil">
                <img src="/static/images/logo.png" alt="Christici" class="h-9 sm:h-11 w-auto" />
              </a>
              {/* Recherche dans le header (desktop/tablette) — recherche au centre */}
              <form action="/recherche" method="get" class="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm" role="search">
                <div class="relative w-full">
                  <input
                    type="search"
                    name="q"
                    placeholder="Rechercher une église, une ville…"
                    aria-label="Rechercher sur Christici"
                    class="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button type="submit" class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-blue-700" aria-label="Lancer la recherche">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </form>
              <ul class="hidden lg:flex items-center gap-1 text-sm font-medium">
                {NAV_ITEMS.map((item) => (
                  <li>
                    <a
                      href={item.href}
                      class={`nav-link px-3 py-2 rounded-lg ${isActive(currentPath, item.href) ? 'active' : ''}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div class="flex items-center gap-2">
                <a href="/recherche" class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors" aria-label="Rechercher">
                  <i class="fas fa-search"></i>
                </a>
                <a href="/compte" class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors" aria-label="Mon compte">
                  <i class="fas fa-user-circle"></i>
                </a>
                <a href="/inscription" class="hidden sm:inline-flex btn-cta text-sm px-4 py-2">
                  <i class="fas fa-user-plus mr-2"></i>S'inscrire
                </a>
                <button id="nav-toggle" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Ouvrir le menu" aria-expanded="false">
                  <i class="fas fa-bars text-xl"></i>
                </button>
              </div>
            </nav>
            {/* Menu mobile */}
            <div id="nav-menu" class="hidden lg:hidden border-t border-slate-100 bg-white">
              <ul class="px-4 py-3 space-y-1 text-sm font-medium">
                <li class="pb-2">
                  <form action="/recherche" method="get" class="flex items-center gap-2" role="search">
                    <input
                      type="search"
                      name="q"
                      placeholder="Rechercher…"
                      aria-label="Rechercher sur Christici"
                      class="flex-1 min-w-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" class="btn-primary-sm flex-shrink-0" aria-label="Lancer la recherche">
                      <i class="fas fa-search"></i>
                    </button>
                  </form>
                </li>
                {NAV_ITEMS.map((item) => (
                  <li>
                    <a
                      href={item.href}
                      class={`block px-4 py-3 rounded-lg ${isActive(currentPath, item.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li class="pt-2 flex gap-2">
                  <a href="/compte" class="btn-ghost-sm flex-1 justify-center text-sm">
                    <i class="fas fa-user-circle mr-2"></i>Mon compte
                  </a>
                  <a href="/inscription" class="btn-cta flex-1 justify-center text-sm">
                    <i class="fas fa-user-plus mr-2"></i>S'inscrire
                  </a>
                </li>
              </ul>
            </div>
          </header>

          <main id="main-content" class="flex-1">{children}</main>

          {/* ===== Pied de page ===== */}
          <footer class="bg-slate-900 text-slate-300 mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <img src="/static/images/logo.png" alt="Christici" class="h-10 w-auto bg-white rounded-lg px-3 py-1.5 mb-4" />
                <p class="text-sm leading-relaxed text-slate-400">
                  Christici révèle l'environnement chrétien au monde : églises, organisations, profils et services réunis sur une seule plateforme.
                </p>
                <p class="text-sm mt-3 italic text-blue-300">Jusqu'au bout du monde&nbsp;!</p>
              </div>
              <nav aria-label="Annuaire">
                <h4 class="footer-title">Annuaire</h4>
                <ul class="space-y-2 text-sm">
                  <li><a href="/eglises" class="footer-link">Trouver une église</a></li>
                  <li><a href="/organisations" class="footer-link">Organisations chrétiennes</a></li>
                  <li><a href="/profils" class="footer-link">Profils chrétiens</a></li>
                  <li><a href="/affaires" class="footer-link">Affaires chrétiennes</a></li>
                </ul>
              </nav>
              <nav aria-label="Contenus">
                <h4 class="footer-title">Contenus</h4>
                <ul class="space-y-2 text-sm">
                  <li><a href="/infos" class="footer-link">Événements</a></li>
                  <li><a href="/infos#nouvelles" class="footer-link">Nouvelles</a></li>
                  <li><a href="/infos#emplois" class="footer-link">Offres d'emploi</a></li>
                  <li><a href="/infos#publications" class="footer-link">Publications</a></li>
                  <li><a href="/medias" class="footer-link">Vidéos, musique, images, articles</a></li>
                </ul>
              </nav>
              <nav aria-label="Christici">
                <h4 class="footer-title">Christici</h4>
                <ul class="space-y-2 text-sm">
                  <li><a href="/a-propos" class="footer-link">Qui sommes-nous&nbsp;?</a></li>
                  <li><a href="/inscription" class="footer-link">Comment s'inscrire&nbsp;?</a></li>
                  <li><a href="/recherche" class="footer-link">Recherche globale</a></li>
                </ul>
              </nav>
            </div>
            <div class="border-t border-slate-800 py-5">
              <p class="text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Christici — christici.com — Tous droits réservés
              </p>
            </div>
          </footer>

          <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
          <script src="/static/app.js"></script>
        </body>
      </html>
    )
  }
)
