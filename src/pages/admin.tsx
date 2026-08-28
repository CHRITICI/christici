// Espace administrateur — le contenu est rendu par admin.js après vérification du rôle via l'API.
// Sans rôle admin, l'API renvoie 401/403 et la page affiche un accès refusé (aucune donnée exposée).
export function AdminPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Administration</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-gauge-high mr-3"></i>Administration</h1>
          <p class="page-subtitle">
            Modération des fiches, signalements, revendications, soumissions et contenus.
          </p>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Accès refusé / non connecté */}
        <div id="admin-denied" class="detail-card max-w-lg mx-auto text-center hidden">
          <i class="fas fa-lock text-4xl text-slate-300 mb-4"></i>
          <h2 class="font-display text-xl font-extrabold mb-2">Accès réservé</h2>
          <p class="text-slate-500 text-sm mb-5">
            Cet espace est réservé aux administrateurs Christici. Connectez-vous avec un compte administrateur.
          </p>
          <a href="/compte" class="btn-primary-sm"><i class="fas fa-right-to-bracket mr-2"></i>Se connecter</a>
        </div>

        {/* Chargement */}
        <div id="admin-loading" class="loading-state">
          <i class="fas fa-circle-notch fa-spin"></i> Vérification des droits d'accès…
        </div>

        {/* Tableau de bord */}
        <div id="admin-app" class="hidden">
          {/* Statistiques */}
          <div id="admin-stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"></div>

          {/* Onglets */}
          <div class="flex gap-2 overflow-x-auto pb-2 mb-6" id="admin-tabs">
            <button class="admin-tab active" data-tab="churches"><i class="fas fa-church mr-1"></i>Églises</button>
            <button class="admin-tab" data-tab="directory"><i class="fas fa-building mr-1"></i>Annuaire</button>
            <button class="admin-tab" data-tab="profiles"><i class="fas fa-user-check mr-1"></i>Profils</button>
            <button class="admin-tab" data-tab="events"><i class="fas fa-calendar-days mr-1"></i>Événements</button>
            <button class="admin-tab" data-tab="news"><i class="fas fa-newspaper mr-1"></i> Nouvelles</button>
            <button class="admin-tab" data-tab="jobs"><i class="fas fa-user-tie mr-1"></i>Emplois</button>
            <button class="admin-tab" data-tab="publications"><i class="fas fa-book mr-1"></i>Publications</button>
            <button class="admin-tab" data-tab="media"><i class="fas fa-photo-film mr-1"></i>Médias</button>
            <button class="admin-tab" data-tab="submissions"><i class="fas fa-inbox mr-1"></i>Soumissions <span class="admin-badge admin-badge-pending" data-count="pending_submissions"></span></button>
            <button class="admin-tab" data-tab="reports"><i class="fas fa-flag mr-1"></i>Signalements <span class="admin-badge admin-badge-pending" data-count="pending_reports"></span></button>
            <button class="admin-tab" data-tab="claims"><i class="fas fa-hand-pointer mr-1"></i>Revendications <span class="admin-badge admin-badge-pending" data-count="pending_claims"></span></button>
            <button class="admin-tab" data-tab="duplicates"><i class="fas fa-clone mr-1"></i>Doublons</button>
            <button class="admin-tab" data-tab="users"><i class="fas fa-users mr-1"></i>Utilisateurs</button>
          </div>

          {/* Barre d'outils (recherche / filtres) pour les onglets CRUD */}
          <div id="admin-toolbar" class="filter-panel mb-5">
            <div class="flex flex-wrap gap-3 items-end">
              <div class="flex-1 min-w-[200px]">
                <label class="filter-label" for="admin-q">Rechercher</label>
                <input id="admin-q" type="search" class="filter-input" placeholder="Nom, ville, titre…" />
              </div>
              <div id="admin-status-wrap">
                <label class="filter-label" for="admin-status">Statut</label>
                <select id="admin-status" class="filter-input">
                  <option value="">Tous</option>
                  <option value="a_verifier">À vérifier</option>
                  <option value="verifiee">Vérifiée</option>
                  <option value="signalee">Signalée</option>
                </select>
              </div>
              <div id="admin-published-wrap">
                <label class="filter-label" for="admin-published">Publication</label>
                <select id="admin-published" class="filter-input">
                  <option value="">Toutes</option>
                  <option value="1">Publiées</option>
                  <option value="0">Non publiées</option>
                </select>
              </div>
              <button id="admin-search-btn" class="btn-primary-sm"><i class="fas fa-magnifying-glass mr-2"></i>Rechercher</button>
            </div>
          </div>

          {/* Contenu de l'onglet courant */}
          <div id="admin-content">
            <div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> Chargement…</div>
          </div>
          <div id="admin-pagination" class="flex justify-center gap-2 mt-8"></div>
        </div>
      </section>

      {/* Modale d'édition générique (remplie par admin.js) */}
      <div id="modal-edit" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modal-edit-title">
        <div class="modal-box" style="max-width: 42rem;">
          <h3 id="modal-edit-title" class="font-display text-xl font-bold mb-4">Modifier la fiche</h3>
          <form id="form-edit" class="space-y-3">
            <div id="edit-fields" class="grid sm:grid-cols-2 gap-3"></div>
            <p id="edit-msg" class="text-sm hidden" role="status"></p>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary-sm flex-1"><i class="fas fa-floppy-disk mr-2"></i>Enregistrer</button>
              <button type="button" class="btn-ghost-sm" data-modal-close>Annuler</button>
            </div>
          </form>
        </div>
      </div>

      <script defer src="/static/pages/admin.js"></script>
    </>
  )
}
