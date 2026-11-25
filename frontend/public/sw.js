// Boardwallah PWA Service Worker (v4)
// Caches core app shell, assets & offline CBSE revision resources

const CACHE_NAME = 'boardwallah-pwa-v4';

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
];

// Install: Pre-cache core app shell and immediately activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v4] Pre-caching offline app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: Clean up ALL older caches (v1, v2, v3, etc.) & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW v4] Purging obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 1. Never intercept non-GET requests (e.g. POST to AI tutor API or Firestore)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Only cache same-origin requests (avoid intercepting Google Auth, Firestore, Analytics)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. Navigation / HTML pages: Always Network First!
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          // Only serve root '/' from cache if requesting '/'
          if (url.pathname === '/' || url.pathname === '') {
            const cachedRoot = await cache.match('/');
            if (cachedRoot) return cachedRoot;
          }
          const cachedSpecific = await cache.match(request);
          if (cachedSpecific) return cachedSpecific;

          return new Response('Offline — Boardwallah is ready once reconnected.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 4. Same-origin Static Assets (JS, CSS, Images, Fonts, Icons): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
