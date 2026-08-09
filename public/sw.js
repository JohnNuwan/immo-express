// Immo-Express — Service Worker v2.1
const CACHE = 'immo-express-v2.1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/nodus.css',
  '/css/responsive.css',
  '/css/style.css',
  '/js/api.js',
  '/js/auth.js',
  '/js/app.js',
  '/js/components.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// Install — cache les assets
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
});

// Activate — nettoie vieux caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// Fetch — réseau d'abord, cache en fallback
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});