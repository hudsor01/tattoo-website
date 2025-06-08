import { logger } from "@/lib/logger";
/**
 * Analytics Caching Layer
 * Implements intelligent caching for frequently accessed analytics data
 */

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  hits: number;
  ttl: number;
  key: string;
}

export interface CacheStats {
  totalEntries: number;
  memoryUsage: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  avgEntrySize: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  enableStats?: boolean;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };
  
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly enableStats: boolean;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.defaultTTL = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.enableStats = options.enableStats ?? true;
    
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Get value from cache
   */
  public get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.enableStats) this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.enableStats) this.stats.misses++;
      return null;
    }

    // Update hit counter
    entry.hits++;
    if (this.enableStats) this.stats.hits++;
    
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  public set<T = unknown>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl ?? this.defaultTTL;

    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      hits: 0,
      ttl: entryTTL,
      key,
    };

    this.cache.set(key, entry);
    if (this.enableStats) this.stats.sets++;
  }

  /**
   * Delete specific key from cache
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted && this.enableStats) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists and is not expired
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get or set pattern (cache-aside)
   */
  public async getOrSet<T = unknown>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate new data
    const data = await factory();
    
    // Store in cache
    this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Invalidate cache entries by pattern
   */
  public invalidatePattern(pattern: string | RegExp): number {
    let deleted = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    if (this.enableStats) {
      this.stats.deletes += deleted;
    }
    
    return deleted;
  }

  /**
   * Warm up cache with frequently accessed data
   */
  public async warmUp(entries: Array<{ key: string; factory: () => Promise<unknown>; ttl?: number }>): Promise<void> {
    const promises = entries.map(async ({ key, factory, ttl }) => {
      try {
        const data = await factory();
        this.set(key, data, ttl);
      } catch (error) {
        void logger.warn(`Failed to warm up cache for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    if (!this.enableStats) {
      return {
        totalEntries: this.cache.size,
        memoryUsage: 0,
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0,
        avgEntrySize: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }

    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    const memoryUsage = JSON.stringify(Object.fromEntries(this.cache)).length;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    return {
      totalEntries: this.cache.size,
      memoryUsage,
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      avgEntrySize: entries.length > 0 ? memoryUsage / entries.length : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => now - e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => now - e.timestamp)) : 0,
    };
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        if (this.enableStats) this.stats.deletes++;
      }
    }
  }

  /**
   * Evict least recently used entries when cache is full
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    // Find entry with lowest hits and oldest timestamp
    let leastUsedKey = '';
    let leastUsedScore = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // Score based on hits and age (lower is worse)
      const age = Date.now() - entry.timestamp;
      const score = entry.hits - (age / 1000); // Hits minus age in seconds
      
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      if (this.enableStats) this.stats.deletes++;
    }
  }

  /**
   * Destroy cache and cleanup
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Pre-defined cache instances for different data types
export const analyticsDataCache = new AnalyticsCache({
  ttl: 5 * 60 * 1000, // 5 minutes for analytics data
  maxSize: 500,
});

export const aggregationCache = new AnalyticsCache({
  ttl: 15 * 60 * 1000, // 15 minutes for aggregated data
  maxSize: 200,
});

export const healthDataCache = new AnalyticsCache({
  ttl: 30 * 1000, // 30 seconds for health data
  maxSize: 50,
});

// Cache key generators
export const CacheKeys = {
  // Analytics event queries
  eventsByType: (type: string, startDate: string, endDate: string) => 
    `events:type:${type}:${startDate}:${endDate}`,
  
  eventsByService: (serviceId: string, startDate: string, endDate: string) => 
    `events:service:${serviceId}:${startDate}:${endDate}`,
  
  // Aggregated metrics
  conversionMetrics: (period: string) => 
    `metrics:conversion:${period}`,
  
  serviceMetrics: (serviceId: string, period: string) => 
    `metrics:service:${serviceId}:${period}`,
  
  funnelData: (period: string) => 
    `funnel:${period}`,
  
  // Health and system data
  healthStatus: () => 'health:status',
  systemMetrics: () => 'system:metrics',
  batchStats: () => 'batch:stats',
  
  // User-specific data
  userJourney: (userId: string, sessionId: string) => 
    `journey:${userId}:${sessionId}`,
};

// Export singleton instances
export { AnalyticsCache };

// Cleanup function for graceful shutdown
export function destroyCaches(): void {
  analyticsDataCache.destroy();
  aggregationCache.destroy();
  healthDataCache.destroy();
}
