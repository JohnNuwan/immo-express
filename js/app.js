/* ============================================
   Immo-Express NODUS — Application JavaScript
   EVA Agent · NODUS SYSTEMS
   ============================================ */

// ---- API CONFIG ----
const API_BASE = window.location.origin + '/api';

function getToken() {
  return localStorage.getItem('nodus_token');
}

function isLoggedIn() {
  return !!getToken();
}

// ---- API HELPERS ----
async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  } catch (e) {
    if (e.message === 'Failed to fetch' || e.message === 'Network request failed') {
      throw new Error('Serveur indisponible');
    }
    throw e;
  }
}

async function apiGet(endpoint, auth = false) {
  return apiFetch(endpoint, { method: 'GET' });
}
async function apiPost(endpoint, body, auth = false) {
  return apiFetch(endpoint, { method: 'POST', body });
}
async function apiPut(endpoint, body, auth = false) {
  return apiFetch(endpoint, { method: 'PUT', body });
}
async function apiDelete(endpoint, auth = false) {
  return apiFetch(endpoint, { method: 'DELETE' });
}
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiDelete = apiDelete;

// ---- UTILITIES ----
function formatPrice(price) {
  if (!price) return '—';
  if (price < 1000) return price + ' €';
  return price.toLocaleString('fr-FR') + ' €';
}

function scoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 45) return 'score-mid';
  return 'score-low';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icons = { success: '✅', error: '❌', info: '⬡' };
  toast.innerHTML = `<span>${icons[type] || '⬡'}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3500);
}

// ---- STATE ----
let currentUser = null;
let currentFilters = { sort: 'recent', page: 1 };
let allListings = [];
let loadedStats = {};

// ---- DATA LOADING ----
async function loadStats() {
  try {
    const stats = await apiGet('/api/stats');
    loadedStats = stats;
    document.querySelectorAll('#statListings, #qsListings').forEach(el => {
      el.textContent = stats.active_listings || 0;
    });
    document.getElementById('qsUsers').textContent = stats.total_users || 0;
    document.getElementById('qsScorings').textContent = stats.total_scorings || 0;
    document.getElementById('statAnalyses').textContent = stats.total_scorings || 0;
    document.getElementById('statPros').textContent = stats.total_users || 0;
  } catch (e) {
    console.log('Stats load error:', e.message);
  }
}

async function loadListings() {
  const grid = document.getElementById('listingsGrid');
  if (!grid) return;

  try {
    grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Chargement des annonces…</span></div>';

    const params = new URLSearchParams();
    params.set('page', currentFilters.page || 1);
    params.set('limit', '20');
    params.set('sort', currentFilters.sort || 'recent');

    if (currentFilters.cat && currentFilters.cat !== 'all') params.set('cat', currentFilters.cat);
    if (currentFilters.type && currentFilters.type !== 'all') params.set('type', currentFilters.type);
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
    if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
    if (currentFilters.score) params.set('minScore', currentFilters.score);

    const data = await apiGet('/api/biens?' + params.toString());
    allListings = data.listings || [];

    // Update count
    const countEl = document.getElementById('resultsCountNum');
    if (countEl) countEl.textContent = data.total || 0;

    if (allListings.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <div class="icon">🔍</div>
          <h3>Aucune annonce trouvée</h3>
          <p>Essayez de modifier vos filtres ou d'élargir votre recherche.</p>
        </div>`;
      return;
    }

    grid.innerHTML = allListings.map(listing => {
      const price = listing.cat === 'location' ? formatPrice(listing.price) + '/mois' : formatPrice(listing.price);
      const score = Math.round(listing.trust_score || 50);
      const equip = parseJsonArray(listing.equip);
      const badges = [];
      if (listing.cat === 'vente') badges.push('<span class="img-badge badge-sale">VENTE</span>');
      else badges.push('<span class="img-badge badge-rent">LOCATION</span>');
      if (score >= 70) badges.push('<span class="img-badge badge-verified">⬡ VÉRIFIÉ</span>');

      return `
        <div class="listing-card" onclick="showListingDetail('${listing.id}')">
          <div class="listing-img" style="background:linear-gradient(135deg,${getListingColor(listing.type)},var(--nodus-bg-3))">
            ${getListingEmoji(listing.type)}
            ${badges.join('')}
          </div>
          <div class="listing-info">
            <div class="listing-price">
              ${price}
              <span class="listing-score ${scoreClass(score)}">${score}</span>
              ${score >= 70 ? '<span class="smart-match">⬡ Confiance élevée</span>' : ''}
            </div>
            <div class="listing-title">${escapeHtml(listing.title || 'Bien immobilier')}</div>
            <div class="listing-location">📍 ${escapeHtml(listing.city || '')}${listing.zipcode ? ' · ' + listing.zipcode : ''}</div>
            <div class="listing-tags">
              <span class="listing-tag">📐 <strong>${listing.surface || '—'}</strong> m²</span>
              <span class="listing-tag">🛏️ <strong>${listing.pieces || '—'}</strong> pièces</span>
              ${equip.length > 0 ? '<span class="listing-tag">🔧 <strong>' + equip.length + '</strong> équip.</span>' : ''}
              ${listing.dpe ? '<span class="listing-tag">⚡ <strong>' + listing.dpe + '</strong></span>' : ''}
            </div>
            <div class="listing-footer">
              <div class="listing-publisher">
                <span class="pub-type ${listing.publisher === 'pro' ? 'pub-pro' : 'pub-particulier'}">${listing.publisher === 'pro' ? '🏢 Pro' : '👤 Part.'}</span>
                ${listing.company ? escapeHtml(listing.company) : escapeHtml(listing.pub_name || '')}
              </div>
              <div class="listing-date">⬡ ${timeAgo(listing.created_at)}</div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Pagination
    renderPagination(data.total || 0, data.pages || 1);

  } catch (e) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>${escapeHtml(e.message)}</p>
        <button onclick="loadListings()" style="margin-top:12px;padding:8px 20px;border:1px solid var(--nodus-border);border-radius:8px;background:transparent;color:var(--nodus-text-2);cursor:pointer;">↺ Réessayer</button>
      </div>`;
  }
}
window.loadListings = loadListings;

function parseJsonArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

function getListingEmoji(type) {
  const map = {
    'appartement': '🏢', 'maison': '🏠', 'villa': '🏡',
    'studio': '📐', 'penthouse': '✨', 'local': '🏪',
    'terrain': '🌳', 'immeuble': '🏗️'
  };
  return map[type] || '🏠';
}

function getListingColor(type) {
  const map = {
    'appartement': '#7c4dff', 'maison': '#00e676', 'villa': '#00f0ff',
    'studio': '#ffab00', 'penthouse': '#e64749', 'local': '#ff6b6b',
    'terrain': '#00c8d6'
  };
  return map[type] || '#7c4dff';
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date + 'Z').getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return 'il y a ' + mins + ' min';
  const hours = Math.floor(mins / 60);
  if (hours < 24) return 'il y a ' + hours + 'h';
  const days = Math.floor(hours / 24);
  if (days < 7) return 'il y a ' + days + 'j';
  return 'il y a ' + Math.floor(days / 7) + ' sem.';
}

function renderPagination(total, pages) {
  const el = document.getElementById('pagination');
  if (!el) return;
  if (pages <= 1) { el.innerHTML = ''; return; }

  let html = '';
  const current = currentFilters.page || 1;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - current) <= 2) {
      html += `<button class="${i === current ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (html.endsWith('…') === false) {
      html += '<button disabled style="border:none;background:transparent;color:var(--nodus-text-3);cursor:default;">…</button>';
    }
  }
  el.innerHTML = html;
}
window.goToPage = function(page) {
  currentFilters.page = page;
  loadListings();
};

// ---- SEARCH & FILTERS ----
function handleSearch() {
  const input = document.getElementById('mainSearch');
  const type = document.getElementById('mainType');
  const cat = document.getElementById('mainCategory');
  // Reset filters to defaults first
  currentFilters = { sort: 'recent', page: 1 };
  currentFilters.search = input ? input.value.trim() : '';
  currentFilters.type = type ? type.value : 'all';
  currentFilters.cat = cat ? cat.value : 'all';
  loadListings();
}
window.handleSearch = handleSearch;

function resetFilters() {
  currentFilters = { sort: 'recent', page: 1 };
  document.querySelectorAll('#typeFilters button').forEach(b => b.className = b.dataset.type === 'all' ? 'active' : '');
  document.querySelectorAll('#catFilters button').forEach(b => b.className = b.dataset.cat === 'all' ? 'active' : '');
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('scoreFilter').value = '0';
  document.getElementById('publisherFilter').value = 'all';
  loadListings();
}
window.resetFilters = resetFilters;

// Filter button clicks
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.filter-btn-group button');
  if (!btn) return;
  const group = btn.parentElement;
  const isType = group.id === 'typeFilters';
  const isCat = group.id === 'catFilters';
  if (!isType && !isCat) return;

  group.querySelectorAll('button').forEach(b => b.className = '');
  btn.className = 'active';

  if (isType) currentFilters.type = btn.dataset.type;
  if (isCat) currentFilters.cat = btn.dataset.cat;
  currentFilters.page = 1;
  loadListings();
});

// Sort tabs
document.addEventListener('click', function(e) {
  const tab = e.target.closest('.results-tabs button');
  if (!tab) return;
  tab.parentElement.querySelectorAll('button').forEach(b => b.className = '');
  tab.className = 'active';
  currentFilters.sort = tab.dataset.sort;
  currentFilters.page = 1;
  loadListings();
});

// Price/score/publisher filters change
document.addEventListener('change', function(e) {
  const el = e.target;
  if (el.id === 'minPrice' || el.id === 'maxPrice' || el.id === 'scoreFilter' || el.id === 'publisherFilter') {
    currentFilters.minPrice = document.getElementById('minPrice').value;
    currentFilters.maxPrice = document.getElementById('maxPrice').value;
    currentFilters.page = 1;
    loadListings();
  }
});

// Enter key in search
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.id === 'mainSearch') {
    handleSearch();
  }
});

// ---- LISTING DETAIL ----
async function showListingDetail(id) {
  try {
    const listing = await apiGet('/api/biens/' + id);
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    if (!modalTitle || !modalBody) return;

    modalTitle.textContent = listing.title || 'Détail du bien';
    modalBody.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="font-size:3rem;text-align:center;padding:24px;background:var(--nodus-bg-2);border-radius:var(--radius);">
          ${getListingEmoji(listing.type)}
        </div>
        <div>
          <div style="font-family:var(--font-display);font-size:1.6rem;font-weight:700;color:var(--nodus-text);">
            ${listing.cat === 'location' ? formatPrice(listing.price) + '/mois' : formatPrice(listing.price)}
          </div>
          <div style="margin-top:8px;color:var(--nodus-text-2)">📍 ${escapeHtml(listing.city)}${listing.zipcode ? ' · ' + listing.zipcode : ''}</div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
            <span class="listing-score ${scoreClass(listing.trust_score)}" style="font-size:0.9rem">⬡ ${Math.round(listing.trust_score)}</span>
            <span class="status-badge ${listing.status === 'active' ? 'active' : 'inactive'}">${listing.status}</span>
            <span class="pub-type ${listing.publisher === 'pro' ? 'pub-pro' : 'pub-particulier'}">${listing.publisher === 'pro' ? 'Professionnel' : 'Particulier'}</span>
          </div>
        </div>
      </div>
      <hr style="border:none;border-top:1px solid var(--nodus-border);margin:16px 0;">
      <p style="line-height:1.7;color:var(--nodus-text-2)">${escapeHtml(listing.description || 'Aucune description.')}</p>
      <hr style="border:none;border-top:1px solid var(--nodus-border);margin:16px 0;">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div style="color:var(--nodus-text-2);font-size:0.85rem;"><strong style="color:var(--nodus-text)">${listing.surface || '—'}</strong> m²</div>
        <div style="color:var(--nodus-text-2);font-size:0.85rem;"><strong style="color:var(--nodus-text)">${listing.pieces || '—'}</strong> pièces</div>
        <div style="color:var(--nodus-text-2);font-size:0.85rem;"><strong style="color:var(--nodus-text)">${listing.chambres || '—'}</strong> ch.</div>
        <div style="color:var(--nodus-text-2);font-size:0.85rem;"><strong style="color:var(--nodus-text)">${listing.etage || 'RDC'}</strong></div>
        <div style="color:var(--nodus-text-2);font-size:0.85rem;"><strong style="color:var(--nodus-text)">${listing.year || '—'}</strong></div>
        <div style="color:var(--nodus-text-2);font-size:0.85rem;">DPE: <strong style="color:var(--nodus-text)">${listing.dpe || '—'}</strong></div>
      </div>
      <hr style="border:none;border-top:1px solid var(--nodus-border);margin:16px 0;">
      <div style="display:flex;gap:12px;margin-top:16px;">
        <button onclick="closeModal()" class="btn-cancel">Fermer</button>
        <button onclick="openContactForm('${listing.id}')" class="btn-submit" style="padding:10px 24px;">⬡ Contacter</button>
      </div>
    `;
    openModal('modalOverlay');
  } catch (e) {
    showToast('Erreur: ' + e.message, 'error');
  }
}
window.showListingDetail = showListingDetail;

