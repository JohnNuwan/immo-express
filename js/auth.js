/* ============================================
   Immo-Express NODUS — Auth Module
   EVA Agent · NODUS SYSTEMS
   ============================================ */

// This file is kept for backward compatibility.
// Auth logic is now in app.js (apiPost, apiGet, etc.)
// Re-exporting helpers for legacy pages

window.apiFetch = window.apiFetch || (async (endpoint, options) => {
  const url = window.location.origin + '/api' + endpoint;
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('nodus_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...((options && options.headers) || {}) },
      body: options && options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  } catch (e) {
    if (e.message === 'Failed to fetch' || e.message === 'Network request failed') {
      throw new Error('Serveur API indisponible');
    }
    throw e;
  }
});

window.apiGet = window.apiGet || (async (endpoint, auth) => apiFetch(endpoint, { method: 'GET' }));
window.apiPost = window.apiPost || (async (endpoint, body, auth) => apiFetch(endpoint, { method: 'POST', body }));
window.apiPut = window.apiPut || (async (endpoint, body, auth) => apiFetch(endpoint, { method: 'PUT', body }));
window.apiDelete = window.apiDelete || (async (endpoint, auth) => apiFetch(endpoint, { method: 'DELETE' }));

window.isLoggedIn = window.isLoggedIn || (() => !!localStorage.getItem('nodus_token'));
window.getToken = window.getToken || (() => localStorage.getItem('nodus_token'));