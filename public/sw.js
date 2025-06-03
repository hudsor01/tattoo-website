/**
 * Service Worker for Ink 37 Tattoos PWA
 * Implements offline functionality, caching, and background sync
 * Enhanced with improved cache strategies and performance optimizations
 */

// Cache names for different content types
const CACHE_NAMES = {
  STATIC: 'ink37-static-v2',
  IMAGES: 'ink37-images-v2',
  PAGES: 'ink37-pages-v2',
  FONTS: 'ink37-fonts-v2',
  API: 'ink37-api-v2'
};

// Offline fallback URL
const OFFLINE_URL = '/offline.html';

// Core static assets for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/booking-icon.png',
  '/icons/gallery-icon.png',
  '/icons/portal-icon.png'
];

// Assets to cache on install
const PRECACHE_ASSETS = [
  ...STATIC_ASSETS,
  '/images/realism.jpg',
  '/images/traditional.jpg',
  '/images/japanese.jpg'
];

// Cache-first strategy paths
const CACHE_FIRST_PATHS = [
  '/icons/',
  '/images/',
  '.png',
  '.jpg',
  '.svg',
  '.webp',
  '.ico',
  'manifest.json'
];

// Network-first paths
const NETWORK_FIRST_PATHS = [
  '/',
  '/gallery',
  '/about',
  '/services',
  '/contact',
  '/booking'
];

// Paths to bypass (never cache)
const BYPASS_PATHS = [
  '/api/',
  '/_next/data/',
  '/admin/',
  '/sign-in',
  '/sign-up',
  'auth'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(CACHE_NAMES.STATIC);
        await staticCache.addAll(PRECACHE_ASSETS);
        console.warn('[ServiceWorker] Static assets pre-cached successfully');
        await self.skipWaiting();
      } catch (error) {
        console.error('[ServiceWorker] Pre-cache failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Get all cache keys
        const cacheKeys = await caches.keys();
        
        // Get current cache names as an array
        const currentCaches = Object.values(CACHE_NAMES);
        
        // Delete old caches
        const deletionPromises = cacheKeys
          .filter(key => !currentCaches.includes(key))
          .map(key => {
            console.warn(`[ServiceWorker] Deleting old cache: ${key}`);
            return caches.delete(key);
          });
        
        await Promise.all(deletionPromises);
        await self.clients.claim();
        console.warn('[ServiceWorker] Activated and claimed clients');
      } catch (error) {
        console.error('[ServiceWorker] Activation error:', error);
      }
    })()
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip SW file itself
  if (url.pathname.includes('/sw.js')) {
    return;
  }
  
  // Skip paths that should never be cached
  if (BYPASS_PATHS.some(path => url.pathname.includes(path))) {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event.request)
    );
    return;
  }
  
  // Handle image requests with cache-first strategy
  if (isImageRequest(event.request)) {
    event.respondWith(
      handleImageRequest(event.request)
    );
    return;
  }
  
  // Handle static assets with cache-first
  if (shouldCacheFirst(url.pathname)) {
    event.respondWith(
      handleCacheFirstRequest(event.request)
    );
    return;
  }
  
  // Use network-first for main pages
  if (NETWORK_FIRST_PATHS.some(path => url.pathname.startsWith(path))) {
    event.respondWith(
      handleNetworkFirstRequest(event.request)
    );
    return;
  }
});

/**
 * Navigation request handler with advanced fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, clone and cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.PAGES);
      await cache.put(request.url, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.warn('[ServiceWorker] Navigation fetch failed, falling back to cache:', error);
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If cache fails too, return offline page
    console.warn('[ServiceWorker] No cached navigation response, returning offline page');
    return caches.match(OFFLINE_URL);
  }
}

/**
 * Image request handler with improved caching
 */
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.IMAGES);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[ServiceWorker] Image fetch failed:', error);
    // Return a placeholder image or empty response
    return new Response('Image not available offline', { status: 503 });
  }
}

/**
 * Cache-first request handler
 */
async function handleCacheFirstRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[ServiceWorker] Cache-first fetch failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

/**
 * Network-first request handler
 */
