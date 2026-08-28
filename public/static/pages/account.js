/* Page Mon compte — session, connexion, inscription */
(function () {
  'use strict';
  const C = window.Christici;
  const $ = (id) => document.getElementById(id);

  const elLoading = $('account-loading');
  const elLogged = $('account-logged');
  const elGuest = $('account-guest');
  if (!elLoading || !elLogged || !elGuest) return;

  function showMsg(el, text, ok) {
    el.textContent = text;
    el.classList.remove('hidden', 'form-ok', 'form-err');
    el.classList.add(ok ? 'form-ok' : 'form-err');
    el.style.padding = '0.6rem 0.8rem';
    el.style.borderRadius = '0.7rem';
  }

  function renderLogged(user) {
    elLoading.classList.add('hidden');
    elGuest.classList.add('hidden');
    elLogged.classList.remove('hidden');
    $('account-name').textContent = user.name;
    $('account-email').textContent = user.email;
    const roleEl = $('account-role');
    roleEl.textContent = user.role === 'admin' ? 'Administrateur' : 'Membre';
    roleEl.className = 'tag mt-1 inline-block ' + (user.role === 'admin' ? 'tag-amber' : 'tag-blue');
    if (user.role === 'admin') $('account-admin-link').classList.remove('hidden');
  }

  function renderGuest() {
    elLoading.classList.add('hidden');
    elLogged.classList.add('hidden');
    elGuest.classList.remove('hidden');
  }

  // --- État de session au chargement ---
  axios.get('/api/auth/me')
    .then((res) => { if (res.data && res.data.user) renderLogged(res.data.user); else renderGuest(); })
    .catch(() => renderGuest());

  // --- Bascule onglets ---
  const tabLogin = $('tab-login');
  const tabRegister = $('tab-register');
  const formLogin = $('form-login');
  const formRegister = $('form-register');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    formLogin.classList.remove('hidden'); formRegister.classList.add('hidden');
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    formRegister.classList.remove('hidden'); formLogin.classList.add('hidden');
  });

  // --- Connexion ---
  formLogin.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const msg = $('login-msg');
    try {
      const res = await axios.post('/api/auth/login', {
        email: $('login-email').value.trim(),
        password: $('login-password').value,
      });
      showMsg(msg, 'Connexion réussie, bienvenue !', true);
      renderLogged(res.data.user);
    } catch (err) {
      showMsg(msg, (err.response && err.response.data && err.response.data.error) || 'Connexion impossible.', false);
    }
  });

  // --- Inscription ---
  formRegister.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const msg = $('register-msg');
    try {
      const res = await axios.post('/api/auth/register', {
        name: $('register-name').value.trim(),
        email: $('register-email').value.trim(),
        password: $('register-password').value,
      });
      showMsg(msg, 'Compte créé, vous êtes connecté !', true);
      renderLogged(res.data.user);
    } catch (err) {
      showMsg(msg, (err.response && err.response.data && err.response.data.error) || 'Inscription impossible.', false);
    }
  });

  // --- Déconnexion ---
  $('btn-logout').addEventListener('click', async () => {
    try { await axios.post('/api/auth/logout'); } catch (e) { /* ignore */ }
    renderGuest();
  });
})();
