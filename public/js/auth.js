// ========== AUTH SYSTEM ==========
// Connected to Express Backend

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
    const depositBtn = document.querySelector('.btn-depot');
    if (!btn) return;
    if (this.user) {
      const initial = (this.user.prenom || this.user.nom || this.user.email || '?')[0].toUpperCase();
      const displayName = this.user.prenom || this.user.nom || this.user.email.split('@')[0];
      btn.innerHTML = `<span class="user-avatar">${initial}</span> <span class="user-name">${displayName}</span>`;
      btn.onclick = () => window.location.href = 'profil.html';
      if (depositBtn) depositBtn.style.display = '';
    } else {
      btn.innerHTML = `<span class="user-avatar-circle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span> <span class="user-name" style="margin-left:6px;font-weight:500;">Mon compte</span>`;
      btn.onclick = () => window.location.href = 'login.html';
      if (depositBtn) depositBtn.style.display = '';
    }
  },

  _getApiHost() {
    return window.ApiClient ? window.ApiClient.getBaseUrl() : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : '');
  },

  async login(email, password) {
    if (window.ApiClient) {
      const res = await window.ApiClient.post('/api/auth/login', { email, password });
      if (res.ok && res.data.token) {
        this.user = res.data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        localStorage.setItem('immo_token', res.data.token);
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: res.data.error || 'Erreur de connexion' };
    }
    return { ok: false, error: 'Client API non chargé' };
  },

  async register(email, password, name) {
    let prenom = name;
    let nom = '';
    if (name && name.includes(' ')) {
      const parts = name.split(' ');
      prenom = parts[0];
      nom = parts.slice(1).join(' ');
    }

    if (window.ApiClient) {
      const res = await window.ApiClient.post('/api/auth/register', { email, password, nom, prenom });
      if (res.ok && res.data.token) {
        this.user = res.data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        localStorage.setItem('immo_token', res.data.token);
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: res.data.error || "Erreur lors de l'inscription" };
    }
    return { ok: false, error: 'Client API non chargé' };
  },

  async fetchMe() {
    const token = this.getToken();
    if (!token) return { ok: false };
    
    if (window.ApiClient) {
      const res = await window.ApiClient.get('/api/auth/me');
      if (res.ok && res.data.user) {
        this.user = res.data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        this._notify();
        return { ok: true, user: this.user };
      }
      return { ok: false };
    }
    return { ok: false };
  },

  async updateProfile(updates) {
    const token = this.getToken();
    if (!token) return { ok: false, error: 'Non connecté' };

    if (window.ApiClient) {
      const res = await window.ApiClient.put('/api/auth/profile', updates);
      if (res.ok && res.data.user) {
        this.user = res.data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: res.data.error || 'Erreur lors de la mise à jour' };
    }
    return { ok: false, error: 'Client API non chargé' };
  },

  logout() {
    this.user = null;
    localStorage.removeItem('immo_user');
    localStorage.removeItem('immo_token');
    this._notify();
  },

  isLoggedIn() { return !!this.user; },
  getUser() { return this.user; },
  getToken() { return localStorage.getItem('immo_token'); }
};

// Init
document.addEventListener('DOMContentLoaded', () => Auth.init());