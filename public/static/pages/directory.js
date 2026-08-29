/* ===== Pages annuaire (organisations / profils / affaires) ===== */
(function () {
  const C = window.Christici;
  const grp = document.querySelector('script[data-grp]')?.dataset.grp || 'organisation';
  const grid = document.getElementById('dir-grid');
  const countEl = document.getElementById('results-count');
  const paginationEl = document.getElementById('pagination');
  const selCategory = document.getElementById('dir-category');
  const inputCity = document.getElementById('dir-city');
  const inputQ = document.getElementById('dir-q');

  const isProfil = grp === 'profil';
  const apiBase = isProfil ? '/api/profiles' : '/api/directory';
  const renderCard = isProfil ? (p) => C.profileCard(p) : (e2) => C.entryCard(e2);

  async function loadCategories() {
    try {
      const { data } = await axios.get('/api/directory/categories', { params: { grp } });
      data.items.forEach((cat) => selCategory.add(new Option(cat.name, cat.slug)));
    } catch (e) { console.error('Catégories indisponibles', e); }
  }

  async function load(page) {
    grid.innerHTML = C.skeletonCards(6);
    countEl.textContent = '';
    paginationEl.innerHTML = '';

    const params = { page, limit: 12 };
    if (!isProfil) params.grp = grp;
    if (selCategory.value) params.category = selCategory.value;
    if (inputCity.value.trim()) params.city = inputCity.value.trim();
    if (inputQ.value.trim()) params.q = inputQ.value.trim();

    try {
      const { data } = await axios.get(apiBase, { params, timeout: 15000 });
      countEl.textContent = data.total ? `${data.total} résultat${data.total > 1 ? 's' : ''}` : '';
      grid.innerHTML = data.items.length
        ? data.items.map(renderCard).join('')
        : C.empty('Aucun résultat ne correspond à votre recherche.');
      C.pagination(paginationEl, data.page, data.pages, load);
    } catch (e) {
      console.error(e);
      grid.innerHTML = C.error('Connexion lente ou interrompue — le chargement n\u2019a pas aboutit.') +
        '<div style="grid-column:1/-1;text-align:center;margin-top:-1rem"><button id="btn-retry" class="btn-primary-sm"><i class="fas fa-rotate-right" style="margin-right:.5rem"></i>Réessayer</button></div>';
      const retry = document.getElementById('btn-retry');
      if (retry) retry.addEventListener('click', () => load(1));
    }
  }

  document.getElementById('btn-filter').addEventListener('click', () => load(1));
  document.getElementById('btn-reset').addEventListener('click', () => {
    selCategory.value = ''; inputCity.value = ''; inputQ.value = ''; load(1);
  });
  inputQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(1); });

  loadCategories().then(() => load(1));
})();
