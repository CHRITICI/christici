import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer, type LayoutProps } from './renderer'
import media from './routes/media'
import churches from './routes/churches'
import directory from './routes/directory'
import profiles from './routes/profiles'
import infos from './routes/infos'
import search from './routes/search'
import submissions from './routes/submissions'
import home from './routes/home'
import auth from './routes/auth'
import reports from './routes/reports'
import admin from './routes/admin'
import { authMiddleware } from './lib/auth'
import type { Bindings, AppVariables } from './types'
import { HomePage } from './pages/home'
import { EglisesPage } from './pages/eglises'
import { EgliseDetailPage } from './pages/eglise-detail'
import { DirectoryPage } from './pages/directory'
import { InfosPage } from './pages/infos'
import { MediasPage } from './pages/medias'
import { AboutPage } from './pages/about'
import { InscriptionPage } from './pages/inscription'
import { SearchPage } from './pages/search'
import { AccountPage } from './pages/account'
import { AdminPage } from './pages/admin'

const app = new Hono<{ Bindings: Bindings; Variables: AppVariables }>()

// CORS pour les appels API
app.use('/api/*', cors())

// Chargement de l'utilisateur courant (cookie de session) pour toutes les API
app.use('/api/*', authMiddleware)

// Fichiers statiques (public/static/* → /static/*)
app.use('/static/*', serveStatic({ root: './public' }))

// ===== Routes API =====
app.route('/api/home', home)
app.route('/api/media', media)
app.route('/api/churches', churches)
app.route('/api/directory', directory)
app.route('/api/profiles', profiles)
app.route('/api/infos', infos)
app.route('/api/search', search)
app.route('/api/submissions', submissions)
app.route('/api/auth', auth)
app.route('/api', reports) // /api/reports + /api/claims
app.route('/api/admin', admin)
app.get('/api/health', (c) => c.json({ status: 'ok', service: 'christici' }))

// SEO : robots.txt + sitemap.xml
app.get('/robots.txt', (c) => {
  return c.text(
    `User-agent: *\nAllow: /\nSitemap: https://christici.com/sitemap.xml\n`,
    200,
    { 'Content-Type': 'text/plain' }
  )
})

app.get('/sitemap.xml', async (c) => {
  const base = 'https://christici.com'
  const staticPages = ['/', '/eglises', '/organisations', '/profils', '/affaires', '/infos', '/medias', '/a-propos', '/inscription', '/recherche']
  const urls = staticPages
    .map((p) => `  <url><loc>${base}${p}</loc><changefreq>weekly</changefreq></url>`)
    .join('\n')
  return c.text(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    200,
    { 'Content-Type': 'application/xml' }
  )
})

// ===== Pages HTML (renderer JSX) =====
app.use(renderer)

function withLayout(c: { set: (k: string, v: unknown) => void }, props: LayoutProps) {
  c.set('layoutProps', props)
}

app.get('/', (c) => {
  withLayout(c, { title: undefined, currentPath: '/' })
  return c.render(<HomePage />)
})

app.get('/eglises', (c) => {
  withLayout(c, {
    title: 'Trouver une église',
    description: 'Trouvez une église au Togo par région, ville, quartier ou confession, ou autour de votre position.',
    currentPath: '/eglises',
  })
  return c.render(<EglisesPage />)
})

// Fiche détaillée d'une église (donnée réelle : statut, source, signalement, revendication)
app.get('/eglises/:slug', async (c) => {
  const slug = c.req.param('slug')
  const church = await c.env.DB
    .prepare('SELECT * FROM churches WHERE slug = ? AND published = 1')
    .bind(slug)
    .first<any>()
  if (!church) {
    withLayout(c, { title: 'Église introuvable', currentPath: '/eglises' })
    c.status(404)
    return c.render(
      <section class="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <i class="fas fa-church text-5xl text-blue-200 mb-6"></i>
        <h1 class="font-display text-3xl font-extrabold mb-4">Église introuvable</h1>
        <p class="text-slate-500 mb-8">Cette fiche n'existe pas, a été retirée ou n'est pas encore publiée.</p>
        <a href="/eglises" class="btn-primary-sm"><i class="fas fa-arrow-left mr-2"></i>Retour à l'annuaire</a>
      </section>
    )
  }
  withLayout(c, {
    title: church.name,
    description: (church.description || `${church.name} — église ${church.denomination || 'chrétienne'}${church.city ? ' à ' + church.city : ''}${church.country ? ', ' + church.country : ''}. Fiche Christici.`).slice(0, 300),
    currentPath: '/eglises',
  })
  return c.render(<EgliseDetailPage church={church} />)
})

