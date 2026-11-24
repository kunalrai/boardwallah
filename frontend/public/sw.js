// Boardwallah PWA Service Worker (v1)
// Caches core app shell, assets & offline CBSE revision resources

const CACHE_NAME = 'boardwallah-pwa-v1';

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

// Install: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
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
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST) from caching directly
  if (request.method !== 'GET') {
    // If it's the AI tutor API and offline, provide an offline fallback
    if (url.pathname.includes('/api/v1/ai/doubt-tutor')) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({
              answer: '📶 **Offline Mode**: You appear to be offline. Reconnect to the internet for live AI answers. In the meantime, you can review your **Recent doubts** or click the **Revision Vault (★)** in the sidebar!',
              keyTerms: ['Offline Mode', 'Revision Vault', 'Cached Doubts'],
              engine: 'sw_offline_fallback',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        })
      );
    }
    return;
  }

  // 1. Navigation / HTML pages: Network first, fallback to cached '/'
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
          const cachedResponse = await cache.match('/') || await cache.match(request);
          return cachedResponse || new Response('Offline — Boardwallah is ready once reconnected.', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts, Icons): Stale-While-Revalidate
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
