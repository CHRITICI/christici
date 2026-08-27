// Page "Médias" — vidéos, musique, images, articles
export function MediasPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Médias</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-photo-film mr-3"></i>Médias</h1>
          <p class="page-subtitle">
            Vidéos, musique, images et articles : les contenus multimédias de Christici.
          </p>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div class="flex gap-2 mb-8 flex-wrap" role="tablist" aria-label="Types de médias">
          <button class="media-tab active" data-tab="video"><i class="fas fa-video mr-1.5"></i>Vidéos</button>
          <button class="media-tab" data-tab="music"><i class="fas fa-music mr-1.5"></i>Musique</button>
          <button class="media-tab" data-tab="image"><i class="fas fa-image mr-1.5"></i>Images</button>
          <button class="media-tab" data-tab="article"><i class="fas fa-pen-nib mr-1.5"></i>Articles</button>
        </div>
        <div id="media-grid" class="grid-cards">
          <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
        </div>
      </section>

      <script defer src="/static/pages/medias.js"></script>
    </>
  )
}
