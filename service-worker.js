const CACHE_NAME = 'fatigue-tool-cache-v1';
const urlsToCache = [
  '/fatigue-assessment-tool/',
  '/fatigue-assessment-tool/index.html',
  '/fatigue-assessment-tool/styles.css',
  '/fatigue-assessment-tool/script.js',
  '/fatigue-assessment-tool/offline.html',
  '/fatigue-assessment-tool/images/icon-192.png',
  '/fatigue-assessment-tool/images/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available
        if (response) {
          return response;
        }
        // Attempt to fetch from network
        return fetch(event.request).catch(() => {
          // If fetch fails (e.g., offline), return offline.html for all requests
          return caches.match('/fatigue-assessment-tool/offline.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});