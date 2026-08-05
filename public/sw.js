const CACHE_NAME = 'bomagawani-v30';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/logo.svg',
  '/logo-192.png',
  '/logo-512.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isAppShellRequest(pathname) {
  return (
    pathname === '/' ||
    pathname.endsWith('.html') ||
    pathname === '/app.js' ||
    pathname === '/styles.css' ||
    pathname === '/admin.js' ||
    pathname === '/admin.css'
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/receipt/')) return;

  if (isAppShellRequest(url.pathname)) {
    // Network-first: always try to fetch the latest app shell so a new
    // deploy shows up the very next time someone opens or reloads the site,
    // not one visit late. The cache is only a fallback for when the network
    // request fails (offline), not the default source of truth.
    // `cache: 'reload'` is required here - these files are served with a
    // 10-minute Cache-Control max-age, so a plain fetch() can be silently
    // satisfied from the browser's HTTP cache instead of hitting the
    // network, defeating this whole network-first strategy.
    event.respondWith(
      fetch(event.request, { cache: 'reload' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {
            // Some requests cannot be cached (opaque/cors), ignore safely
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy).catch(() => {
            // Some requests cannot be cached (opaque/cors), ignore safely
          });
        });
        return response;
      });
    })
  );
});
