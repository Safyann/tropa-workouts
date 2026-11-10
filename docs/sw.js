const version = "a9bbe0031af739f2";
const assets = ["assets/index-CedyLD91.js","assets/index-DvErzR-I.css","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest","map.svg"];
const scope = self.registration.scope;
const prefix = `tropa-shell:${scope}:`;
const cacheName = prefix + version;
const shell = new URL('index.html', scope).href;
const files = new Set(assets.map(path => new URL(path, scope).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll([...files].map(url => new Request(url, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isShell = request.mode === 'navigate' && [scope, shell].includes(url.origin + url.pathname);
  if (!isShell && !files.has(request.url)) return;
  event.respondWith(caches.open(cacheName).then(async cache =>
    (await cache.match(isShell ? shell : request)) ?? fetch(request)));
});
