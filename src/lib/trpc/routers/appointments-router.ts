import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../procedures';
import { prisma } from '@/lib/db/prisma';
import { AppointmentStatus } from '@/types/enum-types';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';

export const appointmentsRouter = router({
  /**
   * Get all appointments with filtering
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
        const where: Prisma.AppointmentWhereInput = {};

        if (input.status) {
          where.status = input.status;
        }

        if (input.customerId) {
          where.customerId = input.customerId;
        }

        if (input.startDate || input.endDate) {
          const dateFilter: Prisma.DateTimeFilter = {};
          if (input.startDate) {
            dateFilter.gte = input.startDate;
          }
          if (input.endDate) {
            dateFilter.lte = input.endDate;
          }
          where.startDate = dateFilter;
        }

        const appointments = await prisma.appointment.findMany({
          where,
          orderBy: {
            startDate: 'desc',
          },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor } }),
        });

        console.warn(`Found ${appointments.length} appointments`);

        let nextCursor: string | undefined;
        if (appointments.length > input.limit) {
          const nextItem = appointments.pop();
          nextCursor = nextItem?.id;
        }

        // Get customer info for each appointment
        const customerIds = [...new Set(appointments.map((a) => a.customerId))];
        const customers = await prisma.customer.findMany({
          where: { id: { in: customerIds } },
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        });

        const customerMap = new Map(customers.map((c) => [c.id, c]));

        // Transform the data to match our interface
        const transformedAppointments = appointments.map((appointment) => {
          const customer = customerMap.get(appointment.customerId);

          // Calculate duration safely
          let duration = 120; // default 2 hours
          try {
            if (appointment.endDate && appointment.startDate) {
              duration = Math.round(
                (appointment.endDate.getTime() - appointment.startDate.getTime()) / (1000 * 60)
              );
              if (duration <= 0) duration = 120;
            }
          } catch (error) {
            console.warn('Error calculating appointment duration:', error);
          }

          return {
            id: appointment.id,
            customerId: appointment.customerId,
            clientName: customer
              ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
              : 'Unknown Customer',
            clientEmail: customer?.email ?? '',
            clientPhone: customer?.phone ?? '',
            appointmentDate: appointment.startDate?.toISOString() ?? new Date().toISOString(),
            duration,
            status: appointment.status as AppointmentStatus,
            depositPaid: appointment.deposit ? appointment.deposit > 0 : false,
            depositAmount: appointment.deposit ?? 0,
            totalPrice: appointment.totalPrice ?? 0,
            tattooStyle: appointment.title ?? '', // Use title as tattoo style
            description: appointment.description ?? '',
            location: appointment.location ?? '',
            size: '', // Not in schema, could be derived from description
            createdAt: appointment.createdAt?.toISOString() ?? new Date().toISOString(),
            updatedAt: appointment.updatedAt?.toISOString() ?? new Date().toISOString(),
          };
        });

        return {
          items: transformedAppointments,
          nextCursor,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching appointments',
          cause: error,
        });
      }
    }),

  /**
   * Create a new appointment
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
    .mutation(async ({ input }) => {
      try {
        // Verify customer exists
        const customer = await prisma.customer.findUnique({
          where: { id: input.customerId },
        });

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          });
        }

        // Get a default artist if none provided
        let artistId = input.artistId;
        if (!artistId) {
          const defaultArtist = await prisma.artist.findFirst();
          if (!defaultArtist) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'No artists available',
            });
          }
          artistId = defaultArtist.id;
        }

        const appointment = await prisma.appointment.create({
          data: {
            id: randomUUID(),
            customerId: input.customerId,
            artistId: artistId,
            title: input.title ?? 'Tattoo Appointment',
            startDate: input.appointmentDate,
            endDate: new Date(input.appointmentDate.getTime() + input.duration * 60 * 1000),
            status: input.status,
            deposit: input.depositAmount,
            totalPrice: input.totalPrice,
            description: input.description ?? null,
            location: input.location ?? null,
          },
        });

        return {
          id: appointment.id,
          customerId: appointment.customerId,
          clientName: `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
          clientEmail: customer.email ?? '',
          clientPhone: customer.phone ?? '',
          appointmentDate: appointment.startDate,
          duration:
            Math.round(
              (appointment.endDate.getTime() - appointment.startDate.getTime()) / (1000 * 60)
            ) || 120,
          status: appointment.status,
          depositPaid: appointment.deposit ? appointment.deposit > 0 : false,
          depositAmount: appointment.deposit ?? 0,
          totalPrice: appointment.totalPrice ?? 0,
          tattooStyle: '',
          description: appointment.description ?? '',
          location: appointment.location ?? '',
          size: '',
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error creating appointment',
          cause: error,
        });
      }
    }),

  /**
   * Update an appointment
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
        const { id, appointmentDate, duration, depositAmount, ...updateData } = input;

        // Build update data object with correct field mapping, filtering out undefined values
        const data: Prisma.AppointmentUpdateInput = {};

        // Only include defined values
        if (updateData.title !== undefined) data.title = updateData.title;
        if (updateData.status !== undefined) data.status = updateData.status;
        if (updateData.totalPrice !== undefined) data.totalPrice = updateData.totalPrice;
        if (updateData.description !== undefined) data.description = updateData.description;
        if (updateData.location !== undefined) data.location = updateData.location;
        if (appointmentDate) {
          data.startDate = appointmentDate;
          if (duration) {
            data.endDate = new Date(appointmentDate.getTime() + duration * 60 * 1000);
          }
        }
        if (depositAmount !== undefined) {
          data.deposit = depositAmount;
        }

        const appointment = await prisma.appointment.update({
          where: { id },
          data,
          include: {
            Customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        });

        return {
          id: appointment.id,
          customerId: appointment.customerId,
          clientName:
            `${appointment.Customer?.firstName ?? ''} ${appointment.Customer?.lastName ?? ''}`.trim(),
          clientEmail: appointment.Customer?.email ?? '',
          clientPhone: appointment.Customer?.phone ?? '',
          appointmentDate: appointment.startDate,
          duration:
            Math.round(
              (appointment.endDate.getTime() - appointment.startDate.getTime()) / (1000 * 60)
            ) || 120,
          status: appointment.status,
          depositPaid: appointment.deposit ? appointment.deposit > 0 : false,
          depositAmount: appointment.deposit ?? 0,
          totalPrice: appointment.totalPrice ?? 0,
          tattooStyle: '',
          description: appointment.description ?? '',
          location: appointment.location ?? '',
          size: '',
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating appointment',
          cause: error,
        });
      }
    }),

  /**
   * Delete an appointment
   */
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await prisma.appointment.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error deleting appointment',
          cause: error,
        });
      }
    }),
});
