/**
 * Dashboard Appointments tRPC Router
 *
 * Provides type-safe procedures for appointment management within the dashboard.
 * Split from dashboard-router.ts for better maintainability and organization.
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';
import { router, publicProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { TRPCError } from '@trpc/server';
import { sanitizeForPrisma } from '@/lib/utils/prisma-helper';
import { Prisma } from '@prisma/client';
// Appointments filter schema using Zod
const AppointmentsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  artistId: z.string().optional(),
  customerId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

/**
 * Format appointment time for display
 */
function formatAppointmentTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const appointmentsRouter = router({
  getUpcomingAppointments: publicProcedure
    .input(AppointmentsFilterSchema)
    .query(async ({ input }) => {
      const { status, limit, page, startDate, endDate } = input;
      const skip = (page - 1) * limit;

      try {
        // Build the where clause using type-safe techniques
        const where: Prisma.AppointmentWhereInput = {};

        // Filter by status if not "all"
        if (status !== 'all') {
          where.status = status;
        }

        // Default to upcoming appointments if no date range provided
        if (!startDate && !endDate) {
          where.startTime = { gte: new Date() };
        } else {
          // Apply custom date range if provided
          const dateFilter: Prisma.DateTimeFilter = {};

          if (startDate) {
            dateFilter.gte = new Date(startDate);
          }

          if (endDate) {
            dateFilter.lte = new Date(endDate);
          }

          where.startTime = dateFilter;
        }

        // Get appointments with count for pagination
        const [appointments, totalCount] = await Promise.all([
          prisma.appointment.findMany({
            where,
            orderBy: {
              startTime: 'asc',
            },
            skip,
            take: limit,
            // Note: Customer relationship not available in current schema
            // Use userId to fetch customer info separately if needed
          }),
          prisma.appointment.count({ where }),
        ]);

        // Transform appointments for frontend consumption
        const transformedAppointments = appointments.map((appointment) => ({
          id: appointment.id,
          // Use field names that exist in the schema
          startDate: appointment.startTime.toISOString(),
          endDate: appointment.endTime.toISOString(),
          status: appointment.status,
          // Note: Customer not directly related in schema
          customer: null, // Would need separate fetch
          userId: appointment.userId,
          formattedTime: formatAppointmentTime(appointment.startTime),
          duration: Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60)), // Duration in minutes
          createdAt: appointment.createdAt.toISOString(),
          updatedAt: appointment.updatedAt.toISOString(),
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
          appointments: transformedAppointments,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
        };
      } catch (error) {
        void logger.error('Error fetching upcoming appointments:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch upcoming appointments',
          cause: error,
        });
      }
    }),

  confirmAppointment: publicProcedure
    .input(z.string())
    .mutation(async ({ input: appointmentId }) => {
      try {
        // Get the appointment first to validate it exists
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
        });

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          });
        }

        // Update the appointment status
        const updatedAppointment = await prisma.appointment.update({
          where: { id: appointmentId },
          data: sanitizeForPrisma({
            status: 'confirmed',
            updatedAt: new Date(),
          }),
        });

        return {
          success: true,
          appointment: updatedAppointment,
        };
      } catch (error) {
        void logger.error('Error confirming appointment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to confirm appointment',
          cause: error,
        });
      }
    }),

  cancelAppointment: publicProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get the appointment first to validate it exists
        const appointment = await prisma.appointment.findUnique({
          where: { id: input.id },
        });

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          });
        }

        // Update the appointment status to cancelled
        const updatedAppointment = await prisma.appointment.update({
          where: { id: input.id },
          data: sanitizeForPrisma({
            status: 'cancelled',
            notes: input.reason ? `Cancelled: ${input.reason}` : 'Cancelled',
            updatedAt: new Date(),
          }),
        });

        return {
          success: true,
          appointment: updatedAppointment,
        };
      } catch (error) {
        void logger.error('Error cancelling appointment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel appointment',
          cause: error,
        });
      }
    }),

  rescheduleAppointment: publicProcedure
    .input(z.object({
      id: z.string(),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str)),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get the appointment first to validate it exists
        const appointment = await prisma.appointment.findUnique({
          where: { id: input.id },
        });

        if (!appointment) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Appointment not found',
          });
        }

        // Validate that the new time slot is available
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            id: { not: input.id },
            startTime: { lt: input.endDate },
            endTime: { gt: input.startDate },
            status: { in: ['scheduled', 'confirmed'] },
          },
        });

        if (conflictingAppointment) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Time slot is already booked',
          });
        }

        // Update the appointment with new times
        const updatedAppointment = await prisma.appointment.update({
          where: { id: input.id },
          data: sanitizeForPrisma({
            startTime: input.startDate,
            endTime: input.endDate,
            status: 'confirmed', // Reset to confirmed after rescheduling
            updatedAt: new Date(),
          }),
        });

        return {
          success: true,
          appointment: updatedAppointment,
        };
      } catch (error) {
        void logger.error('Error rescheduling appointment:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reschedule appointment',
          cause: error,
        });
      }
    }),
});