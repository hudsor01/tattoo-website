import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { observable } from '@trpc/server/observable';
import { type EventEmitter } from 'events';
import {
  AnalyticsEventSchema,
  PageViewEventSchema,
  InteractionEventSchema,
  BookingEventSchema,
  GalleryEventSchema,
  ConversionEventSchema,
  ErrorEventSchema,
  AnalyticsFilterSchema,
  type AnalyticsEventType,
  type PageViewEventType,
  type InteractionEventType,
  type BookingEventType,
  type GalleryEventType,
  type ConversionEventType,
  type ErrorEventType,
} from './types';

/**
 * Analytics Router for both regular tracking and live updates
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
   * Track a generic analytics event
   */
  track: publicProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking event:', input);
      return { success: true, eventId: `evt_${Date.now()}` };
    }),

  /**
   * Track a page view event
   */
  trackPageView: publicProcedure
    .input(PageViewEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking page view:', input);
      return { success: true, eventId: `pv_${Date.now()}` };
    }),

  /**
   * Track an interaction event
   */
  trackInteraction: publicProcedure
    .input(InteractionEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking interaction:', input);
      return { success: true, eventId: `int_${Date.now()}` };
    }),

  /**
   * Track a booking event
   */
  trackBooking: publicProcedure
    .input(BookingEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking booking event:', input);
      return { success: true, eventId: `book_${Date.now()}` };
    }),

  /**
   * Track a gallery event
   */
  trackGallery: publicProcedure
    .input(GalleryEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking gallery event:', input);
      return { success: true, eventId: `gal_${Date.now()}` };
    }),

  /**
   * Track a conversion event
   */
  trackConversion: publicProcedure
    .input(ConversionEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database
      console.log('Tracking conversion:', input);
      return { success: true, eventId: `conv_${Date.now()}` };
    }),

  /**
   * Track an error event
   */
  trackError: publicProcedure
    .input(ErrorEventSchema)
    .mutation(async ({ input }) => {
      // In production, save to database/error tracking service
      console.error('Tracking error:', input);
      return { success: true, eventId: `err_${Date.now()}` };
    }),

  /**
   * Get analytics summary for a given time period
   */
  getSummary: publicProcedure
    .input(
      z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input }) => {
      // Mock implementation - in production, query from database
      return {
        totalEvents: 1234,
        eventsByCategory: {
          page_view: 800,
          interaction: 300,
          booking: 100,
          gallery: 34,
        },
        eventsByAction: {
          view: 500,
          click: 200,
          scroll: 100,
          submit: 34,
        },
        topPages: [
          { path: '/', count: 300 },
          { path: '/gallery', count: 200 },
          { path: '/booking', count: 100 },
        ],
        deviceBreakdown: {
          desktop: 600,
          mobile: 400,
          tablet: 234,
        },
        conversionRate: 3.5,
        averageSessionDuration: 240,
        bounceRate: 35,
      };
    }),

  /**
   * Get top performing designs
   */
  getTopDesigns: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      // Mock implementation - in production, query from database
      return {
        topDesigns: Array.from({ length: input.limit }).map((_, i) => ({
          designId: `design_${i + 1}`,
          designName: `Design ${i + 1}`,
          views: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 100),
          likes: Math.floor(Math.random() * 200),
          appointments: Math.floor(Math.random() * 50),
        })),
      };
    }),

  /**
   * Get current analytics data (legacy)
   */
  getLiveStats: publicProcedure.query(async () => {
    return generateMockStats();
  }),
  
  /**
   * Get analytics data for a specific date range (legacy)
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
   * Subscribe to live analytics updates (legacy)
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