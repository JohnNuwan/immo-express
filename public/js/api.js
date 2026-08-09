// ========== CENTRALIZED API CLIENT ==========
// Handles URL resolution, headers, and authentication tokens automatically

const ApiClient = {
  getBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost ? 'http://127.0.0.1:8000' : '';
  },

  getToken() {
    return localStorage.getItem('immo_token');
  },

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => ({}));
      
      return {
        ok: res.ok,
        status: res.status,
        data
      };
    } catch (err) {
      console.error(`[API Error] Request failed for ${url}:`, err);
      return {
        ok: false,
        status: 0,
        data: { error: 'Impossible de contacter le serveur' }
      };
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

window.ApiClient = ApiClient;
