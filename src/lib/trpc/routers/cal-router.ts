/**
 * Cal.com tRPC Router
 *
 * This router handles all Cal.com related operations through tRPC.
 */

import { z } from 'zod';
import { adminProcedure, protectedProcedure, publicProcedure, router } from '../server';
import {
  getCalBookings,
  getCalBookingByUid,
  getCalEventTypes,
  updateCalBookingStatus,
  rescheduleCalBooking,
  getCalAvailability,
} from '@/lib/cal/api';
import type { GetCalBookingsOptions } from '@/types/cal-types';
import { TRPCError } from '@trpc/server';
import { isCalConfigured } from '@/lib/cal/config';
import { prisma } from '@/lib/db/prisma';

export const calRouter = router({
  // Get Cal.com configuration status
  getConfigStatus: publicProcedure.query(async () => {
    const configured = isCalConfigured();
    return {
      configured,
      calUsername: process.env['NEXT_PUBLIC_CAL_USERNAME'] ?? null,
      hasApiKey: Boolean(process.env['CAL_API_KEY']),
      hasWebhookSecret: Boolean(process.env['CAL_WEBHOOK_SECRET']),
    };
  }),

  // Get all bookings from Cal.com
  getBookings: adminProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          status: z.string().optional(),
          eventTypeId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const options: GetCalBookingsOptions = {};
        if (input?.limit !== undefined) options.limit = input.limit;
        if (input?.status !== undefined) options.status = input.status;
        if (input?.eventTypeId !== undefined) options.eventTypeId = input.eventTypeId;
        return await getCalBookings(options);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get Cal.com bookings: ${errorMessage}`,
        });
      }
    }),

  // Get a specific booking by UID
  getBookingByUid: adminProcedure.input(z.object({ uid: z.string() })).query(async ({ input }) => {
    try {
      return await getCalBookingByUid(input.uid);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get Cal.com booking: ${errorMessage}`,
      });
    }
  }),

  // Get all event types from Cal.com
  getEventTypes: adminProcedure.query(async () => {
    try {
      return await getCalEventTypes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get Cal.com event types: ${errorMessage}`,
      });
    }
  }),

  // Update a booking status
  updateBookingStatus: adminProcedure
    .input(
      z.object({
        uid: z.string(),
        status: z.enum(['accepted', 'rejected', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateCalBookingStatus(input.uid, input.status);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to update Cal.com booking status: ${errorMessage}`,
        });
      }
    }),

  // Reschedule a booking
  rescheduleBooking: adminProcedure
    .input(
      z.object({
        uid: z.string(),
        newTime: z.object({
          start: z.string(),
          end: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await rescheduleCalBooking(input.uid, input.newTime);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to reschedule Cal.com booking: ${errorMessage}`,
        });
      }
    }),

  // Get availability slots for an event type
  getAvailability: protectedProcedure
    .input(
      z.object({
        eventTypeId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        return await getCalAvailability(input.eventTypeId, input.startDate, input.endDate);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to get Cal.com availability: ${errorMessage}`,
        });
      }
    }),

  // Sync Cal.com bookings with internal database
  syncBookings: adminProcedure.mutation(async () => {
    try {
      // Get all bookings from Cal.com
      const calBookings = await getCalBookings({});

      // Track statistics for the sync operation
      const stats = {
        total: calBookings.length,
        created: 0,
        updated: 0,
        unchanged: 0,
        failed: 0,
      };

      // Process each booking
      for (const booking of calBookings) {
        try {
          // Check if booking already exists in our database
          const existingBooking = await prisma.booking.findFirst({
            where: {
              calBookingUid: booking.uid,
            },
          });

          if (existingBooking) {
            // Update existing booking
            await prisma.booking.update({
              where: {
                id: existingBooking.id,
              },
              data: {
                calStatus: booking.status,
                updatedAt: new Date(),
              },
            });
            stats.updated++;
          } else {
            // Create new booking record
            if (booking.attendees.length > 0) {
              // Extract attendee information safely
              const attendeeName =
                booking.attendees && booking.attendees.length > 0
                  ? (booking.attendees[0]?.name ?? 'Unknown')
                  : 'Unknown';
              const attendeeEmail =
                booking.attendees && booking.attendees.length > 0
                  ? (booking.attendees[0]?.email ?? 'unknown@example.com')
                  : 'unknown@example.com';

              // Extract customInputs if they exist
              interface CustomInput {
                label: string;
                value: string;
              }

              const customInputs = Array.isArray(booking.customInputs)
                ? (booking.customInputs as CustomInput[])
                : [];
              const getTattooTypeInput = customInputs.find((i) => i.label === 'Tattoo Type');
              const getSizeInput = customInputs.find((i) => i.label === 'Size');
              const getPlacementInput = customInputs.find((i) => i.label === 'Placement');

              // Create the booking record
              await prisma.booking.create({
                data: {
                  name: attendeeName,
                  email: attendeeEmail,
                  phone: 'Not provided',
                  calBookingUid: booking.uid,
                  calEventTypeId: booking.eventType ? booking.eventType.id : null,
                  calStatus: booking.status,
                  calMeetingUrl: booking.meetingUrl ?? null,

                  tattooType: getTattooTypeInput?.value ?? 'Not specified',
                  size: getSizeInput?.value ?? 'Not specified',
                  placement: getPlacementInput?.value ?? 'Not specified',
                  description: booking.description ?? 'Cal.com booking',
                  preferredDate: new Date(booking.startTime),
                  preferredTime: new Date(booking.startTime).toLocaleTimeString(),
                  paymentMethod: 'None',
                  source: 'cal.com',
                },
              });
              stats.created++;
            }
          }
        } catch (error) {
          console.error(`Failed to sync booking ${booking.uid}:`, error);
          stats.failed++;
        }
      }

      return {
        success: true,
        stats,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to sync Cal.com bookings: ${errorMessage}`,
      });
    }
  }),
});
