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
// Import the Prisma client
import { PrismaClient } from '@prisma/client';
// Import live analytics updates
import { 
  liveAnalyticsSubscription, 
  emitAnalyticsEvent, 
  getCurrentStats, 
  getServerStatus 
} from './analytics-router/live-updates';

// Use the singleton instance from the global scope
const prisma = new PrismaClient();

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
    // Get current day's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Count unique visitors (by sessionId)
    const uniqueVisitors = await prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
        sessionId: {
          not: null,
        },
      },
    });
    
    // Count page views
    const pageViews = await prisma.analyticsEvent.count({
      where: {
        category: 'page_view',
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Count bookings
    const bookings = await prisma.analyticsEvent.count({
      where: {
        category: 'booking',
        action: 'complete',
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Count conversions
    const conversions = await prisma.analyticsEvent.count({
      where: {
        category: 'conversion',
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    
    // Calculate conversion rate
    const visitors = uniqueVisitors.length;
    const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
    
    return {
      visitors,
      pageViews,
      conversionRate,
      bookings,
    };
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
      
      // Get all events in the date range
      const events = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });
      
      // Group events by day or specified period
      const groupedStats = groupEventsByPeriod(events, input.period, startDate, endDate);
      
      // Calculate totals
      const totalVisitors = new Set(events.filter((e) => e.sessionId).map((e) => e.sessionId)).size;
      const totalPageViews = events.filter((e) => e.category === 'page_view').length;
      const totalBookings = events.filter((e) => e.category === 'booking' && e.action === 'complete').length;
      const totalConversions = events.filter((e) => e.category === 'conversion').length;
      const totalConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
      
      return {
        dailyStats: groupedStats,
        totals: {
          visitors: totalVisitors,
          pageViews: totalPageViews,
          conversionRate: totalConversionRate,
          bookings: totalBookings
        }
      };
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

/**
 * Get current live stats data
 */
async function getLiveStatsData(): Promise<LiveStats> {
  // Get current day's data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Count unique visitors (by sessionId)
  const uniqueVisitors = await prisma.analyticsEvent.groupBy({
    by: ['sessionId'],
    where: {
      timestamp: {
        gte: today,
        lt: tomorrow,
      },
      sessionId: {
        not: null,
      },
    },
  });
  
  // Count page views
  const pageViews = await prisma.analyticsEvent.count({
    where: {
      category: 'page_view',
      timestamp: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  
  // Count bookings
  const bookings = await prisma.analyticsEvent.count({
    where: {
      category: 'booking',
      action: 'complete',
      timestamp: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  
  // Count conversions
  const conversions = await prisma.analyticsEvent.count({
    where: {
      category: 'conversion',
      timestamp: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  
  // Calculate conversion rate
  const visitors = uniqueVisitors.length;
  const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
  
  return {
    visitors,
    pageViews,
    conversionRate,
    bookings,
  };
}

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

/**
 * Group events by time period
 */
interface AnalyticsEvent {
  timestamp: Date;
  sessionId?: string | null;
  category: string;
  action: string;
}

interface PeriodStats {
  date: string;
  visitors: number;
  pageViews: number;
  conversionRate: number;
  bookings: number;
}

function groupEventsByPeriod(
  events: AnalyticsEvent[],
  period: AnalyticsTimePeriod,
  startDate: Date,
  endDate: Date
): PeriodStats[] {
  const result: PeriodStats[] = [];
  
  // Create date periods based on the selected period type
  const periods = generateDatePeriods(startDate, endDate, period);
  
  // Initialize stats for each period
  periods.forEach(({ start, end, label }) => {
    // Filter events for this period
    const periodEvents = events.filter(
      event => event.timestamp >= start && event.timestamp < end
    );
    
    // Count unique visitors
    const visitors = new Set(
      periodEvents.filter(e => e.sessionId).map(e => e.sessionId)
    ).size;
    
    // Count page views
    const pageViews = periodEvents.filter(e => e.category === 'page_view').length;
    
    // Count bookings
    const bookings = periodEvents.filter(
      e => e.category === 'booking' && e.action === 'complete'
    ).length;
    
    // Count conversions
    const conversions = periodEvents.filter(e => e.category === 'conversion').length;
    
    // Calculate conversion rate
    const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
    
    result.push({
      date: label,
      visitors,
      pageViews,
      conversionRate,
      bookings,
    });
  });
  
  return result;
}

/**
 * Generate date periods based on period type
 */
function generateDatePeriods(
  startDate: Date,
  endDate: Date,
  periodType: AnalyticsTimePeriod
) {
  const periods: { start: Date; end: Date; label: string }[] = [];
  let current = new Date(startDate);
  
  while (current < endDate) {
    const start = new Date(current);
    let end: Date;
    let label: string;
    
    switch (periodType) {
      case AnalyticsTimePeriod.DAY:
        end = new Date(current);
        end.setDate(end.getDate() + 1);
        label = start.toISOString().split('T')[0];
        break;
        
      case AnalyticsTimePeriod.WEEK:
        end = new Date(current);
        end.setDate(end.getDate() + 7);
        label = `${start.toISOString().split('T')[0]} - ${
          new Date(end.getTime() - 1).toISOString().split('T')[0]
        }`;
        break;
        
      case AnalyticsTimePeriod.MONTH:
        end = new Date(current);
        end.setMonth(end.getMonth() + 1);
        label = `${start.toLocaleString('default', { month: 'short' }) || ''} ${start.getFullYear()}`;
        break;
        
      case AnalyticsTimePeriod.QUARTER: {
        end = new Date(current);
        end.setMonth(end.getMonth() + 3);
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        label = `Q${quarter} ${start.getFullYear()}`;
        break;
      }
        
      case AnalyticsTimePeriod.YEAR:
        end = new Date(current);
        end.setFullYear(end.getFullYear() + 1);
        label = start.getFullYear().toString();
        break;
        
      default:
        end = new Date(current);
        end.setDate(end.getDate() + 1);
        label = start.toISOString().split('T')[0];
    }
    
    // Ensure we don't go beyond the end date
    if (end > endDate) {
      end = new Date(endDate);
    }
    
    periods.push({ start, end, label });
    current = end;
  }
  
  return periods;
}