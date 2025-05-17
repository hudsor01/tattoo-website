/**
 * Analytics tRPC Router
 *
 * Provides type-safe procedures for tracking and retrieving analytics data.
 * This router centralizes all analytics functionality for better maintainability.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, procedure, protectedProcedure, adminProcedure } from '@/lib/trpc-server';
import { trackAndEmitEvent } from '../trpc/routers/live-updates';
import {
  AnalyticsEventSchema,
  AnalyticsFilterSchema,
  BaseEventSchema,
  BookingEventSchema,
  ConversionEventSchema,
  ErrorEventSchema,
  EventCategory,
  GalleryEventSchema,
  InteractionEventSchema,
  PageViewEventSchema,
} from './types';
import {
  getAnalyticsSummary,
  getBookingFunnelAnalytics,
  getTopDesigns,
  queryAnalyticsEvents,
  storeAnalyticsEvent,
} from '../trpc/routers/db';

// Define the analytics router
export const analyticsRouter = router({
  /**
   * Track an analytics event
   * Accessible to all clients (public and authenticated)
   */
  trackEvent: procedure.input(AnalyticsEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track analytics event',
        cause: error,
      });
    }
  }),

  /**
   * Track a page view
   * Wrapper for trackEvent with specific schema for page views
   */
  trackPageView: procedure.input(PageViewEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track page view',
        cause: error,
      });
    }
  }),

  /**
   * Track an interaction
   * Wrapper for trackEvent with specific schema for interactions
   */
  trackInteraction: procedure.input(InteractionEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track interaction',
        cause: error,
      });
    }
  }),

  /**
   * Track a booking event
   * Wrapper for trackEvent with specific schema for booking flow
   */
  trackBookingEvent: procedure.input(BookingEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking booking event:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track booking event',
        cause: error,
      });
    }
  }),

  /**
   * Track a gallery event
   * Wrapper for trackEvent with specific schema for gallery interactions
   */
  trackGalleryEvent: procedure.input(GalleryEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking gallery event:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track gallery event',
        cause: error,
      });
    }
  }),

  /**
   * Track a conversion event
   * Wrapper for trackEvent with specific schema for conversions
   */
  trackConversion: procedure.input(ConversionEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      // Emit the event for live updates
      trackAndEmitEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking conversion:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track conversion',
        cause: error,
      });
    }
  }),

  /**
   * Track an error event
   * Wrapper for trackEvent with specific schema for errors
   */
  trackError: procedure.input(ErrorEventSchema).mutation(async ({ input, ctx }) => {
    try {
      // Add user information if available in context
      const event = {
        ...input,
        userId: input.userId || ctx.user?.id || null,
      };

      // Store the event in the database
      const storedEvent = await storeAnalyticsEvent(event);

      return {
        success: true,
        eventId: storedEvent.id,
      };
    } catch (error) {
      console.error('Error tracking error event:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to track error event',
        cause: error,
      });
    }
  }),

  /**
   * Query analytics events with filtering
   * Admin only - requires admin authentication
   */
  queryEvents: adminProcedure.input(AnalyticsFilterSchema).query(async ({ input, ctx }) => {
    try {
      // Query events from the database with filtering
      const result = await queryAnalyticsEvents(input);

      return result;
    } catch (error) {
      console.error('Error querying analytics events:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to query analytics events',
        cause: error,
      });
    }
  }),

  /**
   * Get analytics summary for a given time period
   * Admin only - requires admin authentication
   */
  getSummary: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const { startDate, endDate } = input;

        // Get summary from the database
        const summary = await getAnalyticsSummary(startDate, endDate);

        return summary;
      } catch (error) {
        console.error('Error getting analytics summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get analytics summary',
          cause: error,
        });
      }
    }),

  /**
   * Get top performing designs based on views and interactions
   * Admin only - requires admin authentication
   */
  getTopDesigns: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const { limit } = input;

        // Get top designs from the database
        const topDesigns = await getTopDesigns(limit);

        return topDesigns;
      } catch (error) {
        console.error('Error getting top designs:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get top designs',
          cause: error,
        });
      }
    }),

  /**
   * Get tracking data for the booking funnel
   * Admin only - requires admin authentication
   */
  getBookingFunnel: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const { startDate, endDate } = input;

        // Get booking funnel analytics from the database
        const funnelData = await getBookingFunnelAnalytics(startDate, endDate);

        return funnelData;
      } catch (error) {
        console.error('Error getting booking funnel analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get booking funnel analytics',
          cause: error,
        });
      }
    }),
});
