/* ===== Page Églises — filtres + géolocalisation ===== */
(function () {
  const C = window.Christici;
  const grid = document.getElementById('churches-grid');
  const countEl = document.getElementById('results-count');
  const paginationEl = document.getElementById('pagination');
  const geoStatus = document.getElementById('geo-status');
  const selRegion = document.getElementById('filter-region');
  const selCity = document.getElementById('filter-city');
  const selDenom = document.getElementById('filter-denomination');
  const inputQ = document.getElementById('filter-q');

  let state = { page: 1, near: null };
  let citiesByRegion = [];

  async function loadFilters() {
    try {
      const { data } = await axios.get('/api/churches/filters');
      citiesByRegion = data.cities || [];
      data.regions.forEach((r) => selRegion.add(new Option(r, r)));
      data.denominations.forEach((d) => selDenom.add(new Option(d, d)));
      updateCities();
    } catch (e) {
      console.error('Filtres indisponibles', e);
    }
  }

  function updateCities() {
    const region = selRegion.value;
    const current = selCity.value;
    selCity.innerHTML = '<option value="">Toutes les villes</option>';
    citiesByRegion
      .filter((row) => !region || row.region === region)
      .forEach((row) => selCity.add(new Option(row.city, row.city)));
    if ([...selCity.options].some((o) => o.value === current)) selCity.value = current;
  }

  async function load(page) {
    state.page = page;
    grid.innerHTML = C.loading('Recherche des églises…');
    countEl.textContent = '';
    paginationEl.innerHTML = '';

    const params = { page, limit: 12 };
    if (state.near) {
      params.near = state.near;
      params.radius = 100;
    } else {
      if (selRegion.value) params.region = selRegion.value;
      if (selCity.value) params.city = selCity.value;
      if (selDenom.value) params.denomination = selDenom.value;
      if (inputQ.value.trim()) params.q = inputQ.value.trim();
    }

    try {
      const { data } = await axios.get('/api/churches', { params });
      countEl.textContent = data.total
        ? `${data.total} église${data.total > 1 ? 's' : ''} trouvée${data.total > 1 ? 's' : ''}${state.near ? ' autour de votre position' : ''}`
        : '';
      grid.innerHTML = data.items.length
        ? data.items.map((ch) => C.churchCard(ch)).join('')
        : C.empty(state.near
            ? 'Aucune église répertoriée à moins de 100 km de votre position. Essayez la recherche classique.'
            : 'Aucune église ne correspond à votre recherche.');
      C.pagination(paginationEl, data.page, data.pages, load);
    } catch (e) {
      console.error(e);
      grid.innerHTML = C.error();
    }
  }

  // Filtres
  document.getElementById('btn-filter').addEventListener('click', () => { state.near = null; geoStatus.classList.add('hidden'); load(1); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    selRegion.value = ''; selDenom.value = ''; inputQ.value = '';
    updateCities(); state.near = null; geoStatus.classList.add('hidden'); load(1);
  });
  selRegion.addEventListener('change', updateCities);
  inputQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') { state.near = null; load(1); } });

  // Géolocalisation — ne bloque jamais le site si refusée
  document.getElementById('btn-nearby').addEventListener('click', () => {
    const btn = document.getElementById('btn-nearby');
    geoStatus.classList.remove('hidden');
    if (!('geolocation' in navigator)) {
      geoStatus.textContent = 'La géolocalisation n\u2019est pas disponible sur cet appareil. Utilisez la recherche par région, ville ou quartier.';
      return;
    }
    btn.disabled = true;
    geoStatus.textContent = 'Localisation en cours… (autorisation demandée par votre navigateur)';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        btn.disabled = false;
        state.near = `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}`;
        geoStatus.textContent = 'Position trouvée — affichage des églises les plus proches.';
        load(1);
      },
      (err) => {
        btn.disabled = false;
        state.near = null;
        geoStatus.textContent = err.code === 1
          ? 'Géolocalisation refusée. Aucun problème : utilisez la recherche par région, ville ou quartier ci-dessus.'
          : 'Position indisponible pour le moment. Utilisez la recherche classique.';
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  });

  loadFilters().then(() => load(1));
})();
