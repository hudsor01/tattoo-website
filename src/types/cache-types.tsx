/**
 * Cache related types
 */

/**
 * Configuration options for the EnhancedCache
 */
export interface CacheConfig {
  /** Maximum number of items to store in the cache (default: 1000) */
  maxSize: number;
  /** Default TTL in seconds (default: 5 minutes) */
  defaultTtl: number;
  /** How often to clean up expired entries in ms (default: 60 seconds) */
  cleanupInterval: number;
  /** Whether to enable cache statistics (default: true) */
  enableStats: boolean;
}

/**
 * Entry in the cache
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Expiration timestamp in ms since epoch */
  expires: number;
  /** Last accessed timestamp for LRU tracking */
  lastAccessed: number;
  /** Size estimation in bytes (approximate) */
  size: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of items currently in the cache */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Number of items evicted due to size constraints */
  evictions: number;
  /** Number of items removed due to expiration */
  expirations: number;
  /** Approximate memory usage in bytes */
  memoryUsage: number;
  /** Cache hit rate (hits / (hits + misses)) */
  hitRate: number;
}
