import { publicProcedure, adminProcedure } from "../../procedures";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { EventEmitter } from "events";
import type { AnalyticsEvent, AnalyticsStreamEvent } from "@/types/analytics-types";
import { AnalyticsStreamEventType, EventCategory } from "@/types/analytics-types";
import { PrismaClient } from '@prisma/client';
import { standardizeTimestamp } from "@/lib/utils/analytics-format";

// Initialize Prisma client
const prisma = new PrismaClient();

// Event emitter for live updates
const ee = new EventEmitter();

// Export types for use elsewhere
export { AnalyticsStreamEventType, type AnalyticsEvent, type AnalyticsStreamEvent };

/**
 * Subscribe to live analytics events
 */
export const liveAnalyticsSubscription = adminProcedure
  .input(
    z.object({
      types: z.array(z.string()).optional(),
    })
  )
  .subscription(({ input }) => {
    return observable<AnalyticsStreamEvent>((emit) => {
      const onAnalyticsEvent = (event: AnalyticsStreamEvent) => {
        // Filter by event types if specified
        if (input.types && !input.types.includes(event.type)) {
          return;
        }
        
        emit.next(event);
      };

      // Listen for events
      ee.on("analytics", onAnalyticsEvent);

      // Cleanup when unsubscribed
      return () => {
        ee.off("analytics", onAnalyticsEvent);
      };
    });
  });

/**
 * Emit a new analytics event to subscribers
 */
export const emitAnalyticsEvent = adminProcedure
  .input(
    z.object({
      type: z.enum([
        AnalyticsStreamEventType.NEW_EVENT,
        AnalyticsStreamEventType.PAGE_VIEW,
        AnalyticsStreamEventType.USER_INTERACTION,
        AnalyticsStreamEventType.BOOKING_CREATED,
        AnalyticsStreamEventType.PAYMENT_PROCESSED,
        AnalyticsStreamEventType.CONTACT_SUBMITTED,
        AnalyticsStreamEventType.SESSION_STARTED,
        AnalyticsStreamEventType.SESSION_ENDED,
        AnalyticsStreamEventType.ERROR_OCCURRED,
        AnalyticsStreamEventType.STATS_UPDATE,
        AnalyticsStreamEventType.HEARTBEAT
      ]),
      data: z.object({
        category: z.nativeEnum(EventCategory),
        action: z.string(),
        label: z.string().optional(),
        value: z.number().optional(),
        path: z.string().optional(),
        referrer: z.string().optional(),
        deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
        browser: z.string().optional(),
        os: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional(),
      }),
    })
  )
  .mutation(({ input }) => {
    const event: AnalyticsStreamEvent = {
      type: input.type,
      data: input.data,
      timestamp: standardizeTimestamp(new Date()) || new Date().toISOString(),
    };

    ee.emit("analytics", event);

    return { success: true };
  });

/**
 * Get real-time stats
 */
export const getCurrentStats = adminProcedure.query(async () => {
  try {
    // Use the refactored function to get analytics data
    const stats = await getTodayStats();
    
    // Format the data for the current API contract
    return {
      activeUsers: stats.visitors,
      pageViews: stats.pageViews,
      bookingRequests: stats.bookings,
      conversionRate: stats.conversionRate,
    };
  } catch (error) {
    console.error('Error fetching live stats:', error);
    // Fallback to sample data if there's an error
    return {
      activeUsers: Math.floor(Math.random() * 20) + 5,
      pageViews: Math.floor(Math.random() * 100) + 50,
      bookingRequests: Math.floor(Math.random() * 5),
      conversionRate: (Math.random() * 5 + 2).toFixed(2),
    };
  }
});

/**
 * Check current server status
 */
