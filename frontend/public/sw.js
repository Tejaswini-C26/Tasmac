// TASMAC B2B Supply Platform - Service Worker (Network-first)
const CACHE_NAME = 'tasmac-b2b-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Always fetch from network first so latest code changes load instantly
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
