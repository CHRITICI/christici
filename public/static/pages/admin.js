/* Espace administrateur Christici — tableau de bord, CRUD, modération */
(function () {
  'use strict';
  const C = window.Christici;
  const $ = (id) => document.getElementById(id);
  const e = (s) => C.escapeHtml(s);

  const elLoading = $('admin-loading');
  const elDenied = $('admin-denied');
  const elApp = $('admin-app');
  if (!elLoading || !elApp) return;

  /* ---------------- Colonnes affichées par entité ---------------- */
  const COLUMNS = {
    churches: [
      ['name', 'Nom'], ['denomination', 'Confession'], ['city', 'Ville'],
      ['country', 'Pays'], ['status', 'Statut'], ['source', 'Source'], ['published', 'Publiée'],
    ],
    directory: [
      ['name', 'Nom'], ['city', 'Ville'], ['country', 'Pays'],
      ['status', 'Statut'], ['published', 'Publiée'],
    ],
    profiles: [
      ['full_name', 'Nom'], ['title', 'Titre'], ['city', 'Ville'],
      ['available', 'Dispo.'], ['status', 'Statut'], ['published', 'Publié'],
    ],
    events: [
      ['title', 'Titre'], ['event_type', 'Type'], ['start_date', 'Date'],
      ['city', 'Ville'], ['published', 'Publié'],
    ],
    news: [['title', 'Titre'], ['source', 'Source'], ['published', 'Publiée'], ['created_at', 'Créée le']],
    jobs: [['title', 'Poste'], ['organization', 'Organisation'], ['city', 'Ville'], ['deadline', 'Échéance'], ['published', 'Publiée']],
    publications: [['title', 'Titre'], ['author', 'Auteur'], ['published_date', 'Date'], ['published', 'Publiée']],
    media: [['type', 'Type'], ['title', 'Titre'], ['published', 'Publié'], ['created_at', 'Créé le']],
  };

  const CRUD_TABS = Object.keys(COLUMNS);
  const STATUS_LABELS = { a_verifier: 'À vérifier', verifiee: 'Vérifiée', signalee: 'Signalée' };
  const TEXTAREA_FIELDS = ['description', 'body', 'bio', 'excerpt'];
  const NUMBER_FIELDS = ['latitude', 'longitude', 'featured', 'published', 'category_id', 'available', 'claimed_by'];
  const SELECT_FIELDS = {
    status: [['a_verifier', 'À vérifier'], ['verifiee', 'Vérifiée'], ['signalee', 'Signalée']],
    published: [['1', 'Publiée'], ['0', 'Non publiée']],
    featured: [['0', 'Non'], ['1', 'À la une']],
    available: [['0', 'Non'], ['1', 'Oui']],
    type: [['video', 'Vidéo'], ['music', 'Musique'], ['image', 'Image'], ['article', 'Article']],
  };

  const state = { tab: 'churches', page: 1, q: '', status: '', published: '' };

  /* ---------------- Démarrage : vérification du rôle ---------------- */
  axios.get('/api/auth/me')
    .then((res) => {
      const user = res.data && res.data.user;
      if (user && user.role === 'admin') {
        elLoading.classList.add('hidden');
        elApp.classList.remove('hidden');
        init();
      } else {
        elLoading.classList.add('hidden');
        elDenied.classList.remove('hidden');
      }
    })
    .catch(() => {
      elLoading.classList.add('hidden');
      elDenied.classList.remove('hidden');
    });

  function init() {
    loadStats();
    document.querySelectorAll('#admin-tabs .admin-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#admin-tabs .admin-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.tab = btn.dataset.tab;
        state.page = 1;
        renderToolbar();
        loadTab();
      });
    });
    $('admin-search-btn').addEventListener('click', () => {
      state.q = $('admin-q').value.trim();
      state.status = $('admin-status').value;
      state.published = $('admin-published').value;
      state.page = 1;
      loadTab();
    });
    document.querySelectorAll('[data-modal-close]').forEach((b) =>
      b.addEventListener('click', () => $('modal-edit').classList.add('hidden'))
    );
    $('form-edit').addEventListener('submit', saveEdit);
    renderToolbar();
    loadTab();
  }

  /* ---------------- Statistiques ---------------- */
  function loadStats() {
    axios.get('/api/admin/stats').then((res) => {
      const s = res.data;
      const cards = [
        [s.churches, 'Églises'], [s.churches_verifiees, 'dont vérifiées'],
        [s.directory, 'Annuaire'], [s.profiles, 'Profils'], [s.events, 'Événements'],
        [s.news, 'Nouvelles'], [s.jobs, 'Emplois'], [s.media, 'Médias'],
        [s.pending_reports, 'Signalements'], [s.pending_claims, 'Revendications'],
      ];
      $('admin-stats').innerHTML = cards
        .map(([v, l]) => `<div class="stat-mini"><div class="v">${e(String(v ?? 0))}</div><div class="l">${e(l)}</div></div>`)
        .join('');
      document.querySelectorAll('[data-count]').forEach((el) => {
        const v = s[el.dataset.count];
        el.textContent = v > 0 ? String(v) : '';
        el.style.display = v > 0 ? '' : 'none';
      });
    }).catch(() => {});
  }

  /* ---------------- Barre d'outils selon l'onglet ---------------- */
  function renderToolbar() {
    const isCrud = CRUD_TABS.includes(state.tab);
    $('admin-toolbar').style.display = isCrud ? '' : 'none';
  }

  function loadTab() {
    if (CRUD_TABS.includes(state.tab)) return loadCrudList();
    if (state.tab === 'reports') return loadReports();
    if (state.tab === 'claims') return loadClaims();
    if (state.tab === 'submissions') return loadSubmissions();
    if (state.tab === 'duplicates') return loadDuplicates();
    if (state.tab === 'users') return loadUsers();
  }

  /* ---------------- CRUD générique ---------------- */
  function statusBadge(st) {
    const cls = st === 'verifiee' ? 'admin-badge-ok' : st === 'signalee' ? 'admin-badge-ko' : 'admin-badge-pending';
    return `<span class="admin-badge ${cls}">${e(STATUS_LABELS[st] || st || '—')}</span>`;
  }

  function cellVal(entity, key, val) {
    if (val == null || val === '') return '<span class="text-slate-300">—</span>';
    if (key === 'status') return statusBadge(val);
    if (key === 'published' || key === 'featured' || key === 'available')
      return Number(val) ? '<span class="admin-badge admin-badge-ok">Oui</span>' : '<span class="admin-badge admin-badge-pending">Non</span>';
    if (key === 'created_at' || key === 'start_date' || key === 'deadline' || key === 'published_date')
      return e(String(val).slice(0, 10));
    return e(String(val)).slice(0, 80);
  }

  function loadCrudList() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Chargement des fiches…');
    $('admin-pagination').innerHTML = '';
    const params = { page: state.page };
    if (state.q) params.q = state.q;
    if (state.status) params.status = state.status;
    if (state.published !== '') params.published = state.published;

    axios.get('/api/admin/list/' + state.tab, { params }).then((res) => {
      const { items, total, page, pages, hasStatus, hasPublished } = res.data;
      $('admin-status-wrap').style.display = hasStatus ? '' : 'none';
      $('admin-published-wrap').style.display = hasPublished ? '' : 'none';

      if (!items.length) {
        content.innerHTML = C.empty('Aucune fiche. La plateforme n\u2019affiche que des données réelles — ajoutez-en via « Nouvelle fiche » ou un import vérifié.');
      } else {
        const cols = COLUMNS[state.tab];
        const rows = items.map((it) => `
          <tr>
            ${cols.map(([k]) => `<td>${cellVal(state.tab, k, it[k])}</td>`).join('')}
            <td class="whitespace-nowrap">
              <button class="page-btn" data-edit="${it.id}" title="Modifier"><i class="fas fa-pen"></i></button>
              <button class="page-btn" data-delete="${it.id}" title="Supprimer"><i class="fas fa-trash text-red-500"></i></button>
            </td>
          </tr>`).join('');
        content.innerHTML = `
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">${total} fiche(s)</p>
            <button class="btn-primary-sm" id="btn-new"><i class="fas fa-plus mr-2"></i>Nouvelle fiche</button>
          </div>
          <div class="detail-card" style="padding:0; overflow-x:auto;">
            <table class="admin-table">
              <thead><tr>${cols.map(([, l]) => `<th>${e(l)}</th>`).join('')}<th>Actions</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
        $('btn-new').addEventListener('click', () => openEdit(null));
        content.querySelectorAll('[data-edit]').forEach((b) =>
          b.addEventListener('click', () => openEdit(Number(b.dataset.edit)))
        );
        content.querySelectorAll('[data-delete]').forEach((b) =>
          b.addEventListener('click', () => deleteItem(Number(b.dataset.delete)))
        );
      }
      C.pagination($('admin-pagination'), page, pages, (p) => { state.page = p; loadCrudList(); });
    }).catch((err) => {
      content.innerHTML = C.error((err.response && err.response.data && err.response.data.error) || undefined);
    });
  }

  function openEdit(id) {
    const modal = $('modal-edit');
    const fields = $('edit-fields');
    const msg = $('edit-msg');
    msg.classList.add('hidden');
    $('modal-edit-title').textContent = id ? 'Modifier la fiche #' + id : 'Nouvelle fiche';

    const build = (item, editable) => {
      fields.innerHTML = editable.map((f) => {
        const v = item && item[f] != null ? String(item[f]) : '';
        const label = `<label class="filter-label">${e(f)}</label>`;
        if (SELECT_FIELDS[f]) {
          return `<div>${label}<select class="filter-input" data-field="${e(f)}">` +
            SELECT_FIELDS[f].map(([val, lab]) =>
              `<option value="${val}" ${String(v) === val ? 'selected' : ''}>${e(lab)}</option>`).join('') +
            '</select></div>';
        }
        if (TEXTAREA_FIELDS.includes(f)) {
          return `<div class="sm:col-span-2">${label}<textarea class="filter-input" rows="3" data-field="${e(f)}">${e(v)}</textarea></div>`;
        }
        const type = NUMBER_FIELDS.includes(f) ? 'number' : 'text';
        const step = f === 'latitude' || f === 'longitude' ? ' step="any"' : '';
        return `<div>${label}<input type="${type}"${step} class="filter-input" data-field="${e(f)}" value="${e(v)}"></div>`;
      }).join('');
      modal.dataset.editId = id || '';
      modal.classList.remove('hidden');
    };

    if (id) {
      axios.get(`/api/admin/item/${state.tab}/${id}`).then((res) => build(res.data.item, res.data.editable))
        .catch((err) => alert((err.response && err.response.data && err.response.data.error) || 'Erreur de chargement'));
    } else {
      axios.get(`/api/admin/list/${state.tab}?page=1`).then((res) => build(null, res.data.editable))
        .catch(() => build(null, []));
    }
  }

  function saveEdit(ev) {
    ev.preventDefault();
    const modal = $('modal-edit');
    const msg = $('edit-msg');
    const id = modal.dataset.editId ? Number(modal.dataset.editId) : null;
    const payload = {};
    $('edit-fields').querySelectorAll('[data-field]').forEach((inp) => {
      const f = inp.dataset.field;
      let v = inp.value;
      if (NUMBER_FIELDS.includes(f)) v = v === '' ? null : Number(v);
      payload[f] = v;
    });
    const req = id
      ? axios.put(`/api/admin/item/${state.tab}/${id}`, payload)
      : axios.post(`/api/admin/item/${state.tab}`, payload);
    req.then(() => {
      msg.textContent = 'Enregistré.';
      msg.classList.remove('hidden', 'form-err');
      msg.classList.add('form-ok');
      setTimeout(() => { modal.classList.add('hidden'); loadCrudList(); loadStats(); }, 600);
    }).catch((err) => {
      msg.textContent = (err.response && err.response.data && err.response.data.error) || 'Erreur d\u2019enregistrement.';
      msg.classList.remove('hidden', 'form-ok');
      msg.classList.add('form-err');
    });
  }

  function deleteItem(id) {
    if (!confirm('Supprimer définitivement cette fiche ?')) return;
    axios.delete(`/api/admin/item/${state.tab}/${id}`)
      .then(() => { loadCrudList(); loadStats(); })
      .catch((err) => alert((err.response && err.response.data && err.response.data.error) || 'Suppression impossible'));
  }

  /* ---------------- Signalements ---------------- */
  function loadReports() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Chargement des signalements…');
    axios.get('/api/admin/reports?status=all').then((res) => {
      const items = res.data.items;
      if (!items.length) { content.innerHTML = C.empty('Aucun signalement.'); return; }
      content.innerHTML = `<div class="detail-card" style="padding:0; overflow-x:auto;"><table class="admin-table">
        <thead><tr><th>Date</th><th>Fiche</th><th>Motif</th><th>Détails</th><th>Contact</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>${items.map((r) => `
          <tr>
            <td>${e(String(r.created_at).slice(0, 10))}</td>
            <td>${e(r.entity_type)} #${r.entity_id ?? '—'}</td>
            <td>${e(r.reason)}</td>
            <td>${e((r.details || '').slice(0, 120))}</td>
            <td>${e(r.reporter_email || r.user_email || '—')}</td>
            <td><span class="admin-badge ${r.status === 'pending' ? 'admin-badge-pending' : r.status === 'resolved' ? 'admin-badge-ok' : 'admin-badge-ko'}">${e(r.status)}</span></td>
            <td class="whitespace-nowrap">${r.status === 'pending' ? `
              <button class="page-btn" data-resolve="${r.id}" title="Marquer résolu"><i class="fas fa-check text-green-600"></i></button>
              <button class="page-btn" data-reject="${r.id}" title="Rejeter"><i class="fas fa-xmark text-red-500"></i></button>` : ''}</td>
          </tr>`).join('')}</tbody></table></div>`;
      content.querySelectorAll('[data-resolve]').forEach((b) =>
        b.addEventListener('click', () => reviewReport(b.dataset.resolve, 'resolved')));
      content.querySelectorAll('[data-reject]').forEach((b) =>
        b.addEventListener('click', () => reviewReport(b.dataset.reject, 'rejected')));
    }).catch(() => { content.innerHTML = C.error(); });
  }

  function reviewReport(id, status) {
    axios.post(`/api/admin/reports/${id}/resolve`, { status })
      .then(() => { loadReports(); loadStats(); })
      .catch(() => alert('Action impossible'));
  }

  /* ---------------- Revendications ---------------- */
  function loadClaims() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Chargement des revendications…');
    axios.get('/api/admin/claims?status=all').then((res) => {
      const items = res.data.items;
      if (!items.length) { content.innerHTML = C.empty('Aucune revendication.'); return; }
      content.innerHTML = `<div class="detail-card" style="padding:0; overflow-x:auto;"><table class="admin-table">
        <thead><tr><th>Date</th><th>Fiche</th><th>Contact</th><th>Rôle</th><th>Message</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>${items.map((cl) => `
          <tr>
            <td>${e(String(cl.created_at).slice(0, 10))}</td>
            <td>${e(cl.entity_name || (cl.entity_type + ' #' + cl.entity_id))}</td>
            <td>${e(cl.contact_name)}<br><span class="text-slate-400">${e(cl.contact_email)}${cl.contact_phone ? ' · ' + e(cl.contact_phone) : ''}</span></td>
            <td>${e(cl.role_in_entity || '—')}</td>
            <td>${e((cl.message || '').slice(0, 120))}</td>
            <td><span class="admin-badge ${cl.status === 'pending' ? 'admin-badge-pending' : cl.status === 'approved' ? 'admin-badge-ok' : 'admin-badge-ko'}">${e(cl.status)}</span></td>
            <td class="whitespace-nowrap">${cl.status === 'pending' ? `
              <button class="page-btn" data-approve="${cl.id}" title="Approuver (passe la fiche en vérifiée)"><i class="fas fa-check text-green-600"></i></button>
              <button class="page-btn" data-reject="${cl.id}" title="Rejeter"><i class="fas fa-xmark text-red-500"></i></button>` : ''}</td>
          </tr>`).join('')}</tbody></table></div>`;
      content.querySelectorAll('[data-approve]').forEach((b) =>
        b.addEventListener('click', () => reviewClaim(b.dataset.approve, 'approved')));
      content.querySelectorAll('[data-reject]').forEach((b) =>
        b.addEventListener('click', () => reviewClaim(b.dataset.reject, 'rejected')));
    }).catch(() => { content.innerHTML = C.error(); });
  }

  function reviewClaim(id, decision) {
    if (decision === 'approved' && !confirm('Approuver ? La fiche passera au statut « Vérifiée ».')) return;
    axios.post(`/api/admin/claims/${id}/review`, { decision })
      .then(() => { loadClaims(); loadStats(); })
      .catch(() => alert('Action impossible'));
  }

  /* ---------------- Soumissions publiques ---------------- */
  function loadSubmissions() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Chargement des soumissions…');
    axios.get('/api/admin/submissions?status=all').then((res) => {
      const items = res.data.items;
      if (!items.length) { content.innerHTML = C.empty('Aucune soumission publique.'); return; }
      content.innerHTML = `<div class="detail-card" style="padding:0; overflow-x:auto;"><table class="admin-table">
        <thead><tr><th>Date</th><th>Type</th><th>Nom</th><th>Contact</th><th>Détails</th><th>Statut</th><th>Actions</th></tr></thead>
        <tbody>${items.map((s) => `
          <tr>
            <td>${e(String(s.created_at).slice(0, 10))}</td>
            <td>${e(s.kind)}</td>
            <td>${e(s.name)}</td>
            <td>${e(s.contact || '—')}</td>
            <td>${e((s.details || '').slice(0, 120))}</td>
            <td><span class="admin-badge ${s.status === 'pending' ? 'admin-badge-pending' : s.status === 'approved' ? 'admin-badge-ok' : 'admin-badge-ko'}">${e(s.status)}</span></td>
            <td class="whitespace-nowrap">${s.status === 'pending' ? `
              <button class="page-btn" data-approve="${s.id}" title="Approuver"><i class="fas fa-check text-green-600"></i></button>
              <button class="page-btn" data-reject="${s.id}" title="Rejeter"><i class="fas fa-xmark text-red-500"></i></button>` : ''}</td>
          </tr>`).join('')}</tbody></table></div>`;
      content.querySelectorAll('[data-approve]').forEach((b) =>
        b.addEventListener('click', () => setSubmission(b.dataset.approve, 'approved')));
      content.querySelectorAll('[data-reject]').forEach((b) =>
        b.addEventListener('click', () => setSubmission(b.dataset.reject, 'rejected')));
    }).catch(() => { content.innerHTML = C.error(); });
  }

  function setSubmission(id, status) {
    axios.post(`/api/admin/submissions/${id}/status`, { status })
      .then(() => { loadSubmissions(); loadStats(); })
      .catch(() => alert('Action impossible'));
  }

  /* ---------------- Doublons ---------------- */
  function loadDuplicates() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Analyse des doublons…');
    axios.get('/api/admin/duplicates/churches').then((res) => {
      const { by_name_city, by_geo } = res.data;
      const section = (title, rows, note) => `
        <div class="detail-card mb-6">
          <h2 class="detail-title">${e(title)}</h2>
          ${rows.length ? `<table class="admin-table">
            <thead><tr><th>Occurrences</th><th>Fiches</th><th>IDs</th></tr></thead>
            <tbody>${rows.map((r) => `
              <tr><td>${r.n}</td><td>${e(r.names)}</td><td class="text-slate-400">${e(r.ids)}</td></tr>`).join('')}
            </tbody></table>
            <p class="text-xs text-slate-400 mt-2">${e(note)}</p>`
          : '<p class="text-sm text-slate-500">Aucun doublon détecté.</p>'}
        </div>`;
      content.innerHTML =
        section('Même nom + même ville', by_name_city, 'Ouvrez les fiches (onglet Églises) et fusionnez/supprimez les doublons confirmés.') +
        section('Coordonnées GPS quasi identiques', by_geo, 'Deux fiches à moins de ~110 m l\u2019une de l\u2019autre.');
    }).catch(() => { content.innerHTML = C.error(); });
  }

  /* ---------------- Utilisateurs ---------------- */
  function loadUsers() {
    const content = $('admin-content');
    content.innerHTML = C.loading('Chargement des utilisateurs…');
    axios.get('/api/admin/users').then((res) => {
      const items = res.data.items;
      if (!items.length) { content.innerHTML = C.empty('Aucun utilisateur.'); return; }
      content.innerHTML = `<div class="detail-card" style="padding:0; overflow-x:auto;"><table class="admin-table">
        <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Actions</th></tr></thead>
        <tbody>${items.map((u) => `
          <tr>
            <td>${u.id}</td>
            <td>${e(u.name)}</td>
            <td>${e(u.email)}</td>
            <td><span class="admin-badge ${u.role === 'admin' ? 'admin-badge-ok' : 'admin-badge-pending'}">${e(u.role)}</span></td>
            <td>${e(String(u.created_at).slice(0, 10))}</td>
            <td><button class="page-btn" data-toggle-role="${u.id}" data-role="${e(u.role)}" title="Changer le rôle">
              <i class="fas fa-user-shield"></i></button></td>
          </tr>`).join('')}</tbody></table></div>`;
      content.querySelectorAll('[data-toggle-role]').forEach((b) =>
        b.addEventListener('click', () => {
          const next = b.dataset.role === 'admin' ? 'user' : 'admin';
          if (!confirm(`Passer cet utilisateur au rôle « ${next} » ?`)) return;
          axios.post(`/api/admin/users/${b.dataset.toggleRole}/role`, { role: next })
            .then(loadUsers)
            .catch((err) => alert((err.response && err.response.data && err.response.data.error) || 'Action impossible'));
        }));
    }).catch(() => { content.innerHTML = C.error(); });
  }
})();
