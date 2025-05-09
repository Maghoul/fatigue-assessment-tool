const CACHE_NAME = 'fatigue-tool-cache-v1';
     const urlsToCache = [
       './',
       './index.html',
       './styles.css',
       './script.js',
       './offline.html',
       './images/icon-192.png',
       './images/icon-512.png'
     ];

     self.addEventListener('install', event => {
       event.waitUntil(
         caches.open(CACHE_NAME)
           .then(cache => {
             console.log('Opened cache');
             return cache.addAll(urlsToCache);
           })
       );
       self.skipWaiting();
     });

     self.addEventListener('fetch', event => {
       event.respondWith(
         caches.match(event.request)
           .then(cachedResponse => {
             const networkFetch = fetch(event.request).then(networkResponse => {
               // Clone the response immediately to preserve the body
               const responseClone = networkResponse.ok && event.request.method === 'GET' ? networkResponse.clone() : null;
               if (responseClone) {
                 caches.open(CACHE_NAME).then(cache => {
                   cache.put(event.request, responseClone);
                 });
               }
               return networkResponse;
             }).catch(() => {
               if (cachedResponse) {
                 return cachedResponse;
               }
               if (event.request.mode === 'navigate') {
                 return caches.match('./offline.html');
               }
             });
             return cachedResponse || networkFetch;
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
       self.clients.claim();
     });