/**
 * Database Query Optimization Utilities
 * 
 * Purpose: Provide utilities to prevent N+1 queries and optimize database performance
 * Dependencies: Prisma
 */

import type { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

export interface QueryOptions {
  enableLogging?: boolean;
  maxBatchSize?: number;
  timeout?: number;
}

export interface BatchLoader<T, K> {
  load(key: K): Promise<T | null>;
  loadMany(keys: K[]): Promise<(T | null)[]>;
  clear(key?: K): void;
  clearAll(): void;
}

/**
 * Generic batch loader to prevent N+1 queries
 * Uses DataLoader pattern for batching and caching
 */
export class PrismaBatchLoader<T, K> implements BatchLoader<T, K> {
  private cache = new Map<string, T>();
  private batchQueue = new Map<string, Promise<T | null>>();
  private options: Required<QueryOptions>;

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<(T | null)[]>,
    options: QueryOptions = {}
  ) {
    this.options = {
      enableLogging: options.enableLogging ?? false,
      maxBatchSize: options.maxBatchSize ?? 100,
      timeout: options.timeout ?? 5000,
    };
  }

  async load(key: K): Promise<T | null> {
    const keyStr = JSON.stringify(key);
    
    // Check cache first
    if (this.cache.has(keyStr)) {
      return this.cache.get(keyStr) ?? null;
    }

    // Check if already queued
    if (this.batchQueue.has(keyStr)) {
      return this.batchQueue.get(keyStr) ?? null;
    }

    // Create batch promise
    const promise = this.createBatchPromise(key);
    this.batchQueue.set(keyStr, promise);
    
    return promise;
  }

  async loadMany(keys: K[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.load(key)));
  }

  private async createBatchPromise(key: K): Promise<T | null> {
    // Wait for next tick to allow batching
    await new Promise(resolve => setImmediate(resolve));
    
    const keyStr = JSON.stringify(key);
    
    // Collect all keys that are pending
    const pendingKeys: K[] = [];
    const pendingPromises: Promise<T | null>[] = [];
    
    for (const [queueKeyStr, promise] of this.batchQueue) {
      if (!this.cache.has(queueKeyStr)) {
        pendingKeys.push(JSON.parse(queueKeyStr));
        pendingPromises.push(promise);
      }
    }

    if (pendingKeys.length === 0) {
      return this.cache.get(keyStr) ?? null;
    }

    try {
      if (this.options.enableLogging) {
        void logger.info(`Batch loading ${pendingKeys.length} items`);
      }

      // Execute batch load
      const results = await this.batchLoadFn(pendingKeys);
      
      // Cache results
      pendingKeys.forEach((k, index) => {
        const resultKeyStr = JSON.stringify(k);
        if (results[index] !== undefined) {
          this.cache.set(resultKeyStr, results[index] as T);
        }
        this.batchQueue.delete(resultKeyStr);
      });

      return this.cache.get(keyStr) ?? null;
    } catch (error) {
      // Clear failed promises from queue
      pendingKeys.forEach(k => {
        this.batchQueue.delete(JSON.stringify(k));
      });
      throw error;
    }
  }

  clear(key?: K): void {
    if (key) {
      const keyStr = JSON.stringify(key);
      this.cache.delete(keyStr);
      this.batchQueue.delete(keyStr);
    } else {
      this.clearAll();
    }
  }

  clearAll(): void {
    this.cache.clear();
    this.batchQueue.clear();
  }
}

/**
 * Optimized customer queries to prevent N+1 issues
 */
export class CustomerQueryOptimizer {
  constructor(private db: PrismaClient) {}

  /**
   * Get customers with their booking counts and spending totals
   * Uses aggregation to avoid fetching all bookings
   */
  async getCustomersWithStats(options: {
    where?: Prisma.CustomerWhereInput;
    take?: number;
    skip?: number;
    includeBookings?: boolean;
    maxBookingsPerCustomer?: number;
  }) {
    const {
      where = {},
      take = 50,
      skip = 0,
      includeBookings = false,
      maxBookingsPerCustomer = 10,
    } = options;

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
          select: {
            id: true,
            createdAt: true,
            preferredDate: true,
            status: true,
            payments: {
              where: { status: 'COMPLETED' },
              select: { amount: true },
            },
          },
        } : false,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    // Get payment totals for each customer in batch
    const customerIds = customers.map(c => c.id);
    const paymentTotals = await this.getCustomerPaymentTotals(customerIds);

