const CACHE_NAME = 'langos-tv-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Nunca interceptar streams ou chamadas de proxy
  if (
    url.includes('.m3u8') || 
    url.includes('.ts') || 
    url.includes('.mp4') || 
    url.includes('stream') || 
    url.includes('/api/')
  ) {
    return;
  }

  // Network-First: sempre busca a versão mais recente na rede
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
