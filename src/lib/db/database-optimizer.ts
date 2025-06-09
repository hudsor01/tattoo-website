/**
 * Comprehensive Database Query Optimization System
 * 
 * Purpose: Advanced query optimization, caching, and performance monitoring
 * Dependencies: Prisma, Node.js
 */

import type { PrismaClient, Prisma } from '@prisma/client';
// Removed BookingStatus, PaymentStatus from import.
// Prisma.XxxGetPayload types will infer status field types (e.g., $Enums.BookingStatus or string literals)
// directly from the schema, which might resolve subtle type conflicts.
import { logger } from '@/lib/logger';

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

export interface OptimizationConfig {
  enableQueryLogging?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableCaching?: boolean;
  cacheMaxAge?: number;
  slowQueryThreshold?: number;
  connectionPoolSize?: number;
  queryTimeout?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface QueryMetrics {
  queryName: string;
  executionTime: number;
  recordCount?: number;
  cacheHit?: boolean;
  timestamp: number;
}

export interface PerformanceStats {
  totalQueries: number;
  avgExecutionTime: number;
  slowQueries: number;
  cacheHitRate: number;
  peakExecutionTime: number;
  queriesPerSecond: number;
  topSlowQueries: Array<{
    queryName: string;
    avgTime: number;
    count: number;
  }>;
}

export type CustomerWithStats = Prisma.CustomerGetPayload<{
  include: {
    bookings: {
      select: {
        id: true;
        createdAt: true;
        preferredDate: true;
        status: true;
        payments: {
          select: { amount: true };
          where: { status: 'COMPLETED' };
        };
      };
    };
    _count: {
      select: { bookings: true };
    };
  };
}> & {
  totalAppointments: number;
  totalSpent: number;
  lastVisit: Date | null;
};

type RawDashboardRecentActivityItem = Prisma.BookingGetPayload<{
  select: {
    id: true;
    createdAt: true;
    tattooType: true;
    customer: {
      select: { firstName: true; lastName: true; email: true };
    };
  };
}>;

export type MappedDashboardRecentActivityItem = {
  id: string;
  type: 'booking';
  title: string;
  description: string;
  timestamp: Date;
};

export type DashboardAnalyticsData = {
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  payments: {
    totalRevenue: number;
    totalTransactions: number;
    completedCount: number;
  };
  recentActivity: MappedDashboardRecentActivityItem[];
};

// ============================================================================
// ENHANCED QUERY CACHE
// ============================================================================

export class QueryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize = 1000, defaultTtl = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      if (entries.length > 0) {
        const oldestKey = entries.sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]?.[0];
        if (oldestKey) {
          this.cache.delete(oldestKey);
        }
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttl ?? this.defaultTtl,
      hits: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.hits++;
    this.hitCount++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      void logger.info(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      totalRequests,
    };
  }

  getKeys(): IterableIterator<string> {
    return this.cache.keys();
  }
}

// ============================================================================
// QUERY PERFORMANCE MONITOR
// ============================================================================

export class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private maxMetrics = 10000;
  private queryStats = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
  }>();

  recordQuery(metrics: QueryMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Update query statistics
    const existing = this.queryStats.get(metrics.queryName);
    if (existing) {
      existing.count++;
      existing.totalTime += metrics.executionTime;
      existing.avgTime = existing.totalTime / existing.count;
      existing.maxTime = Math.max(existing.maxTime, metrics.executionTime);
      existing.minTime = Math.min(existing.minTime, metrics.executionTime);
    } else {
      this.queryStats.set(metrics.queryName, {
        count: 1,
        totalTime: metrics.executionTime,
        avgTime: metrics.executionTime,
        maxTime: metrics.executionTime,
        minTime: metrics.executionTime,
      });
    }

    // Log slow queries
    if (metrics.executionTime > 1000) {
      void logger.warn(`Slow query detected: ${metrics.queryName} (${metrics.executionTime}ms)`);
    }
  }

  getPerformanceStats(timeRange?: number): PerformanceStats {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    const totalQueries = relevantMetrics.length;
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const avgExecutionTime = totalQueries > 0 ? totalTime / totalQueries : 0;
    const slowQueries = relevantMetrics.filter(m => m.executionTime > 500).length;
    const cacheHits = relevantMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;
    const peakExecutionTime = Math.max(...relevantMetrics.map(m => m.executionTime), 0);
    
    // Calculate queries per second
    const timeSpan = timeRange ? timeRange / 1000 : 
      (relevantMetrics.length > 0 ? (Date.now() - (relevantMetrics[0]?.timestamp ?? Date.now())) / 1000 : 1);
    const queriesPerSecond = totalQueries / Math.max(timeSpan, 1);

    // Top slow queries
    const topSlowQueries = Array.from(this.queryStats.entries())
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, 10)
      .map(([queryName, stats]) => ({
        queryName,
        avgTime: Math.round(stats.avgTime * 100) / 100,
        count: stats.count,
      }));

    return {
      totalQueries,
      avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
      slowQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      peakExecutionTime,
      queriesPerSecond: Math.round(queriesPerSecond * 100) / 100,
      topSlowQueries,
    };
  }

  reset(): void {
    this.metrics = [];
    this.queryStats.clear();
  }
}

