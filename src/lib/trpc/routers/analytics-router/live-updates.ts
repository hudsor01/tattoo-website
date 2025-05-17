import { publicProcedure, adminProcedure } from "../../api-router";
import { observable } from "@trpc/server/observable";
import { z, safeArray } from "../../utils/safe-zod";
import { EventEmitter } from "events";

// Event emitter for live updates
const ee = new EventEmitter();

// Define interface for analytics event
interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: number;
}

// Event types for analytics stream
export enum AnalyticsStreamEvents {
  PAGE_VIEW = 'page_view',
  USER_INTERACTION = 'user_interaction',
  BOOKING_CREATED = 'booking_created',
  PAYMENT_PROCESSED = 'payment_processed',
  CONTACT_SUBMITTED = 'contact_submitted',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Subscribe to live analytics events
 */
export const liveAnalyticsSubscription = adminProcedure
  .input(
    z.object({
      types: safeArray(z.string()).optional(),
    })
  )
  .subscription(({ input }) => {
    return observable<AnalyticsEvent>((emit) => {
      const onAnalyticsEvent = (event: AnalyticsEvent) => {
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
      type: z.string(),
      data: z.record(z.any()).optional().default({}),
    })
  )
  .mutation(({ input }) => {
    const event: AnalyticsEvent = {
      type: input.type,
      data: input.data,
      timestamp: Date.now(),
    };

    ee.emit("analytics", event);

    return { success: true };
  });

/**
 * Get real-time stats
 */
export const getCurrentStats = adminProcedure.query(async () => {
  // This would normally fetch from DB, but for now return sample data
  return {
    activeUsers: Math.floor(Math.random() * 20) + 5,
    pageViews: Math.floor(Math.random() * 100) + 50,
    bookingRequests: Math.floor(Math.random() * 5),
    conversionRate: (Math.random() * 5 + 2).toFixed(2),
  };
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