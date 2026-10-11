// Service Worker for e-BK Career Self-Efficacy PWA
const CACHE_NAME = 'ebk-pwa-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/mobile.css',
  './js/database-siswa.js',
  './js/api-client.js',
  './js/cloud-db.js',
  './js/app.js',
  './manifest.json',
  './assets/logo-bk-mejayan.jpeg',
  './assets/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA Cache item failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-First strategy so updates appear immediately on mobile
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the fresh copy
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('./index.html');
        });
      })
  );
});
