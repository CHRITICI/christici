// Page "À propos" — Qui sommes-nous, mission, vision, comment s'inscrire
export function AboutPage() {
  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i> <span>À propos</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-circle-info mr-3"></i>Qui sommes-nous&nbsp;?</h1>
        </div>
      </section>

      {/* Qui sommes-nous */}
      <section class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div class="prose-christici">
          <p>
            Le monde chrétien connaît aujourd'hui une forte croissance. Le Royaume de Dieu s'étend
            de plus en plus. Parallèlement, le monde connaît une avancée considérable dans tous les
            domaines&nbsp;: la technologie, les arts, la mode, les formations, les innovations, la médecine…
          </p>
          <p>
            Les chrétiens ne sont pas restés à l'écart de cet élan mondial. Ils se sont impliqués et
            occupent des parts de plus en plus importantes sur l'échiquier mondial. L'Église s'est
            ouverte à beaucoup d'autres domaines&nbsp;: les arts, la musique, les finances, la mode,
            les formations, le coaching, la technologie, la médecine et bien d'autres.
          </p>
          <p>
            Mais le constat est amer. Si l'Église a pris le développement à bras ouverts, elle n'a pas
            pu y associer le côté communication. Les institutions chrétiennes, au lieu d'être
            «&nbsp;<em>la lumière sur une montagne</em>&nbsp;» — c'est-à-dire bien positionnées et bien visibles —
            sont presque invisibles. On n'entend parler que d'institutions hors de ce cadre, qui ne
            ménagent aucun effort pour communiquer, se vendre et se positionner.
          </p>
          <p>
            <strong>Christici</strong> est une plateforme qui se donne pour ambition de
            <strong> révéler l'environnement chrétien au monde</strong>. Nous voulons devenir la plateforme
            par excellence permettant à toute organisation chrétienne de se révéler et de communiquer
            sur ses prestations, quelles qu'elles soient et où qu'elles soient. Notre site web et notre
            application permettent au milieu chrétien d'atteindre sa cible où qu'elle soit.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section class="bg-white border-y border-slate-200 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-8">
          <div class="mv-card">
            <div class="mv-icon bg-blue-100 text-blue-700"><i class="fas fa-bullseye"></i></div>
            <h2 class="font-display text-2xl font-bold mb-3">Notre mission</h2>
            <p class="text-slate-600 leading-relaxed">
              Répertorier toutes les Églises sur une plateforme, enregistrer les profils chrétiens
              et les organisations chrétiennes en un seul endroit, et permettre aux demandeurs de
              savoir où se diriger pour s'offrir les services d'une institution chrétienne.
            </p>
          </div>
          <div class="mv-card">
            <div class="mv-icon bg-amber-100 text-amber-600"><i class="fas fa-eye"></i></div>
            <h2 class="font-display text-2xl font-bold mb-3">Notre vision</h2>
            <p class="text-slate-600 leading-relaxed">
              Rendre visibles les Églises, organisations, profils et services chrétiens —
              d'abord au Togo, puis partout — pour que la lumière soit véritablement placée
              sur la montagne. <em>Jusqu'au bout du monde&nbsp;!</em>
            </p>
          </div>
        </div>
      </section>

      {/* Ce que vous trouverez */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div class="section-head text-center">
          <h2 class="section-title">Ce que vous trouverez sur Christici</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="pillar-card-light"><i class="fas fa-church text-blue-700"></i><h3>Églises</h3><p>Annuaire des églises par région, ville, quartier, confession et géolocalisation.</p></div>
          <div class="pillar-card-light"><i class="fas fa-people-group text-teal-600"></i><h3>Organisations</h3><p>Associations, bibliothèques, instituts bibliques, centres de prière, camps de prière, formations musicales.</p></div>
          <div class="pillar-card-light"><i class="fas fa-user-check text-violet-600"></i><h3>Profils</h3><p>Musiciens, sociologues, groupes musicaux chrétiens — et bientôt d'autres profils.</p></div>
          <div class="pillar-card-light"><i class="fas fa-briefcase text-amber-600"></i><h3>Affaires</h3><p>Microfinances, hôpitaux, bars sans alcool, restaurants, librairies et studios chrétiens.</p></div>
          <div class="pillar-card-light"><i class="fas fa-bullhorn text-rose-600"></i><h3>Infos</h3><p>Événements, nouvelles, offres d'emploi et nouvelles publications.</p></div>
          <div class="pillar-card-light"><i class="fas fa-photo-film text-indigo-600"></i><h3>Médias</h3><p>Vidéos, musique, images et articles pour se nourrir chaque jour.</p></div>
        </div>
      </section>

      {/* Comment s'inscrire */}
      <section id="comment-sinscrire" class="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div class="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl text-white px-6 py-12 sm:px-12 shadow-xl">
          <h2 class="font-display text-3xl font-extrabold mb-6 text-center">Comment s'inscrire&nbsp;?</h2>
          <ol class="space-y-5 max-w-xl mx-auto">
            <li class="flex gap-4">
              <span class="step-num">1</span>
              <div><strong>Choisissez votre type d'inscription</strong> — église, organisation, profil chrétien ou affaire chrétienne.</div>
            </li>
            <li class="flex gap-4">
              <span class="step-num">2</span>
              <div><strong>Remplissez le formulaire</strong> — nom, catégorie, ville et vos coordonnées.</div>
            </li>
            <li class="flex gap-4">
              <span class="step-num">3</span>
              <div><strong>Notre équipe vous recontacte</strong> — pour compléter et valider votre fiche avant publication.</div>
            </li>
          </ol>
          <div class="text-center mt-10">
            <a href="/inscription" class="btn-hero-primary inline-flex"><i class="fas fa-user-plus mr-2"></i>Je m'inscris maintenant</a>
          </div>
        </div>
      </section>
    </>
  )
}