// ============================================================================
// DATABASE OPTIMIZER MAIN CLASS
// ============================================================================

export class DatabaseOptimizer {
  private cache: QueryCache;
  private monitor: QueryPerformanceMonitor;
  private config: Required<OptimizationConfig>;

  constructor(
    private db: PrismaClient,
    config: OptimizationConfig = {}
  ) {
    this.config = {
      enableQueryLogging: config.enableQueryLogging ?? true,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
      enableCaching: config.enableCaching ?? true,
      cacheMaxAge: config.cacheMaxAge ?? 300000, // 5 minutes
      slowQueryThreshold: config.slowQueryThreshold ?? 500, // 500ms
      connectionPoolSize: config.connectionPoolSize ?? 10,
      queryTimeout: config.queryTimeout ?? 30000, // 30 seconds
    };

    this.cache = new QueryCache(1000, this.config.cacheMaxAge);
    this.monitor = new QueryPerformanceMonitor();
  }

  /**
   * Execute a query with optimization, caching, and monitoring
   */
  async optimizedQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    options: {
      cache?: boolean;
      cacheTtl?: number;
      cacheKey?: string;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    const cacheKey = options.cacheKey ?? `${queryName}:${JSON.stringify([queryName, options])}`;
    
    // Check cache first
    if (options.cache !== false && this.config.enableCaching) {
      const cachedResult = this.cache.get<T>(cacheKey);
      if (cachedResult !== null) {
        if (this.config.enablePerformanceMonitoring) {
          this.monitor.recordQuery({
            queryName,
            executionTime: Date.now() - startTime,
            cacheHit: true,
            timestamp: Date.now(),
          });
        }
        return cachedResult;
      }
    }

    // Execute query
    try {
      const result = await this.executeWithTimeout(queryFn, this.config.queryTimeout);
      const executionTime = Date.now() - startTime;

      // Cache result
      if (options.cache !== false && this.config.enableCaching) {
        this.cache.set(cacheKey, result, options.cacheTtl);
      }

      // Record metrics
      if (this.config.enablePerformanceMonitoring) {
        this.monitor.recordQuery({
          queryName,
          executionTime,
          recordCount: Array.isArray(result) ? result.length : 1,
          cacheHit: false,
          timestamp: Date.now(),
        });
      }

      // Log if enabled
      if (this.config.enableQueryLogging) {
        void logger.info(`Query executed: ${queryName} (${executionTime}ms)`);
      }

      return result;
    } catch (error: unknown) {
      void logger.error(`Query failed: ${queryName}`, error);
      throw error;
    }
  }