app.get('/organisations', (c) => {
  withLayout(c, {
    title: 'Organisations chrétiennes',
    description: 'Associations chrétiennes, bibliothèques, instituts bibliques, centres de prière, camps de prière et centres de formation musicale.',
    currentPath: '/organisations',
  })
  return c.render(
    <DirectoryPage
      grp="organisation"
      title="Organisations chrétiennes"
      subtitle="Associations chrétiennes, bibliothèques et librairies, instituts et centres de formation biblique et théologique, centres de prière, camps de prière, centres de formation musicale."
      icon="fa-people-group"
    />
  )
})

app.get('/profils', (c) => {
  withLayout(c, {
    title: 'Profils chrétiens',
    description: 'Vous cherchez un musicien chrétien, un sociologue chrétien ou un groupe musical gospel ? Trouvez le bon profil sur Christici.',
    currentPath: '/profils',
  })
  return c.render(
    <DirectoryPage
      grp="profil"
      title="Profils chrétiens"
      subtitle="Musiciens chrétiens, sociologues chrétiens, groupes musicaux gospel… Trouvez le bon profil pour votre besoin."
      icon="fa-user-check"
    />
  )
})

app.get('/affaires', (c) => {
  withLayout(c, {
    title: 'Affaires chrétiennes',
    description: 'Microfinances chrétiennes, hôpitaux, bars sans alcool, restaurants à restrictions chrétiennes, librairies et studios chrétiens.',
    currentPath: '/affaires',
  })
  return c.render(
    <DirectoryPage
      grp="affaire"
      title="Affaires chrétiennes"
      subtitle="Microfinances chrétiennes, hôpitaux et cliniques, bars sans alcool, restaurants à restrictions chrétiennes, librairies et studios chrétiens."
      icon="fa-briefcase"
    />
  )
})

app.get('/infos', (c) => {
  withLayout(c, {
    title: 'Infos — Événements, nouvelles, emplois, publications',
    description: "Événements chrétiens, nouvelles, offres d'emploi et nouvelles publications (ouvrages) en ligne.",
    currentPath: '/infos',
  })
  return c.render(<InfosPage />)
})

app.get('/medias', (c) => {
  withLayout(c, {
    title: 'Médias — Vidéos, musique, images, articles',
    description: 'Vidéos, musique gospel, images et articles : les contenus multimédias de Christici.',
    currentPath: '/medias',
  })
  return c.render(<MediasPage />)
})

app.get('/a-propos', (c) => {
  withLayout(c, {
    title: 'Qui sommes-nous',
    description: "Christici : la plateforme qui révèle l'environnement chrétien au monde. Mission, vision et comment s'inscrire.",
    currentPath: '/a-propos',
  })
  return c.render(<AboutPage />)
})

app.get('/inscription', (c) => {
  withLayout(c, {
    title: 'Comment s\u2019inscrire',
    description: "Inscrivez votre église, organisation, profil ou affaire chrétienne à l'annuaire Christici.",
    currentPath: '/inscription',
  })
  return c.render(<InscriptionPage />)
})

app.get('/recherche', (c) => {
  withLayout(c, {
    title: 'Recherche',
    description: 'Recherchez parmi les églises, organisations, profils, événements, nouvelles et médias de Christici.',
    currentPath: '/recherche',
  })
  return c.render(<SearchPage />)
})

// Compte utilisateur (inscription / connexion)
app.get('/compte', (c) => {
  withLayout(c, {
    title: 'Mon compte',
    description: 'Créez votre compte Christici ou connectez-vous pour revendiquer une fiche et suivre vos demandes.',
    currentPath: '/compte',
  })
  return c.render(<AccountPage />)
})

// Espace administrateur (l'API exige le rôle admin ; la page gère l'affichage)
app.get('/admin', (c) => {
  withLayout(c, {
    title: 'Administration',
    description: 'Back-office Christici : modération des fiches, signalements, revendications et contenus.',
    currentPath: '/admin',
  })
  return c.render(<AdminPage />)
})

// 404
app.notFound((c) => {
  withLayout(c, { title: 'Page introuvable', currentPath: '/404' })
  c.status(404)
  return c.render(
    <section class="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
      <i class="fas fa-compass text-5xl text-blue-200 mb-6"></i>
      <h1 class="font-display text-4xl font-extrabold mb-4">Page introuvable</h1>
      <p class="text-slate-500 mb-8">La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <a href="/" class="btn-primary-sm"><i class="fas fa-house mr-2"></i>Retour à l'accueil</a>
    </section>
  )
})

export default app
