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







// ═══════════════════════════════════════════════════
// PUSH — fires even if the app was fully closed or removed
// from Recent Apps, as long as the device has network.
// ═══════════════════════════════════════════════════
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: '🍽️ New Order!', body: event.data ? event.data.text() : '' }; }

  var title = data.title || '🍽️ New Order!';
  var options = {
    body: data.body || 'Tap to open Staff Panel',
    tag: data.tag || 'staff-order-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || './' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf(url) !== -1 && 'focus' in clientList[i]) return clientList[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