  /**
   * Optimized customer queries with aggregation
   */
  async getCustomersWithStats(options: {
    where?: Prisma.CustomerWhereInput;
    take?: number;
    skip?: number;
    includeBookings?: boolean;
    maxBookingsPerCustomer?: number;
  } = {}): Promise<CustomerWithStats[]> {
    const {
      where = {},
      take = 50,
      skip = 0,
      includeBookings = false,
      maxBookingsPerCustomer = 10,
    } = options;

    // Define the select clause for bookings to ensure type consistency
    const bookingSelectArgs = {
      id: true,
      createdAt: true,
      preferredDate: true,
      status: true,
      payments: {
        where: { status: 'COMPLETED' as const },
        select: { amount: true },
      },
    } satisfies Prisma.BookingSelect;

    // Define the expected shape of a booking record based on the select arguments
    type SelectedBookingShape = Prisma.BookingGetPayload<{
      select: typeof bookingSelectArgs;
    }>;

    return this.optimizedQuery(
      'customers-with-stats',
      async () => {
        // Get customers with basic info
        const customers = await this.db.customer.findMany({
          where,
          take,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            bookings: includeBookings ? {
              take: maxBookingsPerCustomer,
              orderBy: { createdAt: 'desc' },
              // Use the bookingSelectArgs constant for the select clause
              select: bookingSelectArgs,
            } : false,
            _count: {
              select: { bookings: true },
            },
          },
        });

        // Get payment totals efficiently
        const customerIds = customers.map(c => c.id);
        const paymentTotals = await this.getCustomerPaymentTotals(customerIds);

        return customers.map(customer => {
          const paymentTotal = paymentTotals.get(customer.id) ?? 0;
          const bookingCount = customer._count.bookings; // _count is always selected
          
          let lastVisit: Date | null = null;
          const actualBookingsFromCustomer = customer.bookings; 

          if (actualBookingsFromCustomer && actualBookingsFromCustomer.length > 0) {
            const dates: Date[] = actualBookingsFromCustomer
              .map(b => b.preferredDate || b.createdAt) 
              .filter((d): d is Date => d instanceof Date); 
            if (dates.length > 0) {
              lastVisit = dates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
            }
          }

          // Explicitly map bookings to match CustomerWithStats['bookings'] structure.
          // This is a workaround for potential discrepancies between Prisma's inferred type
          // for `customer.bookings` (from a complex query) and the structure defined
          // in `CustomerWithStats` (derived from a direct Prisma.CustomerGetPayload).
          const mappedBookings: CustomerWithStats['bookings'] = 
            (actualBookingsFromCustomer || []).map((bRaw) => {
              // Assert bRaw to the specific shape we expect from the select clause.
              // Using 'as unknown as SelectedBookingShape' to bypass TypeScript's strict
              // overlap checking for assertions, as we are confident about the runtime shape
              // due to the Prisma select arguments.
              const b = bRaw as unknown as SelectedBookingShape;
              return {
                id: b.id,
                createdAt: b.createdAt,
                preferredDate: b.preferredDate,
                status: b.status, 
                // b.payments is already Array<{amount:number}> due to SelectedBookingShape.
                // No '?? []' needed if SelectedBookingShape correctly types payments as non-nullable array.
                // Prisma's select on a to-many relation typically yields an array (possibly empty).
                payments: b.payments, 
              };
            });
          
          // Deconstruct customer to safely spread its properties, then override bookings.
          const { bookings, _count, ...customerBaseFields } = customer;

          return {
            ...customerBaseFields,
            _count: customer._count, // Pass through _count as it's correctly typed by findMany.
            bookings: mappedBookings, // Use the explicitly mapped and typed bookings.
            totalAppointments: bookingCount,
            totalSpent: Math.round(paymentTotal * 100) / 100,
            lastVisit,
          };
        });
      },
      {
        cache: true,
        cacheTtl: 300000, // 5 minutes
        cacheKey: `customers-stats:${JSON.stringify({ where, take, skip, includeBookings })}`,
      }
    );
  }

  /**
   * Optimized dashboard analytics
   */
  async getDashboardAnalytics(dateRange: { startDate: Date; endDate: Date }): Promise<DashboardAnalyticsData> {
    return this.optimizedQuery(
      'dashboard-analytics',
      async () => {
        const { startDate, endDate } = dateRange;

        // Parallel execution of all analytics queries
        const [
          bookingStats,
          customerStats,
          paymentStats,
          recentActivity
        ] = await Promise.all([
          // Booking statistics
          this.db.booking.groupBy({
            by: ['status'],
            _count: { id: true },
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
          }),

          // Customer statistics
          Promise.all([
            this.db.customer.count(),
            this.db.customer.count({
              where: {
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
            }),
          ]),

          // Payment statistics
          this.db.payment.groupBy({
            by: ['status'],
            _sum: { amount: true },
            _count: { id: true },
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
          }),

          // Recent activity (limited to prevent memory issues)
          // Query now uses 'select' to match RawDashboardRecentActivityItem definition
          this.db.booking.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
            select: { // Changed from 'include'
              id: true,
              createdAt: true,
              tattooType: true, // Assuming tattooType is a field on Booking model
              customer: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          }),
        ]);

        const [totalCustomers, newCustomersThisMonth] = customerStats;

        return {
          bookings: {
            total: bookingStats.reduce((sum, stat) => sum + stat._count.id, 0),
            completed: bookingStats.find(s => s.status === 'COMPLETED')?._count.id ?? 0,
            pending: bookingStats.find(s => s.status === 'PENDING')?._count.id ?? 0,
            cancelled: bookingStats.find(s => s.status === 'CANCELLED')?._count.id ?? 0,
          },
          customers: {
            total: totalCustomers,
            newThisMonth: newCustomersThisMonth,
          },
          payments: {
            totalRevenue: paymentStats.find(s => s.status === 'COMPLETED')?._sum.amount ?? 0,
            totalTransactions: paymentStats.reduce((sum, stat) => sum + stat._count.id, 0),
            completedCount: paymentStats.find(s => s.status === 'COMPLETED')?._count.id ?? 0,
          },
          recentActivity: recentActivity.map((booking: RawDashboardRecentActivityItem) => ({
            id: booking.id,
            type: 'booking',
            title: 'New Booking',
            description: `${booking.customer?.firstName} ${booking.customer?.lastName} - ${booking.tattooType}`,
            timestamp: booking.createdAt,
          })),
        };
      },
      {
        cache: true,
        cacheTtl: 300000, // 5 minutes
        cacheKey: `dashboard-analytics:${dateRange.startDate.toISOString()}-${dateRange.endDate.toISOString()}`,
      }
    );
  }

  /**
   * Get customer payment totals efficiently
   */
  private async getCustomerPaymentTotals(customerIds: string[]): Promise<Map<string, number>> {
    if (customerIds.length === 0) return new Map();

    const paymentAggregates = await this.db.payment.groupBy({
      by: ['bookingId'],
      where: {
        status: 'COMPLETED',
        booking: {
          customerId: { in: customerIds },
        },
      },
      _sum: { amount: true },
    });

    // Get booking to customer mapping
    const bookingIds = paymentAggregates.map(p => p.bookingId).filter((id): id is string => id !== null);
    
    const bookingCustomerMap = await this.db.booking.findMany({
      where: {
        id: { in: bookingIds },
        customerId: { not: null },
      },
      select: {
        id: true,
        customerId: true,
      },
    });

    // Build customer total map
    const customerTotals = new Map<string, number>();
    
    paymentAggregates.forEach(aggregate => {
      const booking = bookingCustomerMap.find(b => b.id === aggregate.bookingId);
      if (booking?.customerId) {
        const currentTotal = customerTotals.get(booking.customerId) ?? 0;
        customerTotals.set(booking.customerId, currentTotal + (aggregate._sum.amount ?? 0));
      }
    });

    return customerTotals;
  }

  /**
   * Execute query with timeout protection
   */
  private async executeWithTimeout<T>(
    queryFn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Invalidate cache for specific patterns
   */
  invalidateCache(pattern?: string): void {
    if (pattern) {
      // Simple pattern matching - could be enhanced with regex
      const keysToDelete: string[] = [];
      for (const key of this.cache.getKeys()) { 
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      // Call delete on the QueryCache instance, not the internal map directly
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear(); // Calls QueryCache.clear()
    }
  }

  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats(timeRange?: number): {
    queries: PerformanceStats;
    cache: ReturnType<QueryCache['getStats']>;
    database: {
      connectionCount: number;
      activeConnections: number;
    };
  } {
    return {
      queries: this.monitor.getPerformanceStats(timeRange),
      cache: this.cache.getStats(),
      database: {
        connectionCount: 10, // Would need to be implemented with actual connection pool
        activeConnections: 5, // Would need to be implemented with actual connection pool
      },
    };
  }

  /**
   * Health check for the optimizer
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      database: boolean;
      cache: boolean;
      monitoring: boolean;
      avgResponseTime: number;
    };
  }> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await this.db.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;
      
      const stats = this.getPerformanceStats(300000); // Last 5 minutes
      
      const status = dbResponseTime > 1000 || stats.queries.avgExecutionTime > 500
        ? 'degraded'
        : 'healthy';

      return {
        status,
        details: {
          database: dbResponseTime < 2000,
          cache: stats.cache.hitRate > 70,
          monitoring: stats.queries.totalQueries >= 0,
          avgResponseTime: Math.round(dbResponseTime),
        },
      };
    } catch (error: unknown) {
      void logger.error('Database optimizer health check failed:', error);
      return {
        status: 'unhealthy',
        details: {
          database: false,
          cache: false,
          monitoring: false,
          avgResponseTime: 0,
        },
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE & FACTORY
// ============================================================================

let optimizerInstance: DatabaseOptimizer | null = null;

export function createDatabaseOptimizer(
  db: PrismaClient,
  config?: OptimizationConfig
): DatabaseOptimizer {
  optimizerInstance ??= new DatabaseOptimizer(db, config);
  return optimizerInstance;
}

export function getDatabaseOptimizer(): DatabaseOptimizer | null {
  return optimizerInstance;
}
