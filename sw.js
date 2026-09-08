const CACHE_NAME = 'nearpop-hub-v1';
const ASSETS = [
  './',
  './index.html',
  './report.html',
  'https://nearpop.in/icons/logo.png',
  'https://nearpop.in/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});