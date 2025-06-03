/**
 * Cal.com-based Appointments Router
 * 
 * This router interfaces with Cal.com to manage appointments instead of
 * maintaining a separate appointment system. It maps Cal.com bookings
 * to our appointment interfaces for backward compatibility.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../procedures';
import { AppointmentStatus } from '@prisma/client';
import { handleRouterError } from '../utils/router-error-handler';
import { 
  getCalBookings, 
  getCalBookingByUid, 
  updateCalBookingStatus, 
  rescheduleCalBooking 
} from '@/lib/cal/api';

export const appointmentsRouter = router({
  /**
   * Get all appointments with filtering
   * This now retrieves data from Cal.com and maps it to our appointment interface
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z.nativeEnum(AppointmentStatus).optional(),
        customerId: z.string().optional(),
        startDate: z
          .string()
          .datetime()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
        endDate: z
          .string()
          .datetime()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
      })
    )
    .query(async ({ input }) => {
      try {
        // Get bookings from Cal.com
        const calBookings = await getCalBookings({
          limit: input.limit,
          status: input.status,
        });

        // Find bookings that match our filter criteria
        const filteredBookings = calBookings.filter(booking => {
          // Filter by status if provided
          if (input.status && booking.status !== input.status) {
            return false;
          }

          // Filter by customer if provided
          if (input.customerId && booking.attendees?.[0]?.email) {
            // We'd need to match by email since Cal.com uses email as identifier
            // This would require a separate query to match customer ID to email
            // For now, we'll just skip this filter
          }

          // Filter by date range if provided
          if (input.startDate && new Date(booking.startTime) < input.startDate) {
            return false;
          }
          if (input.endDate && new Date(booking.startTime) > input.endDate) {
            return false;
          }

          return true;
        });

        // Handle pagination via cursors
        let startIndex = 0;
        if (input.cursor) {
          const cursorIndex = filteredBookings.findIndex(b => b.uid === input.cursor);
          if (cursorIndex > -1) {
            startIndex = cursorIndex + 1;
          }
        }

        // Get the page of results
        const paginatedBookings = filteredBookings.slice(startIndex, startIndex + input.limit + 1);
        
        // Set up next cursor
        let nextCursor: string | undefined;
        if (paginatedBookings.length > input.limit) {
          const nextItem = paginatedBookings.pop();
          nextCursor = nextItem?.uid;
        }

        // Transform Cal.com bookings to our appointment interface
        const transformedAppointments = paginatedBookings.map(booking => {
          const attendee = booking.attendees?.[0];
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          
          // Calculate duration
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
          
          return {
            id: booking.uid,
            customerId: attendee?.email ?? '',
            clientName: attendee?.name ?? 'Unknown',
            clientEmail: attendee?.email ?? '',
            clientPhone: '',
            appointmentDate: startTime.toISOString(),
            duration: duration > 0 ? duration : 60,
            status: booking.status as AppointmentStatus,
            depositPaid: booking.payment?.status === 'COMPLETED',
            depositAmount: booking.payment?.amount ?? 0,
            totalPrice: booking.payment?.amount ?? 0,
            tattooStyle: '',
            description: booking.description ?? booking.title,
            location: booking.location ?? '',
            size: '',
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
          };
        });

        return {
          items: transformedAppointments,
          nextCursor,
        };
      } catch (error) {
        return handleRouterError(error, {
          operation: 'query',
          procedureName: 'getAll',
          routerName: 'appointments',
          input
        });
      }
    }),

  /**
   * Create a new appointment using Cal.com
   * Note: This is not fully implemented as it would require creating
   * a Cal.com booking via their API, which is not available here.
   * Users should book through Cal.com directly.
   */
  create: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        artistId: z.string().optional(),
        title: z.string().optional(),
        appointmentDate: z.date(),
        duration: z.number().min(15).default(120),
        status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.SCHEDULED),
        depositAmount: z.number().min(0).default(0),
        totalPrice: z.number().min(0).default(0),
        description: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Direct appointment creation is not supported. Please use Cal.com to create appointments.',
      });
    }),

  /**
   * Update an appointment
   * This now updates the Cal.com booking
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        appointmentDate: z.date().optional(),
        duration: z.number().min(15).optional(),
        status: z.nativeEnum(AppointmentStatus).optional(),
        depositAmount: z.number().min(0).optional(),
        totalPrice: z.number().min(0).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, appointmentDate, duration, status } = input;
        
        // Get the booking from Cal.com
        await getCalBookingByUid(id);
        
        // Update status if provided
        if (status) {
          const calStatus = status === AppointmentStatus.CANCELLED ? 'cancelled' : 
                           status === AppointmentStatus.CONFIRMED ? 'accepted' : 'accepted';
          await updateCalBookingStatus(id, calStatus as 'cancelled' | 'accepted');
        }
        
        // Reschedule if new date is provided
        if (appointmentDate) {
          const endTime = new Date(appointmentDate);
          endTime.setMinutes(endTime.getMinutes() + (duration ?? 60));
          
          await rescheduleCalBooking(id, {
            start: appointmentDate.toISOString(),
            end: endTime.toISOString(),
          });
        }
        
        // Get updated booking
        const updatedBooking = await getCalBookingByUid(id);
        const attendee = updatedBooking.attendees?.[0];
        const startTime = new Date(updatedBooking.startTime);
        const endTime = new Date(updatedBooking.endTime);
        
        // Calculate duration
        const updatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        
        return {
          id: updatedBooking.uid,
          customerId: attendee?.email ?? '',
          clientName: attendee?.name ?? 'Unknown',
          clientEmail: attendee?.email ?? '',
          clientPhone: '',
          appointmentDate: startTime.toISOString(),
          duration: updatedDuration > 0 ? updatedDuration : 60,
          status: updatedBooking.status as AppointmentStatus,
          depositPaid: updatedBooking.payment?.status === 'COMPLETED',
          depositAmount: updatedBooking.payment?.amount ?? 0,
          totalPrice: updatedBooking.payment?.amount ?? 0,
          tattooStyle: '',
          description: updatedBooking.description ?? updatedBooking.title,
          location: updatedBooking.location ?? '',
          size: '',
          createdAt: updatedBooking.createdAt,
          updatedAt: updatedBooking.updatedAt,
        };
      } catch (error) {
        return handleRouterError(error, {
          operation: 'mutation',
          procedureName: 'update',
          routerName: 'appointments',
          input
        });
      }
    }),

  /**
   * Delete an appointment
   * This now cancels the Cal.com booking
   */
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Cancel the booking in Cal.com
        await updateCalBookingStatus(input.id, 'cancelled');
        
        return { success: true };
      } catch (error) {
        return handleRouterError(error, {
          operation: 'mutation',
          procedureName: 'delete',
          routerName: 'appointments',
          input
        });
      }
    }),
});
