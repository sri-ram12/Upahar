// UPAHAR Progressive Web App Service Worker
const CACHE_NAME = 'upahar-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/manifest-admin.json',
  '/manifest-rider.json',
  '/manifest-dev.json',
  '/icons/customer-192.png',
  '/icons/admin-192.png',
  '/icons/rider-192.png',
  '/icons/dev-192.png',
  '/images/upahar_logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA: Some static assets failed to cache during install', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API routes, Server-Sent Events, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/stream')
  ) {
    return;
  }

  // Network-first strategy for pages and assets, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful response for static assets
        if (response.status === 200 && (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/'))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