// ---- MODAL HELPERS ----
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal() {
  const el = document.getElementById('modalOverlay');
  if (el) el.classList.remove('active');
}
window.closeModal = closeModal;

function openDepositModal() {
  openModal('depositOverlay');
}
function closeDepositModal() {
  closeModal('depositOverlay');
}
window.openDepositModal = openDepositModal;
window.closeDepositModal = closeDepositModal;

function openAuthModal() {
  if (currentUser) {
    // Show logout
    return;
  }
  openModal('authModal');
}
function closeAuthModal() {
  closeModal('authModal');
}
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

function openContactForm(listingId) {
  closeModal();
  setTimeout(() => {
    const r = prompt('Votre message :', 'Bonjour, je suis intéressé(e) par votre bien.');
    if (r) {
      apiPost('/api/contact', {
        listing_id: listingId,
        name: currentUser ? currentUser.name : 'Visiteur',
        email: currentUser ? currentUser.email : 'visiteur@email.com',
        phone: currentUser ? currentUser.phone : '',
        message: r
      }).then(() => showToast('Message envoyé ✅', 'success'))
      .catch(e => showToast('Erreur: ' + e.message, 'error'));
    }
  }, 200);
}
window.openContactForm = openContactForm;

// ---- AUTH ----
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.className = t.dataset.tab === tab ? 'auth-tab active' : 'auth-tab');
  document.getElementById('authLogin').className = 'auth-form' + (tab === 'login' ? ' active' : '');
  document.getElementById('authRegister').className = 'auth-form' + (tab === 'register' ? ' active' : '');
  document.getElementById('authStatus').style.display = 'none';
}
window.switchTab = switchTab;