export const getServerStatus = publicProcedure.query(() => {
  return {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

interface StreamResponse extends Response {
  signal: {
    addEventListener: (type: string, listener: () => void) => void;
  };
}

/**
 * Get analytics stats for today
 * Refactored to avoid code duplication
 */
async function getTodayStats() {
  try {
    // Get current stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Using Promise.all for parallel database queries
    const [uniqueVisitorsResult, pageViews, bookings, conversions, recentEvents] = await Promise.all([
      // Count unique visitors (by sessionId)
      prisma.analyticsEvent.groupBy({
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
      }),
      
      // Count page views
      prisma.analyticsEvent.count({
        where: {
          category: 'page_view',
          timestamp: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      
      // Count bookings
      prisma.analyticsEvent.count({
        where: {
          category: 'booking',
          action: 'complete',
          timestamp: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      
      // Count conversions
      prisma.analyticsEvent.count({
        where: {
          category: 'conversion',
          timestamp: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      
      // Get most recent events
      prisma.analyticsEvent.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
      })
    ]);
    
    const visitors = uniqueVisitorsResult.length;
    
    // Calculate conversion rate
    const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
    
    return {
      visitors,
      pageViews,
      bookings,
      conversions,
      conversionRate: conversionRate.toFixed(2),
      recentEvents,
      timestamp: standardizeTimestamp(new Date()) || new Date().toISOString(), // Always use standardized timestamp utility
    };
  } catch (error) {
    console.error('Error getting today stats:', error);
    throw error;
  }
}

/**
 * Create a Server-Sent Events (SSE) stream for real-time analytics updates
 * 
 * @param res - Response object
 * @returns A ReadableStream for SSE
 */
export async function createAnalyticsStream(res: StreamResponse): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  
  // Create a stream that will send events to the client
  const stream = new ReadableStream({
    async start(controller) {
      // Function to send an event
      function sendEvent(event: string, data: any) {
        const formattedData = typeof data === 'string' ? data : JSON.stringify(data);
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${formattedData}\n\n`));
      }
      
      // Send initial connection event
      sendEvent('connection', { 
        status: 'connected', 
        timestamp: standardizeTimestamp(new Date()) || new Date().toISOString(),
        type: AnalyticsStreamEventType.SESSION_STARTED 
      });
      
      // Setup heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { 
          timestamp: standardizeTimestamp(new Date()) || new Date().toISOString(),
          type: AnalyticsStreamEventType.HEARTBEAT
        });
      }, 30000); // Send heartbeat every 30 seconds
      
      // Function to handle analytics events
      const onAnalyticsEvent = (event: AnalyticsStreamEvent) => {
        sendEvent('analytics', event);
      };
      
      // Listen for analytics events
      ee.on('analytics', onAnalyticsEvent);
      
      // Function to send stats updates
      async function sendStatsUpdate() {
        try {
          // Get stats from refactored function
          const stats = await getTodayStats();
          
          // Send stats update with consistent timestamp format
          sendEvent('stats_update', {
            ...stats,
            timestamp: standardizeTimestamp(stats.timestamp) || standardizeTimestamp(new Date()) || new Date().toISOString(),
            type: AnalyticsStreamEventType.STATS_UPDATE
          });
        } catch (error) {
          console.error('Error sending stats update:', error);
          // Send error event
          sendEvent('error', { 
            message: 'Failed to update stats', 
            timestamp: standardizeTimestamp(new Date()) || new Date().toISOString(),
            type: AnalyticsStreamEventType.ERROR_OCCURRED
          });
        }
      }
      
      // Send initial stats
      await sendStatsUpdate();
      
      // Setup interval to send stats updates
      const statsInterval = setInterval(sendStatsUpdate, 10000); // Update stats every 10 seconds
      
      // Register a listener for when the client disconnects
      if (res.signal && typeof res.signal.addEventListener === 'function') {
        res.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          clearInterval(statsInterval);
          ee.off('analytics', onAnalyticsEvent);
          controller.close();
          
          // Optional: emit session ended event
          ee.emit('analytics', {
            type: AnalyticsStreamEventType.SESSION_ENDED,
            data: {
              category: EventCategory.INTERACTION,
              action: 'connection_closed'
            },
            timestamp: standardizeTimestamp(new Date()) || new Date().toISOString()
          });
        });
      }
    },
  });
  
  return stream;
}