// Page "Infos" — événements, nouvelles, offres d'emploi, publications
export function InfosPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Infos</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-bullhorn mr-3"></i>Infos</h1>
          <p class="page-subtitle">
            Événements, nouvelles, offres d'emploi et nouvelles publications du monde chrétien.
          </p>
        </div>
      </section>

      {/* Événements */}
      <section id="evenements" class="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div class="section-head">
          <h2 class="section-title"><i class="fas fa-calendar-days mr-3 text-rose-600"></i>Événements à venir</h2>
          <p class="section-sub">Concerts gospel, croisades, campagnes d'évangélisation, formations…</p>
        </div>
        <div id="events-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      {/* Nouvelles */}
      <section id="nouvelles" class="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div class="section-head">
          <h2 class="section-title"><i class="fas fa-newspaper mr-3 text-sky-600"></i>Les nouvelles</h2>
          <p class="section-sub">L'actualité du monde chrétien</p>
        </div>
        <div id="news-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      {/* Offres d'emploi */}
      <section id="emplois" class="max-w-7xl mx-auto px-4 sm:px-6 pt-14">
        <div class="section-head">
          <h2 class="section-title"><i class="fas fa-user-tie mr-3 text-emerald-600"></i>Offres d'emploi</h2>
          <p class="section-sub">Opportunités dans les organisations chrétiennes</p>
        </div>
        <div id="jobs-list" class="space-y-4">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      {/* Publications */}
      <section id="publications" class="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-12">
        <div class="section-head">
          <h2 class="section-title"><i class="fas fa-book-open mr-3 text-amber-600"></i>Nouvelles publications</h2>
          <p class="section-sub">Les ouvrages récemment parus en ligne</p>
        </div>
        <div id="publications-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      <script defer src="/static/pages/infos.js"></script>
    </>
  )
}
