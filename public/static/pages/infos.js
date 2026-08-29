/* ===== Page Infos — événements, nouvelles, emplois, publications ===== */
(function () {
  const C = window.Christici;

  async function fill(id, url, render, emptyText) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const { data } = await axios.get(url, { params: { limit: 12 }, timeout: 15000 });
      el.innerHTML = data.items.length ? data.items.map(render).join('') : C.empty(emptyText);
    } catch (e) {
      console.error(e);
      el.innerHTML = C.error();
    }
  }

  fill('events-grid', '/api/infos/events', (ev) => `
    <article class="entry-card">
      ${ev.event_type ? `<span class="tag tag-blue self-start">${C.escapeHtml(ev.event_type)}</span>` : ''}
      <h3>${C.escapeHtml(ev.title)}</h3>
      <div class="entry-meta">
        <span><i class="fas fa-calendar-days"></i>${C.formatDate(ev.start_date)}</span>
        ${ev.location_name ? `<span><i class="fas fa-location-dot"></i>${C.escapeHtml(ev.location_name)}${ev.city ? ', ' + C.escapeHtml(ev.city) : ''}</span>` : ''}
      </div>
      ${ev.description ? `<p class="entry-desc">${C.escapeHtml(ev.description)}</p>` : ''}
    </article>`, 'Aucun événement à venir pour le moment.');

  fill('news-grid', '/api/infos/news', (n) => `
    <article class="entry-card">
      <div class="entry-icon"><i class="fas fa-newspaper"></i></div>
      <h3>${C.escapeHtml(n.title)}</h3>
      ${n.excerpt ? `<p class="entry-desc">${C.escapeHtml(n.excerpt)}</p>` : ''}
      <div class="entry-meta"><span><i class="fas fa-calendar"></i>${C.formatDate(n.created_at)}</span></div>
    </article>`, 'Aucune nouvelle pour le moment.');

  fill('jobs-list', '/api/infos/jobs', (j) => C.jobRow(j), 'Aucune offre d\u2019emploi pour le moment.');

  fill('publications-grid', '/api/infos/publications', (p) => C.publicationCard(p), 'Aucune publication pour le moment.');
})();
