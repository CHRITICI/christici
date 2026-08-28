// Fiche détaillée d'une église — donnée réelle avec statut de vérification et provenance
import type { Church } from '../types'

interface Props {
  church: Church & {
    status?: string
    source?: string | null
    source_ref?: string | null
    verified_at?: string | null
    claimed_by?: number | null
  }
}

function statusInfo(status?: string): { label: string; cls: string; icon: string; note: string } {
  switch (status) {
    case 'verifiee':
      return {
        label: 'Fiche vérifiée',
        cls: 'bg-green-50 text-green-800 border-green-200',
        icon: 'fa-circle-check',
        note: "Cette fiche a été vérifiée par l'équipe Christici ou revendiquée par son responsable.",
      }
    case 'signalee':
      return {
        label: 'Fiche signalée',
        cls: 'bg-red-50 text-red-800 border-red-200',
        icon: 'fa-flag',
        note: "Cette fiche a fait l'objet d'un signalement et est en cours de réexamen.",
      }
    default:
      return {
        label: 'À vérifier',
        cls: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: 'fa-hourglass-half',
        note: "Fiche issue d'une source publique, en attente de vérification par la communauté ou le responsable.",
      }
  }
}

function osmUrl(sourceRef?: string | null): string | null {
  if (!sourceRef) return null
  const [type, id] = sourceRef.split('/')
  if (!type || !id || !['node', 'way', 'relation'].includes(type)) return null
  return `https://www.openstreetmap.org/${type}/${id}`
}

