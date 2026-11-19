const CACHE = 'guide-quiz-offline-v1';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const url = new URL(event.request.url);
    const lookup = url.pathname.endsWith('/') ? new URL('index.html', url).href : event.request;
    const cached = await cache.match(lookup, {ignoreSearch:true});
    return cached || fetch(event.request);
  }));
});