    // Combine data efficiently
    return customers.map(customer => {
      const paymentTotal = paymentTotals.get(customer.id) ?? 0;
      // Removed 'as any'. Prisma's inferred type for 'customer' should include '_count'
      // due to the 'include: { _count: { select: { bookings: true } } }' in the query.
      const bookingCount = customer._count.bookings;
      
      let lastVisit: Date | null = null;
      if (includeBookings && customer.bookings && customer.bookings.length > 0) {
        const dates = customer.bookings.map(b => b.preferredDate || b.createdAt);
        lastVisit = dates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
      }

      return {
        ...customer,
        totalAppointments: bookingCount,
        totalSpent: Math.round(paymentTotal * 100) / 100,
        lastVisit,
      };
    });
  }

  /**
   * Get payment totals for multiple customers efficiently
   */
  private async getCustomerPaymentTotals(customerIds: string[]): Promise<Map<string, number>> {
    if (customerIds.length === 0) return new Map();

    const paymentAggregates = await this.db.payment.groupBy({
      by: ['bookingId'],
      where: {
        status: 'COMPLETED',
        booking: {
          customerId: {
            in: customerIds,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get booking to customer mapping
    const bookingIds = paymentAggregates.map(p => p.bookingId).filter((id): id is string => id !== null);
    
    const bookingCustomerMap = await this.db.booking.findMany({
      where: {
        id: {
          in: bookingIds,
        },
        customerId: {
          not: null,
        },
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
}

/**
 * Optimized booking queries
 */
export class BookingQueryOptimizer {
  constructor(private db: PrismaClient) {}

  /**
   * Get bookings with customer and payment data efficiently
   */
  async getBookingsWithRelations(options: {
    where?: Prisma.BookingWhereInput;
    take?: number;
    skip?: number;
    includeCustomer?: boolean;
    includePayments?: boolean;
  }) {
    const {
      where = {},
      take = 50,
      skip = 0,
      includeCustomer = true,
      includePayments = true,
    } = options;

    return this.db.booking.findMany({
      where,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: includeCustomer ? {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        } : false,
        payments: includePayments ? {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        } : false,
      },
    });
  }
}

/**
 * Query performance monitoring
 */

// Define a type for the query statistics data
type QueryStatData = {
  count: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
};

export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private queryStats = new Map<string, QueryStatData>();

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      
      this.recordQueryTime(queryName, duration);
      
      if (duration > 1000) { // Log slow queries
        void logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      void logger.error(`Query failed: ${queryName} (${duration}ms)`, error);
      throw error;
    }
  }

  private recordQueryTime(queryName: string, duration: number): void {
    const existing = this.queryStats.get(queryName);
    
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.minTime = Math.min(existing.minTime, duration);
    } else {
      this.queryStats.set(queryName, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        maxTime: duration,
        minTime: duration,
      });
    }
  }

  getStats(): Record<string, QueryStatData> {
    const stats: Record<string, QueryStatData> = {};
    
    for (const [queryName, data] of this.queryStats) {
      stats[queryName] = { ...data };
    }
    
    return stats;
  }

  reset(): void {
    this.queryStats.clear();
  }
}

// Export singleton instances
export const queryPerformanceMonitor = QueryPerformanceMonitor.getInstance();

/**
 * Factory functions for creating optimized query handlers
 */
export function createCustomerOptimizer(db: PrismaClient): CustomerQueryOptimizer {
  return new CustomerQueryOptimizer(db);
}

export function createBookingOptimizer(db: PrismaClient): BookingQueryOptimizer {
  return new BookingQueryOptimizer(db);
}

export function createBatchLoader<T, K>(
  batchLoadFn: (keys: K[]) => Promise<(T | null)[]>,
  options?: QueryOptions
): PrismaBatchLoader<T, K> {
  return new PrismaBatchLoader(batchLoadFn, options);
}
