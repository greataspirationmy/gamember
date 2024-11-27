const CACHE_NAME = 'member-dashboard-v1';
const urlsToCache = [
  '/greataspirationmy.github.io/gamember/',
  '/greataspirationmy.github.io/gamember/index.html',
  '/greataspirationmy.github.io/gamember/dashboard.html',
  '/greataspirationmy.github.io/gamember/events.html',
  '/greataspirationmy.github.io/gamember/manifest.json',
  '/greataspirationmy.github.io/gamember/js/app.js',
  '/greataspirationmy.github.io/gamember/icon-144x144.png',
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
