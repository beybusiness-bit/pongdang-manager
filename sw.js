const CACHE_NAME = 'pongdang-v1';
const SHELL_URLS = [
  '/pongdang-manager/',
  '/pongdang-manager/index.html',
  '/pongdang-manager/icon-192.png',
  '/pongdang-manager/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  var url = event.request.url;

  // Google API / OAuth는 캐시하지 않음
  if (url.includes('googleapis.com/v4/spreadsheets') ||
      url.includes('accounts.google.com') ||
      url.includes('oauth2') ||
      url.includes('token')) {
    return;
  }

  // Google Fonts는 stale-while-revalidate
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var network = fetch(event.request).then(function(res) {
            cache.put(event.request, res.clone());
            return res;
          });
          return cached || network;
        });
      })
    );
    return;
  }

  // 앱 쉘 (index.html 포함) — network-first, 실패 시 캐시 fallback
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
