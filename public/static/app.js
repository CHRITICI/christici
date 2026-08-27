/* ===== Christici — frontend partagé ===== */

// --- Menu mobile ---
(function initNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!navToggle || !navMenu) return;
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
  });
})();

// --- Helpers partagés (exposés en global pour les scripts de page) ---
window.Christici = {
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  },

  parseJson(raw, fallback) {
    try { return JSON.parse(raw || ''); } catch { return fallback; }
  },

  formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso.replace(' ', 'T')).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return iso; }
  },

  dateBadge(iso) {
    if (!iso) return '';
    const d = new Date(iso.replace(' ', 'T'));
    if (isNaN(d)) return '';
    const day = d.getDate();
    const month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    return `<div class="date-badge"><div class="day">${day}</div><div class="month">${month}</div></div>`;
  },

  loading(text) {
    return `<div class="loading-state"><i class="fas fa-circle-notch fa-spin"></i> ${text || 'Chargement…'}</div>`;
  },

  empty(text) {
    return `<div class="empty-state"><i class="fas fa-folder-open text-3xl mb-3 text-slate-300"></i><p>${text}</p></div>`;
  },

  error(text) {
    return `<div class="error-state"><i class="fas fa-triangle-exclamation text-2xl mb-2"></i><p>${text || 'Une erreur est survenue. Réessayez dans un instant.'}</p></div>`;
  },

  // --- Cartes ---
  churchCard(ch) {
    const e = this.escapeHtml;
    const location = [ch.district, ch.city, ch.region].filter(Boolean).map(e).join(' · ');
    const distance = typeof ch.distance_km === 'number' ? `<span class="tag tag-green"><i class="fas fa-location-dot mr-1"></i>${ch.distance_km.toFixed(1)} km</span>` : '';
    return `
      <article class="entry-card">
        <div class="flex items-start gap-3">
          <div class="entry-icon"><i class="fas fa-church"></i></div>
          <div class="min-w-0">
            <h3>${e(ch.name)}</h3>
            <div class="entry-tags mt-1.5">
              ${ch.denomination ? `<span class="tag tag-blue">${e(ch.denomination)}</span>` : ''}
              ${ch.featured ? '<span class="tag tag-amber"><i class="fas fa-star mr-1"></i>À la une</span>' : ''}
              ${distance}
            </div>
          </div>
        </div>
        ${ch.description ? `<p class="entry-desc">${e(ch.description)}</p>` : ''}
        <div class="entry-meta">
          ${location ? `<span><i class="fas fa-location-dot"></i>${location}</span>` : ''}
          ${ch.service_times ? `<span><i class="fas fa-clock"></i>${e(ch.service_times)}</span>` : ''}
        </div>
        ${ch.website ? `<div class="entry-actions"><a href="${e(ch.website)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-arrow-up-right-from-square mr-1"></i>Visiter le site</a></div>` : ''}
      </article>`;
  },

  entryCard(en) {
    const e = this.escapeHtml;
    const location = [en.city, en.region].filter(Boolean).map(e).join(' · ');
    return `
      <article class="entry-card">
        <div class="flex items-start gap-3">
          <div class="entry-icon"><i class="fas fa-building"></i></div>
          <div class="min-w-0">
            <h3>${e(en.name)}</h3>
            <div class="entry-tags mt-1.5">
              ${en.category_name ? `<span class="tag tag-blue">${e(en.category_name)}</span>` : ''}
              ${en.featured ? '<span class="tag tag-amber"><i class="fas fa-star mr-1"></i>À la une</span>' : ''}
            </div>
          </div>
        </div>
        ${en.description ? `<p class="entry-desc">${e(en.description)}</p>` : ''}
        <div class="entry-meta">
          ${location ? `<span><i class="fas fa-location-dot"></i>${location}</span>` : ''}
          ${en.opening_hours ? `<span><i class="fas fa-clock"></i>${e(en.opening_hours)}</span>` : ''}
        </div>
        ${en.website ? `<div class="entry-actions"><a href="${e(en.website)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-arrow-up-right-from-square mr-1"></i>Visiter le site</a></div>` : ''}
      </article>`;
  },

  profileCard(p) {
    const e = this.escapeHtml;
    const skills = this.parseJson(p.skills, []);
    return `
      <article class="entry-card">
        <div class="flex items-start gap-3">
          <div class="entry-icon"><i class="fas fa-user-check"></i></div>
          <div class="min-w-0">
            <h3>${e(p.full_name)}</h3>
            ${p.title ? `<p class="text-sm text-slate-500 mt-0.5">${e(p.title)}</p>` : ''}
            <div class="entry-tags mt-1.5">
              ${p.category_name ? `<span class="tag tag-blue">${e(p.category_name)}</span>` : ''}
              ${p.available ? '<span class="tag tag-green">Disponible</span>' : ''}
            </div>
          </div>
        </div>
        ${p.bio ? `<p class="entry-desc">${e(p.bio)}</p>` : ''}
        ${skills.length ? `<div class="entry-tags">${skills.slice(0, 4).map((s) => `<span class="tag">${e(s)}</span>`).join('')}</div>` : ''}
        <div class="entry-meta">${p.city ? `<span><i class="fas fa-location-dot"></i>${e(p.city)}</span>` : ''}</div>
      </article>`;
  },

  eventRow(ev) {
    const e = this.escapeHtml;
    return `
      <article class="event-row">
        ${this.dateBadge(ev.start_date)}
        <div class="min-w-0">
          <h3 class="font-bold text-slate-900 leading-snug">${e(ev.title)}</h3>
          <div class="entry-meta mt-1.5">
            ${ev.event_type ? `<span><i class="fas fa-tag"></i>${e(ev.event_type)}</span>` : ''}
            ${ev.location_name ? `<span><i class="fas fa-location-dot"></i>${e(ev.location_name)}${ev.city ? ', ' + e(ev.city) : ''}</span>` : ''}
            ${ev.organizer ? `<span><i class="fas fa-user"></i>${e(ev.organizer)}</span>` : ''}
          </div>
          ${ev.description ? `<p class="entry-desc mt-2">${e(ev.description)}</p>` : ''}
        </div>
      </article>`;
  },

  newsRow(n) {
    const e = this.escapeHtml;
    return `
      <article class="news-row">
        <div class="entry-icon flex-shrink-0"><i class="fas fa-newspaper"></i></div>
        <div class="min-w-0">
          <h3 class="font-bold text-slate-900 leading-snug">${e(n.title)}</h3>
          ${n.excerpt ? `<p class="entry-desc mt-1.5">${e(n.excerpt)}</p>` : ''}
          <div class="entry-meta mt-1.5"><span><i class="fas fa-calendar"></i>${this.formatDate(n.created_at)}</span></div>
        </div>
      </article>`;
  },

  jobRow(j) {
    const e = this.escapeHtml;
    return `
      <article class="job-row">
        <div class="entry-icon flex-shrink-0"><i class="fas fa-user-tie"></i></div>
        <div class="min-w-0">
          <h3 class="font-bold text-slate-900 leading-snug">${e(j.title)}</h3>
          <div class="entry-meta mt-1.5">
            ${j.organization ? `<span><i class="fas fa-building"></i>${e(j.organization)}</span>` : ''}
            ${j.city ? `<span><i class="fas fa-location-dot"></i>${e(j.city)}</span>` : ''}
            ${j.contract_type ? `<span><i class="fas fa-file-contract"></i>${e(j.contract_type)}</span>` : ''}
            ${j.deadline ? `<span><i class="fas fa-hourglass-end"></i>Avant le ${this.formatDate(j.deadline)}</span>` : ''}
          </div>
          ${j.description ? `<p class="entry-desc mt-2">${e(j.description)}</p>` : ''}
        </div>
      </article>`;
  },

  publicationCard(p) {
    const e = this.escapeHtml;
    return `
      <article class="entry-card">
        <div class="flex items-start gap-3">
          <div class="entry-icon"><i class="fas fa-book-open"></i></div>
          <div class="min-w-0">
            <h3>${e(p.title)}</h3>
            ${p.author ? `<p class="text-sm text-slate-500 mt-0.5"><i class="fas fa-feather mr-1"></i>${e(p.author)}</p>` : ''}
          </div>
        </div>
        ${p.description ? `<p class="entry-desc">${e(p.description)}</p>` : ''}
        <div class="entry-meta">${p.published_date ? `<span><i class="fas fa-calendar"></i>${this.formatDate(p.published_date)}</span>` : ''}</div>
        ${p.link ? `<div class="entry-actions"><a href="${e(p.link)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-arrow-up-right-from-square mr-1"></i>Consulter l'ouvrage</a></div>` : ''}
      </article>`;
  },

  mediaCard(item) {
    const e = this.escapeHtml;
    const meta = this.parseJson(item.metadata, {});
    const labels = { video: 'Vidéo', music: 'Musique', image: 'Image', article: 'Article' };
    const icons = { video: 'fa-video', music: 'fa-music', image: 'fa-image', article: 'fa-pen-nib' };
    const thumb = item.thumbnail_url ||
      `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(labels[item.type] || 'Christici')}`;
    const bits = [];
    if (meta.duration) bits.push(`<span><i class="fas fa-clock mr-1"></i>${e(meta.duration)}</span>`);
    if (meta.readingTime) bits.push(`<span><i class="fas fa-book-open mr-1"></i>${e(meta.readingTime)}</span>`);
    if (meta.genre) bits.push(`<span><i class="fas fa-tag mr-1"></i>${e(meta.genre)}</span>`);
    return `
      <article class="media-card" data-type="${e(item.type)}">
        <div class="thumb">
          <img src="${e(thumb)}" alt="${e(item.title)}" loading="lazy" />
          <span class="type-badge"><i class="fas ${icons[item.type] || 'fa-file'} mr-1"></i>${labels[item.type] || item.type}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${e(item.title)}</h3>
          ${item.description ? `<p class="card-desc">${e(item.description)}</p>` : ''}
          ${bits.length ? `<div class="card-meta">${bits.join('')}</div>` : ''}
        </div>
      </article>`;
  },

  pagination(container, page, pages, onGo) {
    if (!container) return;
    if (pages <= 1) { container.innerHTML = ''; return; }
    let html = `<button class="page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let p = 1; p <= pages; p++) {
      if (pages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== pages) {
        if (!html.endsWith('…')) html += '<span class="self-center text-slate-400">…</span>';
        continue;
      }
      html += `<button class="page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    html += `<button class="page-btn" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = html;
    container.querySelectorAll('.page-btn[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => onGo(Number(btn.dataset.page)));
    });
  },
};

