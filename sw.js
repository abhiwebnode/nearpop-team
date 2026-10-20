// Bump CACHE_NAME on every deploy that changes cached files.
const CACHE_NAME = 'nearpop-hub-v2';
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
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('googleapis.com') || req.url.includes('accounts.google.com')) return;

  // Pages: network first so the team always gets the latest version; cache only when offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Everything else: cache first
  e.respondWith(caches.match(req).then((res) => res || fetch(req)));
});