export function EgliseDetailPage({ church: ch }: Props) {
  const st = statusInfo(ch.status)
  const srcUrl = ch.source === 'OpenStreetMap' ? osmUrl(ch.source_ref) : null
  const hasCoords = ch.latitude != null && ch.longitude != null
  const osmEmbed = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(ch.longitude) - 0.005}%2C${Number(ch.latitude) - 0.005}%2C${Number(ch.longitude) + 0.005}%2C${Number(ch.latitude) + 0.005}&layer=mapnik&marker=${ch.latitude}%2C${ch.longitude}`
    : null

  return (
    <>
      <section class="page-hero">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
          <nav class="breadcrumb" aria-label="Fil d'Ariane">
            <a href="/">Accueil</a> <i class="fas fa-chevron-right"></i>{' '}
            <a href="/eglises">Églises</a> <i class="fas fa-chevron-right"></i> <span>{ch.name}</span>
          </nav>
          <h1 class="page-title"><i class="fas fa-church mr-3"></i>{ch.name}</h1>
          <p class="page-subtitle">
            {[ch.denomination, ch.district, ch.city, ch.region, ch.country].filter(Boolean).join(' · ')}
          </p>
        </div>
      </section>

      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Bandeau statut de vérification */}
        <div class={`border rounded-xl px-5 py-4 mb-8 flex flex-wrap items-center gap-3 ${st.cls}`}>
          <i class={`fas ${st.icon} text-lg`}></i>
          <div class="min-w-0">
            <p class="font-bold">{st.label}</p>
            <p class="text-sm opacity-90">{st.note}</p>
          </div>
          {ch.verified_at ? (
            <span class="ml-auto text-xs">Vérifiée le {String(ch.verified_at).slice(0, 10)}</span>
          ) : null}
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div class="lg:col-span-2 space-y-8">
            {ch.description ? (
              <div class="detail-card">
                <h2 class="detail-title"><i class="fas fa-circle-info mr-2"></i>Présentation</h2>
                <p class="text-slate-600 leading-relaxed">{ch.description}</p>
              </div>
            ) : null}

            {/* Carte OpenStreetMap */}
            {osmEmbed ? (
              <div class="detail-card">
                <h2 class="detail-title"><i class="fas fa-map-location-dot mr-2"></i>Localisation</h2>
                <div class="rounded-lg overflow-hidden border border-slate-200">
                  <iframe
                    title={`Carte — ${ch.name}`}
                    src={osmEmbed}
                    style={{ width: '100%', height: '320px', border: 0 }}
                    loading="lazy"
                  ></iframe>
                </div>
                <p class="text-xs text-slate-400 mt-2">
                  Coordonnées : {ch.latitude}, {ch.longitude} · Carte ©{' '}
                  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" class="underline">
                    OpenStreetMap contributors
                  </a>
                </p>
              </div>
            ) : null}

            {/* Provenance de la donnée */}
            <div class="detail-card">
              <h2 class="detail-title"><i class="fas fa-database mr-2"></i>Source de cette fiche</h2>
              {ch.source ? (
                <div class="text-sm text-slate-600 space-y-1">
                  <p>
                    <span class="font-semibold">Source :</span> {ch.source}
                    {srcUrl ? (
                      <>
                        {' '}—{' '}
                        <a href={srcUrl} target="_blank" rel="noopener noreferrer" class="text-blue-700 underline underline-offset-2">
                          voir la donnée originale <i class="fas fa-arrow-up-right-from-square text-xs"></i>
                        </a>
                      </>
                    ) : null}
                  </p>
                  {ch.source === 'OpenStreetMap' ? (
                    <p class="text-slate-500">
                      Donnée cartographique publique sous licence{' '}
                      <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer" class="underline">
                        ODbL
                      </a>{' '}
                      — © OpenStreetMap contributors. Elle peut être incomplète : vous pouvez la corriger via
                      « Signaler une erreur ».
                    </p>
                  ) : null}
                </div>
              ) : (
                <p class="text-sm text-slate-600">
                  Fiche enregistrée par Christici
                  {ch.claimed_by ? ' et gérée par son responsable' : ''}.
                </p>
              )}
            </div>

            {/* Actions communautaires */}
            <div class="detail-card">
              <h2 class="detail-title"><i class="fas fa-hands-helping mr-2"></i>Contribuer</h2>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="border border-slate-200 rounded-lg p-4">
                  <h3 class="font-bold text-slate-900 mb-1"><i class="fas fa-building-circle-check mr-2 text-blue-600"></i>C'est votre église ?</h3>
                  <p class="text-sm text-slate-500 mb-3">
                    Revendiquez cette fiche pour la compléter (horaires, contacts, photos) et obtenir le statut « vérifiée ».
                  </p>
                  <button class="btn-primary-sm w-full" data-claim-open data-entity-type="church" data-entity-id={ch.id} data-entity-name={ch.name}>
                    <i class="fas fa-hand-pointer mr-2"></i>Revendiquer cette fiche
                  </button>
                </div>
                <div class="border border-slate-200 rounded-lg p-4">
                  <h3 class="font-bold text-slate-900 mb-1"><i class="fas fa-flag mr-2 text-red-500"></i>Une erreur ?</h3>
                  <p class="text-sm text-slate-500 mb-3">
                    Adresse erronée, église fermée, doublon… Signalez-le : notre équipe vérifie chaque signalement.
                  </p>
                  <button class="btn-ghost-sm w-full" data-report-open data-entity-type="church" data-entity-id={ch.id} data-entity-name={ch.name}>
                    <i class="fas fa-flag mr-2"></i>Signaler une erreur
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne latérale : informations */}
          <aside class="space-y-6">
            <div class="detail-card">
              <h2 class="detail-title"><i class="fas fa-address-card mr-2"></i>Informations</h2>
              <dl class="detail-list">
                {ch.denomination ? (<><dt>Confession</dt><dd>{ch.denomination}</dd></>) : null}
                {ch.address ? (<><dt>Adresse</dt><dd>{ch.address}</dd></>) : null}
                {[ch.district, ch.city, ch.region].filter(Boolean).length ? (
                  <><dt>Localité</dt><dd>{[ch.district, ch.city, ch.region].filter(Boolean).join(' · ')}</dd></>
                ) : null}
                <dt>Pays</dt><dd>{ch.country}</dd>
                {ch.phone ? (<><dt>Téléphone</dt><dd><a href={`tel:${ch.phone}`} class="text-blue-700">{ch.phone}</a></dd></>) : null}
                {ch.email ? (<><dt>Email</dt><dd><a href={`mailto:${ch.email}`} class="text-blue-700 break-all">{ch.email}</a></dd></>) : null}
                {ch.website ? (
                  <><dt>Site web</dt><dd><a href={ch.website} target="_blank" rel="noopener noreferrer" class="text-blue-700 break-all">{ch.website}</a></dd></>
                ) : null}
                {ch.pastor_name ? (<><dt>Responsable</dt><dd>{ch.pastor_name}</dd></>) : null}
                {ch.service_times ? (<><dt>Horaires / cultes</dt><dd>{ch.service_times}</dd></>) : null}
              </dl>
              {!ch.phone && !ch.email && !ch.website && !ch.service_times ? (
                <p class="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
                  <i class="fas fa-circle-info mr-1"></i>
                  Les coordonnées publiques de cette église ne sont pas encore connues. Si vous les connaissez,
                  signalez-les ou revendiquez la fiche.
                </p>
              ) : null}
            </div>

            <a href="/eglises" class="btn-ghost-sm w-full justify-center"><i class="fas fa-arrow-left mr-2"></i>Retour à l'annuaire</a>
          </aside>
        </div>
      </section>

      {/* Modale signalement */}
      <div id="modal-report" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modal-report-title">
        <div class="modal-box">
          <h3 id="modal-report-title" class="font-display text-xl font-bold mb-1"><i class="fas fa-flag text-red-500 mr-2"></i>Signaler une erreur</h3>
          <p class="text-sm text-slate-500 mb-4" id="report-entity-label"></p>
          <form id="form-report" class="space-y-3">
            <input type="hidden" id="report-entity-type" />
            <input type="hidden" id="report-entity-id" />
            <div>
              <label class="filter-label" for="report-reason">Motif *</label>
              <select id="report-reason" class="filter-input" required>
                <option value="">Choisir…</option>
                <option value="Information erronée">Information erronée</option>
                <option value="Église fermée / inexistante">Église fermée / inexistante</option>
                <option value="Doublon">Doublon (fiche en double)</option>
                <option value="Contenu inapproprié">Contenu inapproprié</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label class="filter-label" for="report-details">Détails</label>
              <textarea id="report-details" class="filter-input" rows={3} placeholder="Précisez l'erreur constatée, la bonne information si vous la connaissez…"></textarea>
            </div>
            <div>
              <label class="filter-label" for="report-email">Votre email (facultatif, pour le suivi)</label>
              <input id="report-email" type="email" class="filter-input" placeholder="vous@exemple.com" />
            </div>
            <p id="report-msg" class="text-sm hidden" role="status"></p>
            <div class="flex gap-3 pt-1">
              <button type="submit" class="btn-primary-sm flex-1"><i class="fas fa-paper-plane mr-2"></i>Envoyer le signalement</button>
              <button type="button" class="btn-ghost-sm" data-modal-close>Annuler</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modale revendication */}
      <div id="modal-claim" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modal-claim-title">
        <div class="modal-box">
          <h3 id="modal-claim-title" class="font-display text-xl font-bold mb-1"><i class="fas fa-building-circle-check text-blue-600 mr-2"></i>Revendiquer cette fiche</h3>
          <p class="text-sm text-slate-500 mb-4">
            Vous êtes responsable de <strong id="claim-entity-label"></strong> ? Laissez vos coordonnées :
            notre équipe vous contactera pour vérifier votre identité avant de vous donner la main sur la fiche.
          </p>
          <form id="form-claim" class="space-y-3">
            <input type="hidden" id="claim-entity-type" />
            <input type="hidden" id="claim-entity-id" />
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="filter-label" for="claim-name">Votre nom *</label>
                <input id="claim-name" class="filter-input" required placeholder="Nom et prénom" />
              </div>
              <div>
                <label class="filter-label" for="claim-role">Votre rôle</label>
                <input id="claim-role" class="filter-input" placeholder="Pasteur, secrétaire…" />
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-3">
              <div>
                <label class="filter-label" for="claim-email">Email *</label>
                <input id="claim-email" type="email" class="filter-input" required placeholder="vous@eglise.org" />
              </div>
              <div>
                <label class="filter-label" for="claim-phone">Téléphone</label>
                <input id="claim-phone" class="filter-input" placeholder="+228 …" />
              </div>
            </div>
            <div>
              <label class="filter-label" for="claim-message">Message</label>
              <textarea id="claim-message" class="filter-input" rows={3} placeholder="Précisez les informations à compléter ou corriger…"></textarea>
            </div>
            <p id="claim-msg" class="text-sm hidden" role="status"></p>
            <div class="flex gap-3 pt-1">
              <button type="submit" class="btn-primary-sm flex-1"><i class="fas fa-paper-plane mr-2"></i>Envoyer la demande</button>
              <button type="button" class="btn-ghost-sm" data-modal-close>Annuler</button>
            </div>
          </form>
        </div>
      </div>

      <script defer src="/static/pages/eglise-detail.js"></script>
    </>
  )
}