async function handleLogin(e) {
  e.preventDefault();
  const status = document.getElementById('authStatus');
  status.className = 'auth-status';
  status.style.display = 'none';
  try {
    const data = await apiPost('/api/auth/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    });
    localStorage.setItem('nodus_token', data.token);
    currentUser = data.user;
    updateUserUI();
    showToast('Connexion réussie ✅', 'success');
    closeAuthModal();
    loadListings();
  } catch (e) {
    status.className = 'auth-status error';
    status.textContent = e.message;
    status.style.display = 'block';
  }
}
window.handleLogin = handleLogin;

async function handleRegister(e) {
  e.preventDefault();
  const status = document.getElementById('authStatus');
  status.className = 'auth-status';
  status.style.display = 'none';
  try {
    const data = await apiPost('/api/auth/register', {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value
    });
    localStorage.setItem('nodus_token', data.token);
    currentUser = data.user;
    updateUserUI();
    showToast('Compte créé ✅', 'success');
    closeAuthModal();
    loadListings();
  } catch (e) {
    status.className = 'auth-status error';
    status.textContent = e.message;
    status.style.display = 'block';
  }
}
window.handleRegister = handleRegister;

function handleLogout() {
  localStorage.removeItem('nodus_token');
  currentUser = null;
  updateUserUI();
  showToast('Déconnexion', 'info');
}
window.handleLogout = handleLogout;

function updateUserUI() {
  const btn = document.getElementById('userBtnText');
  if (!btn) return;
  const userBtn = document.getElementById('userBtn');
  if (currentUser) {
    btn.textContent = currentUser.name || currentUser.email;
    userBtn.className = 'btn-user logged-in';
    userBtn.onclick = () => {
      if (confirm('Se déconnecter ?')) handleLogout();
    };
    // Show dashboard link if it exists
    const links = document.getElementById('headerLinks');
    if (links && !document.getElementById('dashLink')) {
      const dashLink = document.createElement('a');
      dashLink.id = 'dashLink';
      dashLink.href = 'dashboard.html';
      dashLink.textContent = '📊 Dashboard';
      links.insertBefore(dashLink, links.firstChild);
    }
  } else {
    btn.textContent = 'Connexion';
    userBtn.className = 'btn-user';
    userBtn.onclick = () => openAuthModal();
    const dashLink = document.getElementById('dashLink');
    if (dashLink) dashLink.remove();
  }
}

// Try to restore session
async function restoreSession() {
  const token = getToken();
  if (!token) return;
  try {
    const user = await apiGet('/api/auth/me', true);
    currentUser = user;
    updateUserUI();
  } catch {
    localStorage.removeItem('nodus_token');
  }
}

// ---- DEPOSIT FORM ----
function submitDepositForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {};
  new FormData(form).forEach((v, k) => {
    if (k === 'equip') {
      if (!data.equip) data.equip = [];
      data.equip.push(v);
    } else {
      data[k] = v;
    }
  });

  // Map field names
  data.description = data.desc || '';
  data.pub_name = data.pubName || '';
  data.trust_score = 75;

  apiPost('/api/biens', data, true)
    .then(() => {
      showToast('Annonce publiée ✅', 'success');
      closeDepositModal();
      form.reset();
      loadListings();
    })
    .catch(e => showToast('Erreur: ' + e.message, 'error'));
}
window.submitDepositForm = submitDepositForm;

