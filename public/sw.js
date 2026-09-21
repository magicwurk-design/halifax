const CACHE_NAME = 'halifax-v2';

// Only cache truly static assets — never page routes
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('[SW] Failed to cache static assets:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept navigation requests — let Next.js / Vercel handle routing
  // This prevents the auth redirect loop caused by cached page shells
  if (event.request.mode === 'navigate') return;

  // Only apply cache strategy to same-origin static assets
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        if (cached) return cached;
        return new Response('Offline — please reconnect to use Halifax.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
      return cached || fetchPromise;
    })
  );
});
