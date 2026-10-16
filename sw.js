// Service Worker: speichert die App-Dateien, damit Schnuffel ohne Internet startet.
// Bei jeder Änderung an einer der Dateien unten CACHE_VERSION erhöhen, sonst sehen Nutzer die alte Version.
const CACHE_VERSION = 'schnuffel-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/app.js',
  './src/router.js',
  './src/storage.js',
  './src/store.js',
  './src/styles.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Cache zuerst, dann Netz. Seitenaufrufe fallen offline auf index.html zurück.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: request.mode === 'navigate' }).then(
      (cached) =>
        cached ??
        fetch(request).catch(() => {
          if (request.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        }),
    ),
  );
});
