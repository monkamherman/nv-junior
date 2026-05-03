const CACHE_NAME = 'centic-v1';
const STATIC_CACHE = 'centic-static-v1';
const API_CACHE = 'centic-api-v1';

// Ressources statiques à mettre en cache
const STATIC_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.jpg',
  '/img1.jpg',
  '/img3.jpg',
  '/font.jpeg',
  '/etudiante.jpg',
  '/logo-bg.png'
];

// Stratégie : Cache First pour les ressources statiques
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Page hors-ligne pour les requêtes HTML
    if (request.destination === 'document') {
      return caches.match('/');
    }
    return new Response('Hors-ligne', { status: 503 });
  }
};

// Stratégie : Network First pour les API
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('API hors-ligne', { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_URLS))
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== API_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Gestion des requêtes avec stratégies appropriées
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ne pas intercepter les schémas non supportés par CacheStorage (chrome-extension:, moz-extension:, etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // CacheStorage ne supporte que les requêtes GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Stratégie différente selon le type de requête
  if (request.destination === 'document' || 
      request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    // Cache First pour les ressources statiques
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/api/')) {
    // Network First pour les API
    event.respondWith(networkFirst(request));
  } else {
    // Network First par défaut
    event.respondWith(networkFirst(request));
  }
});

// Gestion des mises à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Synchronisation en arrière-plan (si supporté)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Logique de synchronisation des données hors-ligne
  console.log('Synchronisation en arrière-plan');
}
