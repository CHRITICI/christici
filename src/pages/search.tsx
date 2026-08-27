// Page "Recherche globale"
export function SearchPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Recherche</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-search mr-3"></i>Recherche</h1>
          <p class="page-subtitle">
            Recherchez parmi les églises, organisations, profils, événements, nouvelles et médias.
          </p>
        </div>
      </section>

      <section class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <form id="search-form" class="flex shadow-lg rounded-2xl overflow-hidden bg-white border border-slate-200 mb-10">
          <input
            type="search"
            id="search-input"
            name="q"
            placeholder="Votre recherche…"
            class="flex-1 px-5 py-4 text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
            aria-label="Recherche globale"
          />
          <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white px-6 sm:px-8 font-semibold transition-colors">
            <i class="fas fa-search"></i>
          </button>
        </form>
        <div id="search-results">
          <div class="empty-state">
            <i class="fas fa-magnifying-glass text-3xl mb-3 text-slate-300"></i>
            <p>Saisissez au moins 2 caractères pour lancer une recherche.</p>
          </div>
        </div>
      </section>

      <script defer src="/static/pages/search.js"></script>
    </>
  )
}
