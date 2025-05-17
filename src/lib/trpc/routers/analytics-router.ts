import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { observable } from '@trpc/server/observable';
import { type EventEmitter } from 'events';

/**
 * Analytics Router for both regular and live updates
 */

export interface LiveStats {
  visitors: number;
  pageViews: number;
  conversionRate: number;
  bookings: number;
}

// Create an event emitter for live updates
const analyticsEventEmitter = new EventEmitter();

// Mock data generator for testing
function generateMockStats(): LiveStats {
  return {
    visitors: Math.floor(Math.random() * 100),
    pageViews: Math.floor(Math.random() * 300),
    conversionRate: Math.random() * 5,
    bookings: Math.floor(Math.random() * 10)
  };
}

// Start a mock update interval
let mockInterval: NodeJS.Timeout | null = null;
function startMockUpdates() {
  if (mockInterval) return;
  
  mockInterval = setInterval(() => {
    analyticsEventEmitter.emit('update', generateMockStats());
  }, 5000);
}

// Stop the mock updates when server shuts down
process.on('SIGTERM', () => {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
});

export const analyticsRouter = router({
  /**
   * Get current analytics data
   */
  getLiveStats: publicProcedure.query(async () => {
    return generateMockStats();
  }),
  
  /**
   * Get analytics data for a specific date range
   */
  getAnalyticsByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Placeholder implementation - in production this would query a database
      return {
        dailyStats: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 100),
          pageViews: Math.floor(Math.random() * 300),
          conversionRate: Math.random() * 5,
          bookings: Math.floor(Math.random() * 10),
        })),
        totals: {
          visitors: 487,
          pageViews: 1245,
          conversionRate: 3.7,
          bookings: 18
        }
      };
    }),
  
  /**
   * Subscribe to live analytics updates
   */
  onLiveUpdate: publicProcedure.subscription(() => {
    // Ensure the mock updates are running
    startMockUpdates();
    
    return observable<LiveStats>((emit) => {
      const onUpdate = (data: LiveStats) => {
        emit.next(data);
      };
      
      // Handle the update event
      analyticsEventEmitter.on('update', onUpdate);
      
      // Clean up when unsubscribed
      return () => {
        analyticsEventEmitter.off('update', onUpdate);
      };
    });
  }),
});