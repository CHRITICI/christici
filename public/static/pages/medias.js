/* ===== Page Médias — vidéos, musique, images, articles ===== */
(function () {
  const C = window.Christici;
  const grid = document.getElementById('media-grid');
  const emptyTexts = {
    video: 'Aucune vidéo pour le moment.',
    music: 'Aucun titre musical pour le moment.',
    image: 'Aucune image pour le moment.',
    article: 'Aucun article pour le moment.',
  };

  async function load(type) {
    grid.innerHTML = C.skeletonCards(6);
    try {
      const { data } = await axios.get('/api/media', { params: { type, limit: 24 }, timeout: 15000 });
      grid.innerHTML = data.items.length
        ? data.items.map((m) => C.mediaCard(m)).join('')
        : C.empty(emptyTexts[type] || 'Aucun contenu pour le moment.');
    } catch (e) {
      console.error(e);
      grid.innerHTML = C.error();
    }
  }

  document.querySelectorAll('.media-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.media-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      load(tab.dataset.tab);
    });
  });

  load('video');
})();
