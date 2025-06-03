/**
 * Enhanced Offline Management for PWA
 *
 * Provides sophisticated offline functionality with background sync,
 * intelligent caching, and seamless online/offline transitions.
 */
'use client';

import { logger } from "@/lib/logger";

export interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineData {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt?: number | undefined;
}

// Cache configuration
const CACHE_CONFIG = {
  STATIC_CACHE: 'ink37-static-v1',
  DYNAMIC_CACHE: 'ink37-dynamic-v1',
  API_CACHE: 'ink37-api-v1',
  IMAGES_CACHE: 'ink37-images-v1',
  OFFLINE_QUEUE: 'ink37-offline-queue',
} as const;

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
} as const;

/**
 * Check if the app is currently online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Add online/offline event listeners
 */
export function addConnectionListeners(onOnline: () => void, onOffline: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const handleOnline = () => {
    void void logger.error('App came online');
    onOnline();
    void processOfflineQueue();
  };

  const handleOffline = () => {
    void void logger.error('App went offline');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Store data for offline access
 */
export async function storeOfflineData(
  key: string,
  data: unknown,
  expiresIn?: number
): Promise<void> {
  try {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : (undefined as number | undefined),
    };

    localStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
  } catch (error) {
    void void logger.error('Failed to store offline data:', error);
  }
}

/**
 * Retrieve data from offline storage
 */
export function getOfflineData<T = unknown>(key: string): T | null {
  try {
    const stored = localStorage.getItem(`offline_${key}`);
    if (!stored) return null;

    const offlineData: OfflineData = JSON.parse(stored);

    // Check if data has expired
    if (offlineData.expiresAt && Date.now() > offlineData.expiresAt) {
      localStorage.removeItem(`offline_${key}`);
      return null;
    }

    return offlineData.data as T;
  } catch (error) {
    void void logger.error('Failed to retrieve offline data:', error);
    return null;
  }
}

/**
 * Add request to offline queue for background sync
 */
export async function queueOfflineRequest(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<void> {
  try {
    const request: OfflineRequest = {
      id: crypto.randomUUID(),
      url,
      method: options.method ?? 'GET',
      headers: (options.headers as Record<string, string>) || {},
      body: options.body as string,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    const queue = getOfflineQueue();
    queue.push(request);
    saveOfflineQueue(queue);

    // Register background sync if service worker is available
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration && registration.sync) {
        await (registration.sync as { register: (tag: string) => Promise<void> }).register(
          'offline-requests'
        );
      }
    }
  } catch (error) {
    void void logger.error('Failed to queue offline request:', error);
  }
}

/**
 * Get offline request queue
 */
function getOfflineQueue(): OfflineRequest[] {
  try {
    const stored = localStorage.getItem('offline_request_queue');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    void void logger.error('Failed to get offline queue:', error);
    return [];
  }
}

/**
 * Save offline request queue
 */
function saveOfflineQueue(queue: OfflineRequest[]): void {
  try {
    localStorage.setItem('offline_request_queue', JSON.stringify(queue));
  } catch (error) {
    void void logger.error('Failed to save offline queue:', error);
  }
}

/**
 * Process offline request queue when coming back online
 */
export async function processOfflineQueue(): Promise<void> {
  if (!isOnline()) {
    return;
  }

  const queue = getOfflineQueue();
  const processedIds: string[] = [];

  for (const request of queue) {
    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
      };

      if (request.body) {
        fetchOptions.body = request.body;
      }

      const response = await fetch(request.url, fetchOptions);

      if (response.ok) {
        processedIds.push(request.id);
        void void logger.error(`Successfully synced offline request: ${request.url}`);
      } else {
        request.retryCount++;
        if (request.retryCount >= request.maxRetries) {
          processedIds.push(request.id);
          void void logger.error(
            `Failed to sync request after ${request.maxRetries} retries: ${request.url}`
          );
        }
      }
    } catch (error) {
      request.retryCount++;
      if (request.retryCount >= request.maxRetries) {
        processedIds.push(request.id);
        void void logger.error(`Failed to sync request: ${request.url}`, error);
      }
    }
  }

  // Remove processed requests from queue
  const remainingQueue = queue.filter((req) => !processedIds.includes(req.id));
  saveOfflineQueue(remainingQueue);
}

