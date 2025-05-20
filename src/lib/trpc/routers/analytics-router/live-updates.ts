import { publicProcedure, adminProcedure } from "../../procedures";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { EventEmitter } from "events";
import { AnalyticsStreamEvent, AnalyticsStreamEventType } from "@/types/analytics-types";

// Event emitter for live updates
const ee = new EventEmitter();

// Re-export the enum for backwards compatibility
export const AnalyticsStreamEvents = AnalyticsStreamEventType;

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
      type: z.string(),
      data: z.object({
        category: z.string(),
        action: z.string(),
        label: z.string().optional(),
        value: z.number().optional(),
        path: z.string().optional(),
        referrer: z.string().optional(),
        deviceType: z.string().optional(),
        browser: z.string().optional(),
        os: z.string().optional(),
        metadata: z.record(z.unknown()).optional(),
      }).optional().default({
        category: 'unknown',
        action: 'unknown'
      }),
    })
  )
  .mutation(({ input }) => {
    const event: AnalyticsStreamEvent = {
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