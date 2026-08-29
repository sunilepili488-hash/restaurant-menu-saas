const CACHE_NAME = 'auramenu-staff-v1';
const STATIC_ASSETS = ['./', './index.html', './style.css', './app.js', './config.js', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
