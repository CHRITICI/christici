// Page d'accueil Christici
export function HomePage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section id="hero-section" class="relative bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div class="hero-pattern" aria-hidden="true"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <img src="/static/images/logo.png" alt="Christici" class="h-16 sm:h-20 w-auto mx-auto bg-white rounded-2xl px-5 py-2.5 shadow-xl mb-8" />
          <p class="text-amber-400 font-semibold tracking-widest uppercase text-xs sm:text-sm mb-4">
            Le 1<sup>er</sup> site 100% chrétien au Togo
          </p>
          <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Bienvenue sur Christici
          </h1>
          <p class="max-w-2xl mx-auto text-lg sm:text-xl text-blue-100 leading-relaxed mb-10">
            La plateforme qui révèle l'environnement chrétien au monde&nbsp;: trouvez une église,
            découvrez les organisations, profils et services chrétiens près de chez vous.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/medias" class="btn-hero-primary">
              <i class="fas fa-play mr-2"></i>Explorer les contenus
            </a>
            <a href="/eglises" class="btn-hero-secondary">
              <i class="fas fa-church mr-2"></i>Trouver une église
            </a>
            <a href="/organisations" class="btn-hero-secondary">
              <i class="fas fa-people-group mr-2"></i>Découvrir les organisations
            </a>
          </div>
        </div>
      </section>

      {/* ===== Recherche rapide ===== */}
      <section id="quick-search" class="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <form action="/recherche" method="get" class="flex shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-200">
          <input
            type="search"
            name="q"
            placeholder="Rechercher une église, une organisation, un événement…"
            class="flex-1 px-5 py-4 text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
            aria-label="Recherche globale"
          />
          <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white px-6 sm:px-8 font-semibold transition-colors">
            <i class="fas fa-search sm:mr-2"></i><span class="hidden sm:inline">Rechercher</span>
          </button>
        </form>
      </section>

      {/* ===== Statistiques ===== */}
      <section id="stats-section" class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div id="stats-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Rempli dynamiquement */}
          <div class="stat-card"><i class="fas fa-church"></i><span class="stat-num">—</span><span class="stat-label">Églises</span></div>
          <div class="stat-card"><i class="fas fa-people-group"></i><span class="stat-num">—</span><span class="stat-label">Organisations</span></div>
          <div class="stat-card"><i class="fas fa-briefcase"></i><span class="stat-num">—</span><span class="stat-label">Affaires</span></div>
          <div class="stat-card"><i class="fas fa-user-check"></i><span class="stat-num">—</span><span class="stat-label">Profils</span></div>
          <div class="stat-card"><i class="fas fa-calendar-days"></i><span class="stat-num">—</span><span class="stat-label">Événements</span></div>
          <div class="stat-card"><i class="fas fa-photo-film"></i><span class="stat-num">—</span><span class="stat-label">Médias</span></div>
        </div>
      </section>

      {/* ===== Catégories principales ===== */}
      <section id="categories-section" class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div class="section-head">
          <h2 class="section-title">Explorer par catégorie</h2>
          <p class="section-sub">Tout l'environnement chrétien réuni en un seul endroit</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="home-categories">
          <a href="/eglises" class="cat-card">
            <i class="fas fa-church text-blue-700"></i>
            <h3>Églises</h3>
            <p>Par région, ville, quartier ou autour de vous</p>
          </a>
          <a href="/organisations" class="cat-card">
            <i class="fas fa-people-group text-teal-600"></i>
            <h3>Organisations</h3>
            <p>Associations, instituts bibliques, centres de prière…</p>
          </a>
          <a href="/profils" class="cat-card">
            <i class="fas fa-user-check text-violet-600"></i>
            <h3>Profils chrétiens</h3>
            <p>Musiciens, sociologues, groupes musicaux…</p>
          </a>
          <a href="/affaires" class="cat-card">
            <i class="fas fa-briefcase text-amber-600"></i>
            <h3>Affaires chrétiennes</h3>
            <p>Microfinances, hôpitaux, restaurants, studios…</p>
          </a>
          <a href="/infos" class="cat-card">
            <i class="fas fa-calendar-days text-rose-600"></i>
            <h3>Événements</h3>
            <p>Concerts gospel, croisades, formations…</p>
          </a>
          <a href="/infos#nouvelles" class="cat-card">
            <i class="fas fa-newspaper text-sky-600"></i>
            <h3>Nouvelles</h3>
            <p>L'actualité du monde chrétien</p>
          </a>
          <a href="/infos#emplois" class="cat-card">
            <i class="fas fa-user-tie text-emerald-600"></i>
            <h3>Offres d'emploi</h3>
            <p>Opportunités dans les organisations chrétiennes</p>
          </a>
          <a href="/medias" class="cat-card">
            <i class="fas fa-photo-film text-indigo-600"></i>
            <h3>Médias</h3>
            <p>Vidéos, musique, images et articles</p>
          </a>
        </div>
      </section>

      {/* ===== Églises mises en avant ===== */}
      <section id="home-churches" class="bg-white border-y border-slate-200 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="section-head flex-wrap flex items-end justify-between gap-3">
            <div>
              <h2 class="section-title"><i class="fas fa-church mr-3 text-blue-700"></i>Églises à découvrir</h2>
              <p class="section-sub">Trouvez une église par région, ville, quartier ou autour de votre position</p>
            </div>
            <a href="/eglises" class="link-more">Toutes les églises <i class="fas fa-arrow-right ml-1"></i></a>
          </div>
          <div id="home-churches-grid" class="grid-cards">
            <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
          </div>
        </div>
      </section>

      {/* ===== Organisations mises en avant ===== */}
      <section id="home-organisations" class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div class="section-head flex-wrap flex items-end justify-between gap-3">
          <div>
            <h2 class="section-title"><i class="fas fa-people-group mr-3 text-teal-600"></i>Organisations chrétiennes</h2>
            <p class="section-sub">Associations, instituts bibliques, centres de prière et de formation</p>
          </div>
          <a href="/organisations" class="link-more">Toutes les organisations <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div id="home-organisations-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      {/* ===== Événements + Nouvelles ===== */}
      <section id="home-infos" class="bg-white border-y border-slate-200 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12">
          <div>
            <div class="section-head flex-wrap flex items-end justify-between gap-3">
              <h2 class="section-title"><i class="fas fa-calendar-days mr-3 text-rose-600"></i>Événements à venir</h2>
              <a href="/infos" class="link-more">Tout voir <i class="fas fa-arrow-right ml-1"></i></a>
            </div>
            <div id="home-events-list" class="space-y-4">
              <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
          <div>
            <div class="section-head flex-wrap flex items-end justify-between gap-3">
              <h2 class="section-title"><i class="fas fa-newspaper mr-3 text-sky-600"></i>Dernières nouvelles</h2>
              <a href="/infos#nouvelles" class="link-more">Tout voir <i class="fas fa-arrow-right ml-1"></i></a>
            </div>
            <div id="home-news-list" class="space-y-4">
              <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Profils mis en avant ===== */}
      <section id="home-profils" class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div class="section-head flex-wrap flex items-end justify-between gap-3">
          <div>
            <h2 class="section-title"><i class="fas fa-user-check mr-3 text-violet-600"></i>Profils chrétiens</h2>
            <p class="section-sub">Vous cherchez un musicien, un sociologue ou un groupe musical chrétien&nbsp;?</p>
          </div>
          <a href="/profils" class="link-more">Tous les profils <i class="fas fa-arrow-right ml-1"></i></a>
        </div>
        <div id="home-profils-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      {/* ===== Médias ===== */}
      <section id="home-medias" class="bg-white border-y border-slate-200 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <div class="section-head flex-wrap flex items-end justify-between gap-3">
            <div>
              <h2 class="section-title"><i class="fas fa-photo-film mr-3 text-indigo-600"></i>Contenus multimédias</h2>
              <p class="section-sub">Vidéos, musique, images et articles</p>
            </div>
            <a href="/medias" class="link-more">Tous les médias <i class="fas fa-arrow-right ml-1"></i></a>
          </div>
          <div class="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Types de médias">
            <button class="media-tab active" data-tab="video"><i class="fas fa-video mr-1.5"></i>Vidéos</button>
            <button class="media-tab" data-tab="music"><i class="fas fa-music mr-1.5"></i>Musique</button>
            <button class="media-tab" data-tab="image"><i class="fas fa-image mr-1.5"></i>Images</button>
            <button class="media-tab" data-tab="article"><i class="fas fa-pen-nib mr-1.5"></i>Articles</button>
          </div>
          <div id="home-media-grid" class="grid-cards">
            <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
          </div>
        </div>
      </section>

      {/* ===== Appel à l'inscription ===== */}
      <section id="cta-section" class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div class="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl text-white text-center px-6 py-14 shadow-xl">
          <h2 class="font-display text-3xl sm:text-4xl font-extrabold mb-4">Votre organisation chrétienne mérite d'être visible</h2>
          <p class="max-w-xl mx-auto text-blue-100 mb-8">
            Église, association, institut, entreprise ou talent chrétien&nbsp;: rejoignez Christici
            et communiquez sur vos prestations, où que vous soyez.
          </p>
          <a href="/inscription" class="btn-hero-primary inline-flex">
            <i class="fas fa-user-plus mr-2"></i>Inscrire mon organisation
          </a>
        </div>
      </section>
    </>
  )
}
