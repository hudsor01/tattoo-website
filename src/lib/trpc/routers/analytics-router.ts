import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import {
  AnalyticsEventSchema,
  PageViewEventSchema,
  InteractionEventSchema,
  BookingEventSchema,
  GalleryEventSchema,
  ConversionEventSchema,
  ErrorEventSchema,
  AnalyticsFilterSchema,
  AnalyticsTimePeriod
} from '@/types/analytics-types';
import { 
  storeAnalyticsEvent, 
  getAnalyticsSummary, 
  getTopDesigns, 
  queryAnalyticsEvents,
  getBookingFunnelAnalytics
} from './db';
// Import analytics database utilities
import { 
  getLiveStatsData,
  getAnalyticsByPeriod,
  getDateRangeForPeriod,
  prisma 
} from '@/lib/db/analytics-queries';
// Import live analytics updates
import { 
  liveAnalyticsSubscription, 
  emitAnalyticsEvent, 
  getCurrentStats, 
  getServerStatus 
} from './analytics-router/live-updates';

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

// Set maximum listeners to avoid memory leaks
analyticsEventEmitter.setMaxListeners(100);

export const analyticsRouter = router({
  /**
   * Live analytics procedures
   */
  liveAnalyticsSubscription,
  emitAnalyticsEvent,
  getCurrentStats,
  getServerStatus,

  /**
   * Track a generic analytics event
   */
  trackEvent: publicProcedure
    .input(AnalyticsEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('event', input);
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track a page view event
   */
  trackPageView: publicProcedure
    .input(PageViewEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('pageView', input);
      
      // Update live stats
      updateLiveStats();
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track an interaction event
   */
  trackInteraction: publicProcedure
    .input(InteractionEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('interaction', input);
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track a booking event
   */
  trackBooking: publicProcedure
    .input(BookingEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('booking', input);
      
      // Update live stats if this is a completed booking
      if (input.action === 'complete') {
        updateLiveStats();
      }
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track a gallery event
   */
  trackGallery: publicProcedure
    .input(GalleryEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('gallery', input);
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track a conversion event
   */
  trackConversion: publicProcedure
    .input(ConversionEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('conversion', input);
      
      // Update live stats
      updateLiveStats();
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Track an error event
   */
  trackError: publicProcedure
    .input(ErrorEventSchema)
    .mutation(async ({ input }) => {
      const storedEvent = await storeAnalyticsEvent(input);
      
      // Emit the event for live subscribers
      analyticsEventEmitter.emit('error', input);
      
      return { 
        success: true, 
        eventId: storedEvent.id 
      };
    }),

  /**
   * Query analytics events with filtering
   */
  queryEvents: publicProcedure
    .input(AnalyticsFilterSchema)
    .query(async ({ input }) => {
      return queryAnalyticsEvents(input);
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
      const { startDate, endDate } = input;
      return getAnalyticsSummary(startDate, endDate);
    }),

  /**
   * Get booking funnel analytics
   */
  getBookingFunnel: publicProcedure
    .input(
      z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;
      return getBookingFunnelAnalytics(startDate, endDate);
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
      const { limit } = input;
      return getTopDesigns(limit);
    }),

  /**
   * Get current live analytics data
   */
  getLiveStats: publicProcedure.query(async () => {
    // Use the standardized query utility
    return getLiveStatsData();
  }),
  
  /**
   * Get analytics data for a specific date range
   */
  getAnalyticsByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        period: z.nativeEnum(AnalyticsTimePeriod).default(AnalyticsTimePeriod.DAY),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Ensure start date is before end date
      if (startDate > endDate) {
        throw new Error('Start date must be before end date');
      }
      
      // Use standardized query pattern
      return getAnalyticsByPeriod(startDate, endDate, input.period);
    }),
  
  /**
   * Subscribe to live analytics updates
   */
  onLiveUpdate: publicProcedure.subscription(() => {
    return observable<LiveStats>((emit) => {
      const onUpdate = (data: LiveStats) => {
        emit.next(data);
      };
      
      // Send initial data
      getLiveStatsData().then(data => {
        emit.next(data);
      });
      
      // Handle the update event
      analyticsEventEmitter.on('update', onUpdate);
      
      // Clean up when unsubscribed
      return () => {
        analyticsEventEmitter.off('update', onUpdate);
      };
    });
  }),
});

// The getLiveStatsData function has been moved to src/lib/db/analytics-queries.ts

/**
 * Update live stats and emit to subscribers
 */
async function updateLiveStats() {
  try {
    const stats = await getLiveStatsData();
    analyticsEventEmitter.emit('update', stats);
  } catch (error) {
    console.error('Error updating live stats:', error);
  }
}

// These functions have been moved to src/lib/db/analytics-queries.ts
// - generateDatePeriods
// - groupEventsByPeriod
// - Related interfaces and helper functions