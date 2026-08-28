// Page "Trouver une église" — filtres région/ville/quartier/confession + géolocalisation
export function EglisesPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Églises</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-church mr-3"></i>Trouver une église</h1>
          <p class="page-subtitle">
            Recherchez une église au Togo par région, ville, quartier ou confession —
            ou trouvez les églises autour de votre position.
          </p>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Filtres */}
        <div class="filter-panel">
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="filter-region" class="filter-label">Région</label>
              <select id="filter-region" class="filter-input"><option value="">Toutes les régions</option></select>
            </div>
            <div>
              <label for="filter-city" class="filter-label">Ville</label>
              <select id="filter-city" class="filter-input"><option value="">Toutes les villes</option></select>
            </div>
            <div>
              <label for="filter-denomination" class="filter-label">Confession</label>
              <select id="filter-denomination" class="filter-input"><option value="">Toutes les confessions</option></select>
            </div>
            <div>
              <label for="filter-status" class="filter-label">Vérification</label>
              <select id="filter-status" class="filter-input">
                <option value="">Tous les statuts</option>
                <option value="verifiee">Vérifiées</option>
                <option value="a_verifier">À vérifier</option>
                <option value="signalee">Signalées</option>
              </select>
            </div>
            <div class="sm:col-span-2 lg:col-span-2">
              <label for="filter-q" class="filter-label">Mot-clé / quartier</label>
              <input id="filter-q" type="search" class="filter-input" placeholder="Nom, quartier…" />
            </div>
          </div>
          <div class="flex flex-wrap gap-3 mt-5">
            <button id="btn-filter" class="btn-primary-sm"><i class="fas fa-filter mr-2"></i>Filtrer</button>
            <button id="btn-nearby" class="btn-near"><i class="fas fa-location-crosshairs mr-2"></i>Autour de ma position</button>
            <button id="btn-reset" class="btn-ghost-sm"><i class="fas fa-rotate-left mr-2"></i>Réinitialiser</button>
          </div>
          <p id="geo-status" class="text-sm text-slate-500 mt-3 hidden" role="status"></p>
        </div>

        {/* Résultats : liste + carte */}
        <div class="flex items-center justify-between mt-8 mb-5 flex-wrap gap-3">
          <p id="results-count" class="text-sm text-slate-500"></p>
          <div class="flex gap-2">
            <button id="view-list" class="admin-tab active"><i class="fas fa-list mr-1"></i>Liste</button>
            <button id="view-map" class="admin-tab"><i class="fas fa-map-location-dot mr-1"></i>Carte</button>
          </div>
        </div>
        <div id="churches-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement des églises…</div>
        </div>
        <div id="churches-map" class="hidden rounded-xl overflow-hidden border border-slate-200" style={{ height: '480px' }}></div>
        <div id="pagination" class="flex justify-center gap-2 mt-10"></div>
      </section>

      {/* Transparence des données */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div class="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-900 flex gap-3">
          <i class="fas fa-shield-halved mt-0.5"></i>
          <p>
            Christici n'affiche que des fiches d'églises réelles, issues de sources publiques vérifiables
            (ex. OpenStreetMap, licence ODbL) ou enregistrées par leurs responsables. Chaque fiche indique
            sa source et son statut de vérification. Vous pouvez{' '}
            <a href="/inscription" class="font-semibold underline underline-offset-2">inscrire votre église</a>,
            revendiquer une fiche existante ou signaler une erreur depuis chaque fiche.
            Données cartographiques ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" class="underline">
              OpenStreetMap contributors
            </a>.
          </p>
        </div>
      </section>

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
      <script defer src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>

      <script defer src="/static/pages/eglises.js"></script>
    </>
  )
}
