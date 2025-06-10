// Service Worker for Ink 37 Tattoos Website
// Provides offline capabilities, resource caching, and performance optimization

const CACHE_NAME = 'ink37-tattoos-v1';
const STATIC_CACHE_NAME = 'ink37-static-v1';
const DYNAMIC_CACHE_NAME = 'ink37-dynamic-v1';
const IMAGE_CACHE_NAME = 'ink37-images-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/gallery',
  '/services',
  '/booking',
  '/contact',
  '/about',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Cache First (for static assets)
  cacheFirst: [
    /\.(css|js|woff|woff2|ttf|eot)$/,
    /\/icons\//,
    /\/favicon/,
  ],
  
  // Network First (for dynamic content)
  networkFirst: [
    /\/api\//,
    /\/booking/,
    /\/contact/,
  ],
  
  // Stale While Revalidate (for images and gallery content)
  staleWhileRevalidate: [
    /\.(jpg|jpeg|png|gif|webp|avif|svg)$/,
    /\/gallery/,
    /\/images\//,
  ],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip requests to external APIs (except for fonts and analytics)
  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes('fonts.googleapis.com') &&
    !url.hostname.includes('fonts.gstatic.com') &&
    !url.hostname.includes('google-analytics.com')
  ) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Handle different types of requests with appropriate caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Determine cache strategy based on request type
    if (isCacheFirst(pathname)) {
      return await cacheFirst(request);
    } else if (isNetworkFirst(pathname)) {
      return await networkFirst(request);
    } else if (isStaleWhileRevalidate(pathname)) {
      return await staleWhileRevalidate(request);
    } else {
      // Default to network first for unknown requests
      return await networkFirst(request);
    }
  } catch (error) {
    console.error('Service Worker: Error handling request:', error);
    
    // Return fallback for navigation requests
    if (request.mode === 'navigate') {
      return await getFallbackResponse();
    }
    
    return new Response('Service Unavailable', { status: 503 });
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache first failed:', error);
    throw error;
  }
}

// Network First Strategy - for dynamic content
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate Strategy - for images and semi-dynamic content
async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start network request regardless of cache hit
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Service Worker: Network update failed:', error);
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || networkResponsePromise;
}

// Get fallback response for navigation requests
async function getFallbackResponse() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  return await cache.match('/') || new Response('Offline', { status: 200 });
}

// Helper functions to determine cache strategy
function isCacheFirst(pathname) {
  return CACHE_STRATEGIES.cacheFirst.some(pattern => pattern.test(pathname));
}

function isNetworkFirst(pathname) {
  return CACHE_STRATEGIES.networkFirst.some(pattern => pattern.test(pathname));
}

function isStaleWhileRevalidate(pathname) {
  return CACHE_STRATEGIES.staleWhileRevalidate.some(pattern => pattern.test(pathname));
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  } else if (event.tag === 'booking-form') {
    event.waitUntil(syncBookingForm());
  }
});

// Sync contact form submissions when online
async function syncContactForm() {
  try {
    // Get pending contact form submissions from IndexedDB
    const pendingSubmissions = await getPendingContactSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data),
        });
        
        if (response.ok) {
          await removePendingSubmission('contact', submission.id);
          console.log('Service Worker: Contact form submission synced');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync contact form:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error in contact form sync:', error);
  }
}

// Sync booking form submissions when online
async function syncBookingForm() {
  try {
    // Get pending booking form submissions from IndexedDB
    const pendingSubmissions = await getPendingBookingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data),
        });
        
        if (response.ok) {
          await removePendingSubmission('booking', submission.id);
          console.log('Service Worker: Booking form submission synced');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync booking form:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Error in booking form sync:', error);
  }
}

// IndexedDB helper functions (simplified)
async function getPendingContactSubmissions() {
  // Implementation would use IndexedDB to store/retrieve pending submissions
  return [];
}

async function getPendingBookingSubmissions() {
  // Implementation would use IndexedDB to store/retrieve pending submissions
  return [];
}

async function removePendingSubmission(type, id) {
  // Implementation would remove submission from IndexedDB
  console.log(`Removed pending ${type} submission:`, id);
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Ink 37 Tattoos', options)
    );
  } catch (error) {
    console.error('Service Worker: Error handling push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Check if the site is already open
      const existingClient = clients.find(client => 
        client.url.includes(self.location.origin)
      );
      
      if (existingClient) {
        existingClient.focus();
        existingClient.navigate(urlToOpen);
      } else {
        self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCacheEntries());
  }
});

// Clean up old cache entries
async function cleanupOldCacheEntries() {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (now - responseDate > maxAge) {
              await cache.delete(request);
              console.log('Service Worker: Cleaned up old cache entry:', request.url);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error cleaning up cache:', error);
  }
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker: Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});