async function handleNetworkFirstRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.PAGES);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[ServiceWorker] Network-first fetch failed:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Not available offline', { status: 503 });
  }
}

// Helper function to check if a request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.includes('/images/') ||
    url.pathname.includes('/icons/')
  );
}

// Helper function to determine if a path should use cache-first strategy
function shouldCacheFirst(pathname) {
  return CACHE_FIRST_PATHS.some(path => pathname.includes(path));
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-requests' || event.tag === 'sync-appointments') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Helper function to sync offline requests
async function syncOfflineRequests() {
  try {
    // Get cached requests from IndexedDB or localStorage
    const offlineRequests = await getOfflineRequests();
    
    if (!offlineRequests || offlineRequests.length === 0) {
      return;
    }
    
    console.warn(`[ServiceWorker] Syncing ${offlineRequests.length} offline requests`);
    
    const successfulSyncs = [];
    
    for (const request of offlineRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
          credentials: 'include'
        });
        
        if (response.ok) {
          successfulSyncs.push(request.id);
          console.warn(`[ServiceWorker] Successfully synced request to ${request.url}`);
        } else {
          console.error(`[ServiceWorker] Failed to sync request: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`[ServiceWorker] Error syncing request: ${error}`);
      }
    }
    
    // Remove successfully synced requests
    if (successfulSyncs.length > 0) {
      await removeOfflineRequests(successfulSyncs);
    }
    
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// Helper function to get offline requests
async function getOfflineRequests() {
  // This is a simplified version - would normally use IndexedDB
  try {
    const data = localStorage.getItem('offline_request_queue');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[ServiceWorker] Failed to get offline requests:', error);
    return [];
  }
}

// Helper function to remove offline requests
async function removeOfflineRequests(ids) {
  // This is a simplified version - would normally use IndexedDB
  try {
    const requests = await getOfflineRequests();
    const updatedRequests = requests.filter(req => !ids.includes(req.id));
    localStorage.setItem('offline_request_queue', JSON.stringify(updatedRequests));
  } catch (error) {
    console.error('[ServiceWorker] Failed to remove offline requests:', error);
  }
}

// Message handler with improved error handling
self.addEventListener('message', (event) => {
  try {
    // Verify origin for security
    if (event.origin !== self.location.origin) {
      console.warn(`[ServiceWorker] Rejected message from unauthorized origin: ${event.origin}`);
      return;
    }
    
    if (!event.data) {
      return;
    }
    
    // Handle skip waiting
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting().then(() => {
        console.warn('[ServiceWorker] Skipped waiting phase');
      });
    }
    
    // Handle cache update request
    if (event.data.type === 'UPDATE_CACHE') {
      updateCache(event.data.url);
    }
    
    // Handle cache clear request
    if (event.data.type === 'CLEAR_CACHE') {
      clearCache();
    }
  } catch (error) {
    console.error('[ServiceWorker] Error handling message:', error);
  }
});

// Helper function to update a specific cached resource
async function updateCache(url) {
  if (!url) return;
  
  try {
    const request = new Request(url);
    const response = await fetch(request);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    // Determine which cache to use
    let cacheName = CACHE_NAMES.PAGES;
    if (isImageRequest(request)) {
      cacheName = CACHE_NAMES.IMAGES;
    } else if (shouldCacheFirst(url)) {
      cacheName = CACHE_NAMES.STATIC;
    }
    
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
    console.warn(`[ServiceWorker] Updated cache for: ${url}`);
  } catch (error) {
    console.error(`[ServiceWorker] Failed to update cache for ${url}:`, error);
  }
}

// Helper function to clear all caches
async function clearCache() {
  try {
    const cacheNames = Object.values(CACHE_NAMES);
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.warn(`[ServiceWorker] Cleared cache: ${cacheName}`);
    }
  } catch (error) {
    console.error('[ServiceWorker] Failed to clear caches:', error);
  }
}

// Periodic sync for updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

// Helper function to check for service worker updates
async function checkForUpdates() {
  try {
    const registration = await self.registration.update();
    console.warn('[ServiceWorker] Update check completed');
    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Update check failed:', error);
  }
}