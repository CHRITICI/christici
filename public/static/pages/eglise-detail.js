/* Fiche église — modales Signaler / Revendiquer */
(function () {
  'use strict';

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
  }
  function closeModals() {
    document.querySelectorAll('.modal').forEach((m) => m.classList.add('hidden'));
  }

  // Ouverture des modales
  document.querySelectorAll('[data-report-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('report-entity-type').value = btn.dataset.entityType || 'church';
      document.getElementById('report-entity-id').value = btn.dataset.entityId || '';
      document.getElementById('report-entity-label').textContent =
        'Fiche concernée : ' + (btn.dataset.entityName || '');
      openModal('modal-report');
    });
  });
  document.querySelectorAll('[data-claim-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('claim-entity-type').value = btn.dataset.entityType || 'church';
      document.getElementById('claim-entity-id').value = btn.dataset.entityId || '';
      const label = document.getElementById('claim-entity-label');
      if (label) label.textContent = btn.dataset.entityName || 'cette fiche';
      openModal('modal-claim');
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', closeModals);
  });
  document.querySelectorAll('.modal').forEach((m) => {
    m.addEventListener('click', (ev) => { if (ev.target === m) closeModals(); });
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeModals(); });

  function showMsg(el, text, ok) {
    el.textContent = text;
    el.classList.remove('hidden', 'form-ok', 'form-err');
    el.classList.add(ok ? 'form-ok' : 'form-err');
    el.style.padding = '0.6rem 0.8rem';
    el.style.borderRadius = '0.7rem';
  }

  // Soumission signalement
  const formReport = document.getElementById('form-report');
  if (formReport) {
    formReport.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const msg = document.getElementById('report-msg');
      const payload = {
        entity_type: document.getElementById('report-entity-type').value,
        entity_id: Number(document.getElementById('report-entity-id').value) || null,
        reason: document.getElementById('report-reason').value,
        details: document.getElementById('report-details').value,
        reporter_email: document.getElementById('report-email').value,
      };
      try {
        await axios.post('/api/reports', payload);
        showMsg(msg, 'Merci ! Votre signalement a été transmis à notre équipe de modération.', true);
        formReport.reset();
        setTimeout(closeModals, 1800);
      } catch (err) {
        showMsg(msg, (err.response && err.response.data && err.response.data.error) || 'Erreur lors de l\u2019envoi. Réessayez.', false);
      }
    });
  }

  // Soumission revendication
  const formClaim = document.getElementById('form-claim');
  if (formClaim) {
    formClaim.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const msg = document.getElementById('claim-msg');
      const payload = {
        entity_type: document.getElementById('claim-entity-type').value,
        entity_id: Number(document.getElementById('claim-entity-id').value) || null,
        contact_name: document.getElementById('claim-name').value,
        contact_email: document.getElementById('claim-email').value,
        contact_phone: document.getElementById('claim-phone').value,
        role_in_entity: document.getElementById('claim-role').value,
        message: document.getElementById('claim-message').value,
      };
      try {
        await axios.post('/api/claims', payload);
        showMsg(msg, 'Demande envoyée ! Notre équipe vous contactera pour vérifier votre identité.', true);
        formClaim.reset();
        setTimeout(closeModals, 2000);
      } catch (err) {
        showMsg(msg, (err.response && err.response.data && err.response.data.error) || 'Erreur lors de l\u2019envoi. Réessayez.', false);
      }
    });
  }
})();