function toggleCategoryLabels() {
  const cat = document.querySelector('[name="cat"]')?.value;
  if (cat === 'location') {
    document.getElementById('priceLabel').textContent = 'Loyer mensuel *';
    document.getElementById('priceSectionTitle').textContent = '💰 Loyer';
  } else {
    document.getElementById('priceLabel').textContent = 'Prix de vente *';
    document.getElementById('priceSectionTitle').textContent = '💰 Prix';
  }
}
window.toggleCategoryLabels = toggleCategoryLabels;

function togglePublisherInfo() {
  const pub = document.querySelector('[name="publisher"]')?.value;
  document.getElementById('proCompanyGroup').style.display = pub === 'pro' ? 'flex' : 'none';
}
window.togglePublisherInfo = togglePublisherInfo;

function handlePhotoUpload(e) {
  const files = Array.from(e.target.files || []);
  const preview = document.getElementById('photoPreview');
  preview.innerHTML = files.map((f, i) =>
    `<div style="width:60px;height:60px;background:var(--nodus-bg-2);border:1px solid var(--nodus-border);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--nodus-text-2);">📷${i+1}</div>`
  ).join('');
}
window.handlePhotoUpload = handlePhotoUpload;

// ---- CHATBOT ----
let chatHistory = [
  { role: 'bot', text: '👋 Bienvenue sur Immo-Express ! Je suis votre assistant NODUS. Comment puis-je vous aider ?' }
];

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  const toggle = document.getElementById('chatToggle');
  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
    toggle.style.display = 'block';
  } else {
    panel.classList.add('active');
    toggle.style.display = 'none';
    renderChat();
  }
}
window.toggleChat = toggleChat;

function renderChat() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  msgs.innerHTML = chatHistory.map(m =>
    `<div class="chat-message ${m.role}">${m.text}</div>`
  ).join('');
  msgs.scrollTop = msgs.scrollHeight;
}

const quickReplies = [
  '🔍 Je cherche un appartement',
  '💰 Quel est le budget moyen ?',
  '📊 Comment se calcule le score ?',
  '📝 Comment déposer une annonce ?',
  '📍 Quelles villes sont disponibles ?'
];

document.addEventListener('DOMContentLoaded', () => {
  const qr = document.getElementById('quickReplies');
  if (qr) {
    qr.innerHTML = quickReplies.map(text =>
      `<button class="chat-quick-reply" onclick="quickReply('${escapeHtml(text)}')">${text}</button>`
    ).join('');
  }
});

function quickReply(text) {
  chatHistory.push({ role: 'user', text });
  const responses = {
    '🔍 Je cherche un appartement': 'Parfait ! Utilisez la barre de recherche ci-dessus. Vous pouvez filtrer par ville, prix et type. 🏢',
    '💰 Quel est le budget moyen ?': 'Le budget moyen varie selon les villes : Paris ~10 000€/m², Lyon ~5 500€/m², Bordeaux ~4 800€/m². 📊',
    '📊 Comment se calcule le score ?': 'Le score NODUS évalue 7 critères : surface, emplacement, DPE, année, équipements, étage et prix au m². 🤖',
    '📝 Comment déposer une annonce ?': 'Cliquez sur le bouton "+ Déposer" en haut de page. Créez un compte et suivez le formulaire ! ✨',
    '📍 Quelles villes sont disponibles ?': 'Nous couvrons toute la France : Paris, Lyon, Bordeaux, Marseille, Toulouse, Nice, Nantes, Lille, Strasbourg, Grenoble… 🌍'
  };
  setTimeout(() => {
    chatHistory.push({ role: 'bot', text: responses[text] || 'Je suis désolé, je n\'ai pas compris. Essayez les suggestions rapides ci-dessous ou contactez-nous directement !' });
    renderChat();
  }, 400);
  renderChat();
}
window.quickReply = quickReply;

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  chatHistory.push({ role: 'user', text });
  setTimeout(() => {
    chatHistory.push({
      role: 'bot',
      text: 'Merci pour votre message ! Un conseiller NODUS va vous répondre sous peu. En attendant, je vous suggère de parcourir nos annonces 🔍'
    });
    renderChat();
  }, 600);
  renderChat();
}
window.sendMessage = sendMessage;

// ---- MOBILE MENU ----
function toggleMobileMenu() {
  const links = document.getElementById('headerLinks');
  links.classList.toggle('mobile-open');
}
window.toggleMobileMenu = toggleMobileMenu;

// ---- INIT ----
(async function init() {
  await restoreSession();
  await loadStats();
  await loadListings();
})();