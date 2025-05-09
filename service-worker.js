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
               const isCacheable = networkResponse.ok &&
                                   event.request.method === 'GET' &&
                                   event.request.url.startsWith('http');
               if (isCacheable) {
                 // Clone twice: one for validation, one for caching
                 const validationClone = networkResponse.clone();
                 const cacheClone = networkResponse.clone();
                 return validationClone.text().then(content => {
                   console.log(`Caching ${event.request.url}, status: ${networkResponse.status}, content length: ${content.length}`);
                   if (content.length > 0) {
                     caches.open(CACHE_NAME).then(cache => {
                       cache.put(event.request, cacheClone).catch(error => {
                         console.error(`Failed to cache ${event.request.url}:`, error);
                       });
                     });
                   } else {
                     console.warn(`Empty response for ${event.request.url}, not caching`);
                   }
                   return networkResponse;
                 });
               } else {
                 console.log(`Skipping cache for ${event.request.url}, cacheable: ${isCacheable}`);
                 return networkResponse;
               }
             }).catch(error => {
               console.error(`Fetch failed for ${event.request.url}:`, error);
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