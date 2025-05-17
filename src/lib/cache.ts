/**
 * Enhanced Cache Implementation
 * 
 * A unified cache service that provides:
 * - LRU eviction policy
 * - Memory usage limits
 * - Automatic cleanup of expired entries
 * - Cache statistics
 * - Pattern-based cache invalidation
 * - Improved type safety
 */

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  cleanupInterval: number;
  enableStats: boolean;
}

export interface CacheEntry<T> {
  data: T;
  expires: number;
  lastAccessed: number;
  size: number;
  key: string; // Original cache key for pattern matching
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  expirations: number;
  memoryUsage: number;
  hitRate: number;
  keys: string[];
}

/**
 * Enhanced cache implementation with:
 * - LRU eviction policy
 * - Memory usage limits
 * - Automatic cleanup of expired entries
 * - Cache statistics
 * - Pattern-based invalidation
 * - Improved type safety
 */
class EnhancedCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  // Statistics
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expirations = 0;
  private memoryUsage = 0;

  /**
   * Create a new EnhancedCache instance
   * @param config - Cache configuration options
   */
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: config?.maxSize ?? 1000,
      defaultTtl: config?.defaultTtl ?? 300,
      cleanupInterval: config?.cleanupInterval ?? 60000,
      enableStats: config?.enableStats ?? true,
    };

    // Start the cleanup interval
    this.startCleanupTimer();
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      if (this.config.enableStats) {
        this.misses++;
      }
      return null;
    }

    // Check if entry has expired
    if (entry.expires < Date.now()) {
      this.delete(key);
      if (this.config.enableStats) {
        this.expirations++;
        this.misses++;
      }
      return null;
    }

    // Update last accessed time for LRU
    entry.lastAccessed = Date.now();

    if (this.config.enableStats) {
      this.hits++;
    }

    return entry.data as T;
  }

  /**
   * Set a value in the cache with a specific TTL
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttlSeconds - Time to live in seconds (defaults to config default)
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ?? this.config.defaultTtl;
    const expires = Date.now() + ttl * 1000;
    const size = this.estimateSize(data);

    // If we already have this key, update memory usage calculation
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.memoryUsage -= oldEntry.size;
    }

    const entry: CacheEntry<unknown> = {
      data,
      expires,
      lastAccessed: Date.now(),
      size,
      key,
    };

    this.cache.set(key, entry);
    this.memoryUsage += size;

    // Enforce size limits with LRU eviction
    this.enforceSizeLimit();
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - The cache key
   * @returns true if the key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check expiration
    if (entry.expires < Date.now()) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a value from the cache
   * @param key - The cache key
   * @returns true if an item was found and removed, false otherwise
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.memoryUsage -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Invalidate all cache entries that match a pattern
   * @param pattern String or regex pattern to match against cache keys
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    
    // Find all keys that match the pattern
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key) || regex.test(entry.key)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete all matching keys
    for (const key of keysToDelete) {
      this.delete(key);
    }
  }

  /**
   * Clear all items from the cache
   */
  invalidateAll(): void {
    this.cache.clear();
    this.memoryUsage = 0;
  }

  /**
   * Get current cache statistics
   * Only available if enableStats is true
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      expirations: this.expirations,
      memoryUsage: this.memoryUsage,
      hitRate: this.getTotalRequests() > 0 ? this.hits / this.getTotalRequests() : 0,
      keys: this.keys(),
    };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Reset the cache statistics
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  /**
   * Stop the cleanup timer
   * Important to call this when the app is shutting down
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Remove all expired cache entries
   * @returns Number of entries removed
   */
  purgeExpired(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.delete(key);
        removed++;
        if (this.config.enableStats) {
          this.expirations++;
        }
      }
    }
    
    return removed;
  }

  // Private methods

  /**
   * Start the cleanup timer to periodically remove expired items
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.purgeExpired();
    }, this.config.cleanupInterval);

    // Ensure the timer doesn't prevent the process from exiting
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Enforce the cache size limit by removing least recently used items
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // Sort entries by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed,
    );

    // Remove oldest entries until we're under the limit
    while (this.cache.size > this.config.maxSize) {
      const [key] = entries.shift()!;
      this.delete(key);
      if (this.config.enableStats) {
        this.evictions++;
      }
    }
  }

  /**
   * Estimate the size of an object in bytes (approximate)
   */
  private estimateSize(obj: unknown): number {
    if (obj === null || obj === undefined) return 0;

    const type = typeof obj;

    if (type === 'boolean') return 4;
    if (type === 'number') return 8;
    if (type === 'string') return (obj as string).length * 2;

    if (type === 'object') {
      if (Array.isArray(obj)) {
        return (obj as unknown[]).reduce<number>((sum, item) => sum + this.estimateSize(item), 0);
      }

      // For objects, estimate by summing key lengths and value sizes
      let size = 0;
      for (const [key, value] of Object.entries(obj)) {
        size += key.length * 2; // Key size
        size += this.estimateSize(value); // Value size
      }
      return size;
    }

    // Default size for other types
    return 8;
  }

  /**
   * Get total number of cache requests (hits + misses)
   */
  private getTotalRequests(): number {
    return this.hits + this.misses;
  }
}

// Default cache configuration
const defaultConfig: Partial<CacheConfig> = {
  maxSize: 1000,
  defaultTtl: 300, // 5 minutes
  cleanupInterval: 60000, // 1 minute
  enableStats: process.env.NODE_ENV !== 'production',
};

// Create a singleton instance
export const cache = new EnhancedCache(defaultConfig);

// Export default for easier imports
export default cache;