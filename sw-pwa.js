// ============================================================
// ACADEMIA JOTA RUBIO — Service Worker (PWA)
// Estrategia: cache-first para assets estaticos, network-first
// para HTML, con fallback offline.
// ============================================================

const CACHE_NAME = 'jrubio-pwa-v2';
const STATIC_CACHE = 'jrubio-static-v1';
const RUNTIME_CACHE = 'jrubio-runtime-v1';

// Assets criticos que se cachean en install (offline-ready)
const PRECACHE_URLS = [
  './',
  './index.html',
  './dashboard.html',
  './academia.html',
  './curso.html',
  './biblioteca.html',
  './foro.html',
  './ia.html',
  './live.html',
  './planes.html',
  './login.html',
  './perfil.html',
  './comunidad.html',
  './blog.html',
  './landing.html',
  './404.html',
  './offline.html',
  './manifest.json',
  './assets/logos/logo.svg',
  './assets/logos/favicon.svg',
  './assets/og/og-image.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './css/main.css',
  './css/components.css',
  './css/animations.css',
  './css/dashboard.css',
  './css/responsive.css',
  './js/main.js',
  './js/animations.js'
];

// ── Install: precache ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('Precache error:', err))
  );
});

// ── Activate: limpia caches viejos ─────────────────────────
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !currentCaches.includes(n)).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: estrategias segun tipo de recurso ──────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET
  if (request.method !== 'GET') return;

  // Ignorar cross-origin (fonts de Google, etc.) — manejados por browser
  if (url.origin !== location.origin) return;

  // Ignorar admin/api endpoints (no hay, pero por las dudas)
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const isHTML = request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('/') || url.pathname.endsWith('.html');

  // 1. HTML: network-first, fallback a cache, fallback a offline.html
  if (isHTML) {
    try {
      const fresh = await fetch(request);
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, fresh.clone());
      return fresh;
    } catch (e) {
      const cached = await caches.match(request);
      if (cached) return cached;
      const offline = await caches.match('./offline.html');
      if (offline) return offline;
      return new Response('Sin conexion. Recarga cuando tengas internet.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }

  // 2. Assets estaticos: cache-first
  const cached = await caches.match(request);
  if (cached) return cached;

  // 3. Si no esta en cache, ir a network
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (e) {
    return new Response('Recurso no disponible offline.', { status: 503 });
  }
}

// ── Message: skip waiting on demand ────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
