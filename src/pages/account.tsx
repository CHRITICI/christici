// Page Mon compte — inscription publique + connexion (le JS bascule selon l'état de session)
export function AccountPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Mon compte</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-user-circle mr-3"></i>Mon compte</h1>
          <p class="page-subtitle">
            Créez un compte pour revendiquer la fiche de votre église ou organisation et suivre vos demandes.
          </p>
        </div>
      </section>

      <section class="max-w-md mx-auto px-4 sm:px-6 py-12">
        {/* État : chargement de la session */}
        <div id="account-loading" class="loading-state">
          <i class="fas fa-circle-notch fa-spin"></i> Vérification de votre session…
        </div>

        {/* État : connecté */}
        <div id="account-logged" class="detail-card hidden">
          <div class="flex items-center gap-4 mb-5">
            <div class="entry-icon"><i class="fas fa-user"></i></div>
            <div class="min-w-0">
              <h2 id="account-name" class="font-display font-extrabold text-lg text-slate-900 truncate"></h2>
              <p id="account-email" class="text-sm text-slate-500 truncate"></p>
              <span id="account-role" class="tag tag-blue mt-1 inline-block"></span>
            </div>
          </div>
          <p class="text-sm text-slate-500 mb-5">
            Votre compte vous permet de revendiquer des fiches et de signaler des erreurs avec suivi.
          </p>
          <div class="flex flex-col gap-3">
            <a href="/eglises" class="btn-primary-sm justify-center"><i class="fas fa-church mr-2"></i>Parcourir les églises</a>
            <a id="account-admin-link" href="/admin" class="btn-near justify-center hidden"><i class="fas fa-gauge-high mr-2"></i>Espace administrateur</a>
            <button id="btn-logout" class="btn-ghost-sm justify-center"><i class="fas fa-right-from-bracket mr-2"></i>Se déconnecter</button>
          </div>
        </div>

        {/* État : non connecté — onglets connexion / inscription */}
        <div id="account-guest" class="detail-card hidden">
          <div class="flex gap-2 mb-6">
            <button id="tab-login" class="admin-tab active flex-1">Connexion</button>
            <button id="tab-register" class="admin-tab flex-1">Créer un compte</button>
          </div>

          {/* Connexion */}
          <form id="form-login" class="space-y-4">
            <div>
              <label class="filter-label" for="login-email">Email</label>
              <input id="login-email" type="email" class="filter-input" required autocomplete="email" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label class="filter-label" for="login-password">Mot de passe</label>
              <input id="login-password" type="password" class="filter-input" required autocomplete="current-password" placeholder="••••••••" />
            </div>
            <p id="login-msg" class="text-sm hidden" role="alert"></p>
            <button type="submit" class="btn-primary-sm w-full justify-center"><i class="fas fa-right-to-bracket mr-2"></i>Se connecter</button>
          </form>

          {/* Inscription */}
          <form id="form-register" class="space-y-4 hidden">
            <div>
              <label class="filter-label" for="register-name">Nom complet</label>
              <input id="register-name" class="filter-input" required minlength={2} maxlength={120} autocomplete="name" placeholder="Nom et prénom" />
            </div>
            <div>
              <label class="filter-label" for="register-email">Email</label>
              <input id="register-email" type="email" class="filter-input" required autocomplete="email" placeholder="vous@exemple.com" />
            </div>
            <div>
              <label class="filter-label" for="register-password">Mot de passe (8 caractères min.)</label>
              <input id="register-password" type="password" class="filter-input" required minlength={8} autocomplete="new-password" placeholder="••••••••" />
            </div>
            <p id="register-msg" class="text-sm hidden" role="alert"></p>
            <button type="submit" class="btn-primary-sm w-full justify-center"><i class="fas fa-user-plus mr-2"></i>Créer mon compte</button>
            <p class="text-xs text-slate-400">
              <i class="fas fa-lock mr-1"></i>
              Votre mot de passe est haché (PBKDF2) et n'est jamais stocké en clair.
            </p>
          </form>
        </div>
      </section>

      <script defer src="/static/pages/account.js"></script>
    </>
  )
}
