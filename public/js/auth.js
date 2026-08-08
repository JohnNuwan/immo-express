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
      btn.innerHTML = '👤 <span>Connexion</span>';
      btn.onclick = () => window.location.href = 'login.html';
      if (depositBtn) depositBtn.style.display = '';
    }
  },

  _getApiHost() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : '';
  },

  async login(email, password) {
    try {
      const res = await fetch(`${this._getApiHost()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        this.user = data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        localStorage.setItem('immo_token', data.token);
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Erreur de connexion' };
    } catch(err) {
      return { ok: false, error: 'Impossible de contacter le serveur' };
    }
  },

  async register(email, password, name) {
    // Split name into nom/prenom naively for the backend
    let prenom = name;
    let nom = '';
    if (name && name.includes(' ')) {
      const parts = name.split(' ');
      prenom = parts[0];
      nom = parts.slice(1).join(' ');
    }

    try {
      const res = await fetch(`${this._getApiHost()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nom, prenom })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        this.user = data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        localStorage.setItem('immo_token', data.token);
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Erreur lors de l\\'inscription' };
    } catch(err) {
      return { ok: false, error: 'Impossible de contacter le serveur' };
    }
  },

  async fetchMe() {
    const token = this.getToken();
    if (!token) return { ok: false };
    
    try {
      const res = await fetch(`${this._getApiHost()}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        this.user = data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        this._notify();
        return { ok: true, user: this.user };
      }
      return { ok: false };
    } catch (e) {
      return { ok: false };
    }
  },

  async updateProfile(updates) {
    const token = this.getToken();
    if (!token) return { ok: false, error: 'Non connecté' };

    try {
      const res = await fetch(`${this._getApiHost()}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        this.user = data.user;
        localStorage.setItem('immo_user', JSON.stringify(this.user));
        this._notify();
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Erreur lors de la mise à jour' };
    } catch (e) {
      return { ok: false, error: 'Impossible de contacter le serveur' };
    }
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