// static/js/serviceworker.js
const CACHE_NAME = 'cshub-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/static/css/bootstrap.min.css',  // if you use CDN, skip or cache key pages
    '/offline/',  // optional: create an offline page later
];

// Install: Cache core assets immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate: Take control immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        self.clients.claim()  // Forces new SW to control pages instantly
    );
});

// Fetch: Required handler — makes SW "valid" for install prompt
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});