const CACHE_NAME = 'member-dashboard-v1';
const urlsToCache = [
  '/greataspirationmy.github.io/',
  '/greataspirationmy.github.io/index.html',
  '/greataspirationmy.github.io/dashboard.html',
  '/greataspirationmy.github.io/events.html',
  '/greataspirationmy.github.io/manifest.json',
  '/greataspirationmy.github.io/js/app.js',
  '/greataspirationmy.github.io/icons/icon-192x192.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', 
  // 添加其他需要缓存的资源
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 处理fetch请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
  );
}); 
