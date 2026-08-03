// ========== AUTH SYSTEM ==========
// localStorage-based (prêt pour Supabase plus tard)

const Auth = {
  user: null,
  listeners: [],

  init() {
    const saved = localStorage.getItem('immo_user');
    if (saved) {
      try { this.user = JSON.parse(saved); } catch(e) { this.user = null; }
    }
    this._notify();
  },

  onAuth(cb) {
    this.listeners.push(cb);
    if (this.user) cb(this.user);
    return () => this.listeners = this.listeners.filter(l => l !== cb);
  },

  _notify() {
    this.listeners.forEach(cb => cb(this.user));
    this._updateUI();
  },

  _updateUI() {
    const btn = document.getElementById('userBtn');
    const menu = document.getElementById('userMenu');
    const depositBtn = document.querySelector('.btn-depot');
    if (!btn) return;
    if (this.user) {
      const initial = (this.user.name || this.user.email || '?')[0].toUpperCase();
      btn.innerHTML = `<span class="user-avatar">${initial}</span> <span class="user-name">${this.user.name || this.user.email || 'Compte'}</span>`;
      if (depositBtn) depositBtn.style.display = '';
    } else {
      btn.innerHTML = '👤 <span>Connexion</span>';
      if (depositBtn) depositBtn.style.display = '';
    }
  },

  async login(email, password) {
    // Mode localStorage : simule une connexion
    const users = JSON.parse(localStorage.getItem('immo_users') || '{}');
    if (users[email] && users[email].password === password) {
      this.user = { email, name: users[email].name || email.split('@')[0] };
      localStorage.setItem('immo_user', JSON.stringify(this.user));
      this._notify();
      return { ok: true };
    }
    return { ok: false, error: 'Email ou mot de passe incorrect' };
  },

  async register(email, password, name) {
    const users = JSON.parse(localStorage.getItem('immo_users') || '{}');
    if (users[email]) return { ok: false, error: 'Cet email est déjà utilisé' };
    users[email] = { password, name, createdAt: new Date().toISOString() };
    localStorage.setItem('immo_users', JSON.stringify(users));
    this.user = { email, name };
    localStorage.setItem('immo_user', JSON.stringify(this.user));
    this._notify();
    return { ok: true };
  },

  logout() {
    this.user = null;
    localStorage.removeItem('immo_user');
    this._notify();
  },

  isLoggedIn() { return !!this.user; },
  getUser() { return this.user; }
};

// ========== AUTH MODAL ==========
function openAuthModal(tab) {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;
  overlay.classList.add('open');
  switchTab(tab || 'login');
}

function closeAuthModal() {
  const overlay = document.getElementById('authModal');
  if (overlay) overlay.classList.remove('open');
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.id === 'auth' + tab.charAt(0).toUpperCase() + tab.slice(1)));
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const status = document.getElementById('authStatus');
  status.textContent = 'Connexion…';
  status.className = 'auth-status';
  const r = await Auth.login(email, password);
  if (r.ok) { closeAuthModal(); status.textContent = ''; }
  else { status.textContent = r.error; status.className = 'auth-status error'; }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const status = document.getElementById('authStatus');
  if (password.length < 6) { status.textContent = 'Mot de passe trop court (6 caractères minimum)'; status.className = 'auth-status error'; return; }
  status.textContent = 'Inscription…';
  status.className = 'auth-status';
  const r = await Auth.register(email, password, name);
  if (r.ok) { closeAuthModal(); status.textContent = ''; }
  else { status.textContent = r.error; status.className = 'auth-status error'; }
}

function handleLogout() {
  Auth.logout();
  closeAuthModal();
}

// Init
document.addEventListener('DOMContentLoaded', () => Auth.init());