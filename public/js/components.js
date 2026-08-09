// ==========================================
// Immo-Express — Minimal Luxury Components System
// Header, Theme Switcher, SVG Vector Icons, Category Bar & Footer
// ==========================================

(function () {
  const path = window.location.pathname;

  function isActive(page) {
    if (page === 'index.html' && (path.endsWith('/') || path.endsWith('/index.html') || path === '')) return 'active';
    return path.endsWith(page) ? 'active' : '';
  }

  // --- SVG VECTOR ICONS SYSTEM ---
  const SVG = {
    logo: `<svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:8px"><rect width="32" height="32" rx="8" fill="url(#brandGrad)"/><path d="M16 6L7 13.5V25.5H13V18.5H19V25.5H25V13.5L16 6Z" fill="white" fill-opacity="0.95"/><path d="M16 11.5L11 15.5V22.5H14.5V17.5H17.5V22.5H21V15.5L16 11.5Z" fill="#FF385C"/><defs><linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stop-color="#FF385C"/><stop offset="1" stop-color="#E00B41"/></linearGradient></defs></svg>`,
    all: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
    haussmann: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/></svg>`,
    villa: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="m3 12 9-8 9 8"/><path d="M5 12v8h14v-8"/><path d="M9 16h6"/></svg>`,
    loft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`,
    studio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18v3"/><path d="M20 18v3"/><path d="M2 12h20"/><path d="M4 12V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="M4 15h16"/></svg>`,
    maison: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7"/><path d="M12 14c-4 0-6-2-6-5a6 6 0 0 1 12 0c0 3-2 5-6 5Z"/></svg>`,
    score: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    baisse: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
    verified: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
    heart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    burger: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
  };

  // Immediate theme init
  const savedTheme = localStorage.getItem('immo_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Global toggle handler
  window.toggleTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('immo_theme', next);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = next === 'light' ? SVG.moon : SVG.sun;
  };

  // --- HEADER COMPONENT ---
  const headerHTML = `
  <header class="airbnb-header" id="appHeader">
    <div class="airbnb-header-container">
      
      <!-- LOGO -->
      <a href="index.html" class="airbnb-logo">
        <div class="airbnb-logo-icon">${SVG.logo}</div>
        <span class="airbnb-logo-text">Immo<span class="highlight">Express</span></span>
      </a>

      <!-- NAVIGATION (ORDER: ACHETER - LOCATION - NOTATION - ESPACE PRO) -->
      <nav class="airbnb-nav">
        <a href="vente.html" class="nav-item ${isActive('vente.html')}">ACHETER</a>
        <a href="location.html" class="nav-item ${isActive('location.html')}">LOCATION</a>
        <a href="scoring.html" class="nav-item ${isActive('scoring.html')}">NOTATION</a>
        <a href="pro.html" class="nav-item ${isActive('pro.html')}">ESPACE PRO</a>
      </nav>

      <!-- RIGHT USER MENU & ACTIONS -->
      <div class="airbnb-user-actions">
        <a href="pro.html" class="airbnb-host-btn">Publier un bien</a>
        <button class="theme-toggle-btn" id="themeToggleBtn" onclick="toggleTheme()" title="Changer le thème">
          ${savedTheme === 'light' ? SVG.moon : SVG.sun}
        </button>
        <button class="airbnb-fav-btn" onclick="openFavModal()" title="Mes Favoris">
          ${SVG.heart} <span class="fav-badge" id="favCount">0</span>
        </button>
        <button class="airbnb-user-menu-btn" id="userBtn">
          <span class="burger-icon">${SVG.burger}</span>
          <span class="user-avatar-circle">${SVG.user}</span>
        </button>
      </div>

      <!-- MOBILE BURGER BUTTON (visible only on mobile) -->
      <button class="mobile-burger-btn" id="mobileBurger" onclick="toggleMobileNav()" aria-label="Menu">☰</button>

    </div>

    <!-- CATEGORIES BAR WITH VECTOR SVG ICONS -->
    <div class="airbnb-categories-bar">
      <div class="categories-scroll" id="categoriesScroll">
        <button class="category-item active" onclick="filterByCategory('all', this)">
          <span class="category-icon">${SVG.all}</span>
          <span class="category-label">Tous les biens</span>
        </button>
        <button class="category-item" onclick="filterByCategory('appartement', this)">
          <span class="category-icon">${SVG.haussmann}</span>
          <span class="category-label">Haussmannien</span>
        </button>
        <button class="category-item" onclick="filterByCategory('villa', this)">
          <span class="category-icon">${SVG.villa}</span>
          <span class="category-label">Villas & Luxe</span>
        </button>
        <button class="category-item" onclick="filterByCategory('loft', this)">
          <span class="category-icon">${SVG.loft}</span>
          <span class="category-label">Lofts & Ateliers</span>
        </button>
        <button class="category-item" onclick="filterByCategory('studio', this)">
          <span class="category-icon">${SVG.studio}</span>
          <span class="category-label">Studios Design</span>
        </button>
        <button class="category-item" onclick="filterByCategory('maison', this)">
          <span class="category-icon">${SVG.maison}</span>
          <span class="category-label">Maisons & Jardin</span>
        </button>
        <button class="category-item" onclick="filterByCategory('score', this)">
          <span class="category-icon">${SVG.score}</span>
          <span class="category-label">Top Score IA</span>
        </button>
        <button class="category-item" onclick="filterByCategory('baisses', this)">
          <span class="category-icon">${SVG.baisse}</span>
          <span class="category-label">Prix en Baisse</span>
        </button>
        <button class="category-item" onclick="filterByCategory('verifie', this)">
          <span class="category-icon">${SVG.verified}</span>
          <span class="category-label">Vérifiés</span>
        </button>
      </div>
    </div>
  </header>
  `;

  // --- FOOTER COMPONENT ---
  const footerHTML = `
  <footer class="airbnb-footer">
    <div class="airbnb-footer-container">
      <div class="footer-col">
        <h5>Assistance & Renseignements</h5>
        <ul>
          <li><a href="scoring.html">Score de confiance IA</a></li>
          <li><a href="risques.html">Analyse Géorisques</a></li>
          <li><a href="profil.html">Centre d'aide & Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>ImmoExpress</h5>
        <ul>
          <li><a href="vente.html">Acheter un bien</a></li>
          <li><a href="location.html">Louer un bien</a></li>
          <li><a href="recherche.html">Recherche Avancée</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h5>Espace Professionnels</h5>
        <ul>
          <li><a href="pro.html">Espace Agences & Pros</a></li>
          <li><a href="dashboard.html">Tableau de bord Admin</a></li>
          <li><a href="assets/templates/flyer.html">Télécharger la plaquette PDF</a></li>
        </ul>
      </div>
    </div>

    <div class="airbnb-footer-bottom">
      <p>© 2026 ImmoExpress, Inc. · <a href="cgu.html" style="color:inherit;text-decoration:none">Confidentialité & CGU</a> · Plan du site</p>
      <div class="footer-lang">
        <span style="margin-right:20px;">Français (FR) · € EUR</span>
        <span class="n-footer-eva">⚡ Architecturé par <a href="http://192.168.1.5:8999/" target="_blank" style="color:var(--n-cyan);text-decoration:none;font-weight:600;">NODUS_SYSTEMS</a> (DeepTech Souveraine) · Propulsé par l'IA Agentique E.V.A</span>
      </div>
    </div>
  </footer>
  `;

  // --- MOBILE BOTTOM NAV BAR ---
  const bottomNavHTML = `
  <nav class="n-mobile-bottom-nav">
    <a href="index.html" class="${isActive('index.html')}">
      <span class="icon">${SVG.all}</span>
      <span>Explorer</span>
    </a>
    <a href="vente.html" class="${isActive('vente.html')}">
      <span class="icon">${SVG.villa}</span>
      <span>Acheter</span>
    </a>
    <a href="location.html" class="${isActive('location.html')}">
      <span class="icon">${SVG.studio}</span>
      <span>Louer</span>
    </a>
    <a href="scoring.html" class="${isActive('scoring.html')}">
      <span class="icon">${SVG.score}</span>
      <span>Score IA</span>
    </a>
    <a href="profil.html" class="${isActive('profil.html')}">
      <span class="icon">${SVG.user}</span>
      <span>Profil</span>
    </a>
  </nav>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    // Inject Header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = headerHTML;
    } else if (!document.getElementById('appHeader')) {
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // Inject Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHTML;
    } else if (!document.querySelector('footer.airbnb-footer')) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // Inject Mobile Bottom Nav
    if (!document.querySelector('.n-mobile-bottom-nav')) {
      document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
    }
  });

  // Global Category filter handler
  window.filterByCategory = function (cat, btnEl) {
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    
    try {
      let st = window.pageState;
      if (!st && typeof state !== 'undefined') st = state;
      
      if (st) {
        if (cat === 'all') { st.type = 'all'; st.scoreFilter = 0; }
        else if (cat === 'score') { st.scoreFilter = 90; }
        else if (cat === 'baisses') { st.sort = 'price-asc'; }
        else { st.type = cat; }
        
        if (typeof window.renderPage === 'function') window.renderPage();
        else if (typeof render === 'function') render();
      }
    } catch (e) { console.error('Filter error:', e); }
  };

  // Global Mobile Nav Toggle
  window.toggleMobileNav = function() {
    const nav = document.querySelector('.airbnb-nav');
    const burger = document.getElementById('mobileBurger');
    if (!nav) return;
    const isOpen = nav.classList.toggle('open');
    if (burger) burger.textContent = isOpen ? '✕' : '☰';
  };

  // Close mobile nav on outside click
  document.addEventListener('click', function(e) {
    const nav = document.querySelector('.airbnb-nav');
    const burger = document.getElementById('mobileBurger');
    if (!nav || !nav.classList.contains('open')) return;
    if (!nav.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
      nav.classList.remove('open');
      if (burger) burger.textContent = '☰';
    }
  // --- INTERACTIVE MORTGAGE CALCULATOR COMPONENT ---
  window.renderMortgageCalculator = function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="n-card mortgage-calculator-card" style="padding:28px;background:var(--n-bg-card);border:1px solid var(--n-border);border-radius:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div>
            <h3 style="font-size:1.25rem;font-weight:700;margin:0 0 4px 0;color:var(--n-text)">🧮 Simuler votre Prêt Immobilier</h3>
            <p style="font-size:0.85rem;color:var(--n-text-secondary);margin:0">Estimez vos mensualités instantanément avec taux personnalisé</p>
          </div>
          <span style="font-size:0.75rem;padding:4px 10px;background:var(--n-cyan-dim);color:var(--n-cyan);border-radius:20px;font-weight:600;">Temps Réel</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:20px;margin-bottom:24px;">
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--n-text-secondary);margin-bottom:6px">Montant du bien (€)</label>
            <input type="number" id="calcPrice" value="350000" step="5000" style="width:100%;padding:10px 14px;background:var(--n-bg-secondary);border:1px solid var(--n-border);color:var(--n-text);border-radius:8px;font-size:1rem;font-weight:600;">
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--n-text-secondary);margin-bottom:6px">Apport personnel (€)</label>
            <input type="number" id="calcDown" value="50000" step="5000" style="width:100%;padding:10px 14px;background:var(--n-bg-secondary);border:1px solid var(--n-border);color:var(--n-text);border-radius:8px;font-size:1rem;font-weight:600;">
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--n-text-secondary);margin-bottom:6px">Durée du prêt (Années)</label>
            <input type="range" id="calcYears" min="5" max="30" value="20" style="width:100%;accent-color:var(--n-accent);">
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--n-text-tertiary);margin-top:4px"><span id="yearsVal">20 ans</span><span>30 ans</span></div>
          </div>
          <div>
            <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--n-text-secondary);margin-bottom:6px">Taux d'intérêt annuel (%)</label>
            <input type="number" id="calcRate" value="3.5" step="0.1" style="width:100%;padding:10px 14px;background:var(--n-bg-secondary);border:1px solid var(--n-border);color:var(--n-text);border-radius:8px;font-size:1rem;font-weight:600;">
          </div>
        </div>

        <div style="background:var(--n-bg-secondary);padding:20px;border-radius:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;">
          <div>
            <span style="font-size:0.85rem;color:var(--n-text-secondary);display:block;">Mensualité estimée (hors assurance)</span>
            <span id="monthlyResult" style="font-size:2rem;font-weight:800;color:var(--n-accent);">1 814 € / mois</span>
          </div>
          <div style="display:flex;gap:24px;font-size:0.85rem;color:var(--n-text-secondary);">
            <div>
              <span>Capital emprunté :</span>
              <strong id="borrowedResult" style="display:block;color:var(--n-text);font-size:1rem;">300 000 €</strong>
            </div>
            <div>
              <span>Coût total des intérêts :</span>
              <strong id="interestResult" style="display:block;color:var(--n-text);font-size:1rem;">135 360 €</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    function updateCalc() {
      const price = parseFloat(document.getElementById('calcPrice').value) || 0;
      const down = parseFloat(document.getElementById('calcDown').value) || 0;
      const years = parseInt(document.getElementById('calcYears').value, 10) || 20;
      const annualRate = parseFloat(document.getElementById('calcRate').value) || 0;

      document.getElementById('yearsVal').textContent = `${years} ans`;

      const P = Math.max(0, price - down);
      const r = (annualRate / 100) / 12;
      const n = years * 12;

      let monthly = 0;
      if (P > 0 && r > 0 && n > 0) {
        monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else if (P > 0 && n > 0) {
        monthly = P / n;
      }

      const totalPaid = monthly * n;
      const totalInterest = Math.max(0, totalPaid - P);

      document.getElementById('monthlyResult').textContent = `${Math.round(monthly).toLocaleString('fr-FR')} € / mois`;
      document.getElementById('borrowedResult').textContent = `${Math.round(P).toLocaleString('fr-FR')} €`;
      document.getElementById('interestResult').textContent = `${Math.round(totalInterest).toLocaleString('fr-FR')} €`;
    }

    ['calcPrice', 'calcDown', 'calcYears', 'calcRate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateCalc);
        el.addEventListener('change', updateCalc);
      }
    });

    updateCalc();
  };

})();
