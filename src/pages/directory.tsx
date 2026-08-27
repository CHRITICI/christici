// Pages annuaire : Organisations / Profils / Affaires (composant générique)
interface DirectoryPageProps {
  grp: 'organisation' | 'profil' | 'affaire'
  title: string
  subtitle: string
  icon: string
}

export function DirectoryPage({ grp, title, subtitle, icon }: DirectoryPageProps) {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>{title}</span>
          </nav>
          <h1 class="page-title"><i class={`fas ${icon} mr-3`}></i>{title}</h1>
          <p class="page-subtitle">{subtitle}</p>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div class="filter-panel">
          <div class="grid sm:grid-cols-3 gap-4">
            <div>
              <label for="dir-category" class="filter-label">Catégorie</label>
              <select id="dir-category" class="filter-input"><option value="">Toutes les catégories</option></select>
            </div>
            <div>
              <label for="dir-city" class="filter-label">Ville</label>
              <input id="dir-city" type="text" class="filter-input" placeholder="Ex. Lomé" />
            </div>
            <div>
              <label for="dir-q" class="filter-label">Mot-clé</label>
              <input id="dir-q" type="search" class="filter-input" placeholder="Nom, description…" />
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-5">
            <button id="btn-filter" class="btn-primary-sm"><i class="fas fa-filter mr-2"></i>Filtrer</button>
            <button id="btn-reset" class="btn-ghost-sm"><i class="fas fa-rotate-left mr-2"></i>Réinitialiser</button>
          </div>
        </div>

        <p id="results-count" class="text-sm text-slate-500 mt-8 mb-5"></p>
        <div id="dir-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
        <div id="pagination" class="flex justify-center gap-2 mt-10"></div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div class="cta-banner-sm">
          <div>
            <h2 class="font-display text-xl font-bold text-white mb-1">Vous faites partie de cette catégorie&nbsp;?</h2>
            <p class="text-blue-100 text-sm">Rejoignez Christici et rendez votre structure visible.</p>
          </div>
          <a href="/inscription" class="btn-hero-primary text-sm px-5 py-2.5">S'inscrire</a>
        </div>
      </section>

      <script defer src="/static/pages/directory.js" data-grp={grp}></script>
    </>
  )
}
