/* ===== Page Inscription — envoi de la demande via /api/submissions ===== */
(function () {
  const form = document.getElementById('inscription-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit');

  function showStatus(ok, text) {
    status.classList.remove('hidden', 'form-ok', 'form-err');
    status.classList.add(ok ? 'form-ok' : 'form-err');
    status.innerHTML = `<i class="fas ${ok ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-2"></i>${text}`;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      kind: fd.get('kind'),
      name: (fd.get('name') || '').trim(),
      category: (fd.get('category') || '').trim(),
      city: (fd.get('city') || '').trim(),
      contact: (fd.get('contact') || '').trim(),
      message: (fd.get('message') || '').trim(),
    };

    if (!payload.kind) return showStatus(false, 'Choisissez un type d\u2019inscription.');
    if (payload.name.length < 2) return showStatus(false, 'Indiquez le nom de votre structure ou votre nom.');
    if (payload.contact.length < 5) return showStatus(false, 'Indiquez un contact valide (téléphone ou email).');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i>Envoi en cours…';
    try {
      await axios.post('/api/submissions', payload);
      form.reset();
      showStatus(true, 'Votre demande a bien été envoyée. L\u2019équipe Christici vous recontactera pour compléter votre fiche.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Une erreur est survenue. Réessayez dans un instant.';
      showStatus(false, msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Envoyer ma demande';
    }
  });
})();