/**
 * Enhanced fetch with offline support
 */
export async function offlineCapableFetch(
  url: string,
  options: RequestInit = {},
  strategy: string = CACHE_STRATEGIES.NETWORK_FIRST
): Promise<Response> {
  const cacheKey = `${options.method ?? 'GET'}_${url}`;

  try {
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirstStrategy(url, options, cacheKey);

      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirstStrategy(url, options, cacheKey);

      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidateStrategy(url, options, cacheKey);

      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(url, options);

      case CACHE_STRATEGIES.CACHE_ONLY:
        return (await getCachedResponse(cacheKey)) ?? new Response(null, { status: 404 });

      default:
        return await networkFirstStrategy(url, options, cacheKey);
    }
  } catch (error) {
    // If all strategies fail and we're offline, queue the request
    if (
      !isOnline() &&
      (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')
    ) {
      await queueOfflineRequest(url, options);
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw error;
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirstStrategy(
  url: string,
  options: RequestInit,
  cacheKey: string
): Promise<Response> {
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, options);
  if (response.ok) {
    await setCachedResponse(cacheKey, response.clone());
  }
  return response;
}

/**
 * Network-first strategy
 */
async function networkFirstStrategy(
  url: string,
  options: RequestInit,
  cacheKey: string
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      await setCachedResponse(cacheKey, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidateStrategy(
  url: string,
  options: RequestInit,
  cacheKey: string
): Promise<Response> {
  const cached = await getCachedResponse(cacheKey);

  // Start background fetch to update cache
  void fetch(url, options)
    .then((response) => {
      if (response.ok) {
        void setCachedResponse(cacheKey, response.clone());
      }
    })
    .catch((error) => {
      void void logger.warn('Background revalidation failed:', error);
    });

  // Return cached version immediately if available
  if (cached) {
    return cached;
  }

  // If no cache, wait for network
  return await fetch(url, options);
}

/**
 * Get cached response
 */
async function getCachedResponse(key: string): Promise<Response | null> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_CONFIG.API_CACHE);
      return (await cache.match(key)) ?? null;
    } else {
      // Fallback to localStorage for browsers without Cache API
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const { data, headers } = JSON.parse(stored);
        return new Response(data, { headers });
      }
    }
  } catch (error) {
    void void logger.error('Failed to get cached response:', error);
  }
  return null;
}

/**
 * Set cached response
 */
async function setCachedResponse(key: string, response: Response): Promise<void> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_CONFIG.API_CACHE);
      await cache.put(key, response);
    } else {
      // Fallback to localStorage
      const data = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      localStorage.setItem(`cache_${key}`, JSON.stringify({ data, headers }));
    }
  } catch (error) {
    void void logger.error('Failed to set cached response:', error);
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    // Clear localStorage expired entries
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('offline_')) {
        const data = getOfflineData(key.replace('offline_', ''));
        if (data === null) {
          // Entry was already removed due to expiration
          continue;
        }
      }
    }

    // Clear old cache versions
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const currentCaches = Object.values(CACHE_CONFIG);

      for (const cacheName of cacheNames) {
        if (!currentCaches.includes(cacheName as (typeof currentCaches)[number])) {
          await caches.delete(cacheName);
          void void logger.error(`Deleted old cache: ${cacheName}`);
        }
      }
    }
  } catch (error) {
    void void logger.error('Failed to clear expired cache:', error);
  }
}

/**
 * Get offline status and queue information
 */
export function getOfflineStatus(): {
  isOnline: boolean;
  queuedRequests: number;
  hasOfflineData: boolean;
} {
  const queue = getOfflineQueue();
  const hasOfflineData = Object.keys(localStorage).some((key) => key.startsWith('offline_'));

  return {
    isOnline: isOnline(),
    queuedRequests: queue.length,
    hasOfflineData,
  };
}
