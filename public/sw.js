// UPAHAR Multi-Panel Progressive Web App Service Worker
const CACHE_NAME = 'upahar-pwa-v4';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/manifest-admin.json',
  '/manifest-kitchen.json',
  '/manifest-rider.json',
  '/manifest-dev.json',
  '/icons/customer-192.png',
  '/icons/customer-512.png',
  '/icons/customer-maskable.png',
  '/icons/admin-192.png',
  '/icons/admin-512.png',
  '/icons/admin-maskable.png',
  '/icons/kitchen-192.png',
  '/icons/kitchen-512.png',
  '/icons/kitchen-maskable.png',
  '/icons/rider-192.png',
  '/icons/rider-512.png',
  '/icons/rider-maskable.png',
  '/icons/dev-192.png',
  '/icons/dev-512.png',
  '/icons/dev-maskable.png',
  '/images/upahar_logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use Promise.allSettled so a network blip or dynamic route never stops the service worker from installing
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('PWA: Cached item warning for:', url, err?.message || err);
          })
        )
      );
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

  // Never cache API routes, Next.js bundler internals, or live SSE streams
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('/stream')
  ) {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          (url.pathname.startsWith('/icons/') || url.pathname.endsWith('.json') || url.pathname.startsWith('/images/'))
        ) {
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
