/* ===== Christici — frontend ===== */

// --- Menu mobile ---
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = open
      ? '<i class="fas fa-xmark"></i>'
      : '<i class="fas fa-bars"></i>';
  });
  // Fermer le menu au clic sur un lien (mobile)
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

// --- Chargement des contenus depuis l'API ---
const TYPE_LABELS = {
  video: 'Vidéo',
  music: 'Musique',
  image: 'Image',
  article: 'Article',
};

const TYPE_ICONS = {
  video: 'fa-video',
  music: 'fa-music',
  image: 'fa-image',
  article: 'fa-pen-nib',
};

function parseMetadata(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function mediaCard(item) {
  const meta = parseMetadata(item.metadata);
  const thumb =
    item.thumbnail_url ||
    `https://placehold.co/800x500/1e293b/475569?text=${encodeURIComponent(TYPE_LABELS[item.type] || 'Christici')}`;

  const metaBits = [];
  if (meta.duration) metaBits.push(`<span><i class="fas fa-clock mr-1"></i>${escapeHtml(meta.duration)}</span>`);
  if (meta.readingTime) metaBits.push(`<span><i class="fas fa-book-open mr-1"></i>${escapeHtml(meta.readingTime)}</span>`);
  if (meta.genre) metaBits.push(`<span><i class="fas fa-tag mr-1"></i>${escapeHtml(meta.genre)}</span>`);

  return `
    <article class="media-card" data-type="${escapeHtml(item.type)}">
      <div class="thumb">
        <img src="${escapeHtml(thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="type-badge"><i class="fas ${TYPE_ICONS[item.type] || 'fa-file'} mr-1"></i>${TYPE_LABELS[item.type] || item.type}</span>
        ${item.featured ? '<span class="featured-badge" title="À la une"><i class="fas fa-star"></i></span>' : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        ${item.description ? `<p class="card-desc">${escapeHtml(item.description)}</p>` : ''}
        ${metaBits.length ? `<div class="card-meta">${metaBits.join('')}</div>` : ''}
      </div>
    </article>
  `;
}

async function loadHomeSections() {
  const grids = document.querySelectorAll('.media-grid[data-type]');
  if (!grids.length) return;

  try {
    const { data } = await axios.get('/api/media/home');
    grids.forEach((grid) => {
      const type = grid.dataset.type;
      const items = data[type] || [];
      grid.innerHTML = items.length
        ? items.map(mediaCard).join('')
        : `<div class="media-empty">
             <i class="fas ${TYPE_ICONS[type] || 'fa-folder-open'} text-2xl mb-2"></i>
             <p>Aucun contenu pour le moment — cette section sera bientôt remplie.</p>
           </div>`;
    });
  } catch (err) {
    console.error('Erreur de chargement des contenus', err);
    grids.forEach((grid) => {
      grid.innerHTML = `<div class="media-empty">
        <i class="fas fa-triangle-exclamation text-2xl mb-2"></i>
        <p>Impossible de charger les contenus pour le moment.</p>
      </div>`;
    });
  }
}

document.addEventListener('DOMContentLoaded', loadHomeSections);
