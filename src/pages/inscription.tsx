// Page "Inscription" — formulaire de demande d'inscription (soumission → moderation)
export function InscriptionPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>Inscription</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-user-plus mr-3"></i>Comment s'inscrire</h1>
          <p class="page-subtitle">
            Église, organisation, profil ou affaire chrétienne&nbsp;: demandez votre inscription à l'annuaire Christici.
          </p>
        </div>
      </section>

      <section class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <form id="inscription-form" class="form-card" novalidate>
          <div class="mb-5">
            <label for="f-kind" class="filter-label">Type d'inscription <span class="text-rose-500">*</span></label>
            <select id="f-kind" name="kind" class="filter-input" required>
              <option value="">— Choisissez —</option>
              <option value="church">Une église</option>
              <option value="organisation">Une organisation chrétienne</option>
              <option value="profil">Un profil chrétien (musicien, sociologue, groupe…)</option>
              <option value="affaire">Une affaire chrétienne (microfinance, hôpital, restaurant, studio…)</option>
              <option value="autre">Autre demande</option>
            </select>
          </div>
          <div class="mb-5">
            <label for="f-name" class="filter-label">Nom (église, organisation, personne…) <span class="text-rose-500">*</span></label>
            <input id="f-name" name="name" type="text" class="filter-input" required maxlength="150" placeholder="Ex. Église …, Association …, Prénom Nom" />
          </div>
          <div class="grid sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label for="f-category" class="filter-label">Catégorie / confession</label>
              <input id="f-category" name="category" type="text" class="filter-input" maxlength="100" placeholder="Ex. Pentecôtiste, Institut biblique…" />
            </div>
            <div>
              <label for="f-city" class="filter-label">Ville</label>
              <input id="f-city" name="city" type="text" class="filter-input" maxlength="100" placeholder="Ex. Lomé" />
            </div>
          </div>
          <div class="mb-5">
            <label for="f-contact" class="filter-label">Votre contact (téléphone ou email) <span class="text-rose-500">*</span></label>
            <input id="f-contact" name="contact" type="text" class="filter-input" required maxlength="150" placeholder="Ex. +228 … ou vous@exemple.org" />
          </div>
          <div class="mb-6">
            <label for="f-message" class="filter-label">Message (facultatif)</label>
            <textarea id="f-message" name="message" rows={4} class="filter-input" maxlength="2000" placeholder="Présentez brièvement votre structure ou votre activité…"></textarea>
          </div>
          <div id="form-status" class="hidden mb-5 text-sm rounded-lg px-4 py-3" role="status"></div>
          <button type="submit" id="form-submit" class="btn-primary-sm w-full justify-center text-base py-3">
            <i class="fas fa-paper-plane mr-2"></i>Envoyer ma demande
          </button>
          <p class="text-xs text-slate-400 mt-4 text-center">
            Votre demande sera examinée par l'équipe Christici avant publication. Aucune donnée n'est partagée avec des tiers.
          </p>
        </form>
      </section>

      <script defer src="/static/pages/inscription.js"></script>
    </>
  )
}