// --- Page d'accueil : charge l'agrégat /api/home ---
(async function loadHome() {
  if (!document.getElementById('home-churches-grid')) return;
  const C = window.Christici;
  let data = null;
  try {
    const res = await axios.get('/api/home');
    data = res.data;
  } catch (err) {
    console.error(err);
    ['home-churches-grid', 'home-organisations-grid', 'home-profils-grid', 'home-media-grid'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = C.error();
    });
    ['home-events-list', 'home-news-list'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = C.error();
    });
    return;
  }

  // Stats
  const statLabels = ['Églises', 'Organisations', 'Affaires', 'Profils', 'Événements', 'Médias'];
  const statValues = [data.stats.churches, data.stats.organisations, data.stats.affaires, data.stats.profils, data.stats.events, data.stats.medias];
  document.querySelectorAll('#stats-grid .stat-card').forEach((card, i) => {
    const num = card.querySelector('.stat-num');
    if (num) num.textContent = statValues[i];
  });

  // Églises
  const churchesGrid = document.getElementById('home-churches-grid');
  churchesGrid.innerHTML = data.churches.length
    ? data.churches.map((ch) => C.churchCard(ch)).join('')
    : C.empty("Aucune église répertoriée pour le moment — l'annuaire démarre au Togo.");

  // Organisations
  const orgsGrid = document.getElementById('home-organisations-grid');
  orgsGrid.innerHTML = data.organisations.length
    ? data.organisations.map((o) => C.entryCard(o)).join('')
    : C.empty('Aucune organisation répertoriée pour le moment.');

  // Événements
  const eventsList = document.getElementById('home-events-list');
  eventsList.innerHTML = data.events.length
    ? data.events.map((ev) => C.eventRow(ev)).join('')
    : C.empty('Aucun événement à venir pour le moment.');

  // Nouvelles
  const newsList = document.getElementById('home-news-list');
  newsList.innerHTML = data.news.length
    ? data.news.map((n) => C.newsRow(n)).join('')
    : C.empty('Aucune nouvelle pour le moment.');

  // Profils
  const profilsGrid = document.getElementById('home-profils-grid');
  profilsGrid.innerHTML = data.profils.length
    ? data.profils.map((p) => C.profileCard(p)).join('')
    : C.empty('Aucun profil répertorié pour le moment.');

  // Médias (onglets)
  const mediaGrid = document.getElementById('home-media-grid');
  function renderMediaTab(type) {
    const items = (data.media && data.media[type]) || [];
    mediaGrid.innerHTML = items.length
      ? items.map((m) => C.mediaCard(m)).join('')
      : C.empty('Aucun contenu dans cette catégorie pour le moment.');
  }
  document.querySelectorAll('.media-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.media-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderMediaTab(tab.dataset.tab);
    });
  });
  renderMediaTab('video');
})();
