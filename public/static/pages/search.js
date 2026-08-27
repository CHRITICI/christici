/* ===== Page Recherche globale ===== */
(function () {
  const C = window.Christici;
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  const SECTIONS = [
    { key: 'churches', title: 'Églises', icon: 'fa-church', link: (r) => '/eglises' },
    { key: 'directory', title: 'Organisations & affaires', icon: 'fa-people-group', link: (r) => (r.kind === 'affaire' ? '/affaires' : '/organisations') },
    { key: 'profiles', title: 'Profils chrétiens', icon: 'fa-user-check', link: () => '/profils' },
    { key: 'events', title: 'Événements', icon: 'fa-calendar-days', link: () => '/infos' },
    { key: 'news', title: 'Nouvelles', icon: 'fa-newspaper', link: () => '/infos#nouvelles' },
    { key: 'media', title: 'Médias', icon: 'fa-photo-film', link: () => '/medias' },
  ];

  function sub(r) {
    return [r.category_name, r.denomination, r.title, r.city, r.event_type, r.excerpt]
      .filter(Boolean).map(C.escapeHtml).join(' · ');
  }

  async function run(q) {
    results.innerHTML = C.loading('Recherche en cours…');
    try {
      const { data } = await axios.get('/api/search', { params: { q } });
      if (!data.total) {
        results.innerHTML = C.empty(`Aucun résultat pour « ${C.escapeHtml(q)} ». Essayez d\u2019autres mots-clés.`);
        return;
      }
      results.innerHTML = SECTIONS
        .filter((s) => data.results[s.key]?.length)
        .map((s) => `
          <section class="mb-8">
            <h2 class="font-display text-lg font-bold text-slate-900 mb-3"><i class="fas ${s.icon} mr-2 text-blue-700"></i>${s.title}</h2>
            <div class="space-y-3">
              ${data.results[s.key].map((r) => `
                <a href="${s.link(r)}" class="news-row block">
                  <div class="min-w-0">
                    <h3 class="font-bold text-slate-900">${C.escapeHtml(r.name)}</h3>
                    ${sub(r) ? `<p class="text-sm text-slate-500 mt-1">${sub(r)}</p>` : ''}
                  </div>
                  <i class="fas fa-arrow-right ml-auto self-center text-slate-300"></i>
                </a>`).join('')}
            </div>
          </section>`).join('');
    } catch (e) {
      console.error(e);
      results.innerHTML = C.error();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (q.length >= 2) {
      history.replaceState(null, '', `/recherche?q=${encodeURIComponent(q)}`);
      run(q);
    }
  });

  // Pré-remplir depuis l'URL (recherche rapide de la page d'accueil)
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  if (q) { input.value = q; run(q); }
})();
