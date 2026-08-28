/* ===== Page Églises — filtres + géolocalisation + carte ===== */
(function () {
  const C = window.Christici;
  const grid = document.getElementById('churches-grid');
  const mapEl = document.getElementById('churches-map');
  const countEl = document.getElementById('results-count');
  const paginationEl = document.getElementById('pagination');
  const geoStatus = document.getElementById('geo-status');
  const selRegion = document.getElementById('filter-region');
  const selCity = document.getElementById('filter-city');
  const selDenom = document.getElementById('filter-denomination');
  const selStatus = document.getElementById('filter-status');
  const inputQ = document.getElementById('filter-q');

  let state = { page: 1, near: null, view: 'list' };
  let citiesByRegion = [];
  let lastItems = [];
  let map = null;
  let markersLayer = null;

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
    if (state.view === 'list') grid.innerHTML = C.loading('Recherche des églises…');
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
      if (selStatus && selStatus.value) params.status = selStatus.value;
      if (inputQ.value.trim()) params.q = inputQ.value.trim();
    }

    try {
      const { data } = await axios.get('/api/churches', { params });
      lastItems = data.items || [];
      countEl.textContent = data.total
        ? `${data.total} église${data.total > 1 ? 's' : ''} trouvée${data.total > 1 ? 's' : ''}${state.near ? ' autour de votre position' : ''}`
        : '';
      render();
      C.pagination(paginationEl, data.page, data.pages, load);
    } catch (e) {
      console.error(e);
      grid.innerHTML = C.error();
    }
  }

  function emptyText() {
    return state.near
      ? 'Aucune église répertoriée à moins de 100 km de votre position. Essayez la recherche classique.'
      : 'Aucune église réelle vérifiée pour ces critères pour le moment — Christici n\u2019affiche aucune donnée fictive.';
  }

  function render() {
    if (state.view === 'list') {
      grid.classList.remove('hidden');
      mapEl.classList.add('hidden');
      grid.innerHTML = lastItems.length ? lastItems.map((ch) => C.churchCard(ch)).join('') : C.empty(emptyText());
    } else {
      grid.classList.add('hidden');
      mapEl.classList.remove('hidden');
      renderMap();
    }
  }

  function renderMap() {
    if (typeof L === 'undefined') {
      mapEl.innerHTML = C.error('La carte n\u2019a pas pu être chargée. Vérifiez votre connexion.');
      return;
    }
    if (!map) {
      map = L.map('churches-map');
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      markersLayer = L.layerGroup().addTo(map);
    }
    setTimeout(() => map.invalidateSize(), 50);
    markersLayer.clearLayers();

    const withCoords = lastItems.filter((ch) => ch.latitude != null && ch.longitude != null);
    if (!withCoords.length) {
      map.setView([8.6, 1.0], 7); // Togo par défaut
      return;
    }
    const bounds = [];
    withCoords.forEach((ch) => {
      const marker = L.marker([ch.latitude, ch.longitude]);
      marker.bindPopup(
        `<strong>${C.escapeHtml(ch.name)}</strong><br>` +
        `${ch.denomination ? C.escapeHtml(ch.denomination) + '<br>' : ''}` +
        `${[ch.city, ch.country].filter(Boolean).map(C.escapeHtml).join(', ')}<br>` +
        `<a href="/eglises/${encodeURIComponent(ch.slug)}">Voir la fiche →</a>`
      );
      markersLayer.addLayer(marker);
      bounds.push([ch.latitude, ch.longitude]);
    });
    if (state.near) {
      const [lat, lng] = state.near.split(',').map(Number);
      L.circle([lat, lng], { radius: 300, color: '#1d4ed8' }).addTo(markersLayer);
      bounds.push([lat, lng]);
    }
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  }

  // Bascule Liste / Carte
  const btnList = document.getElementById('view-list');
  const btnMap = document.getElementById('view-map');
  if (btnList && btnMap) {
    btnList.addEventListener('click', () => {
      state.view = 'list';
      btnList.classList.add('active'); btnMap.classList.remove('active');
      render();
    });
    btnMap.addEventListener('click', () => {
      state.view = 'map';
      btnMap.classList.add('active'); btnList.classList.remove('active');
      render();
    });
  }

  // Filtres
  document.getElementById('btn-filter').addEventListener('click', () => { state.near = null; geoStatus.classList.add('hidden'); load(1); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    selRegion.value = ''; selDenom.value = ''; inputQ.value = '';
    if (selStatus) selStatus.value = '';
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
