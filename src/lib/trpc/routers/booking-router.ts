/**
 * Booking Router
 * 
 * This router handles all booking-related API endpoints,
 * including creating, retrieving, and managing tattoo bookings.
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../server';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { sanitizeForPrisma, emailWhereCondition } from '@/lib/utils/prisma-helper';

// Validation schema for creating a booking
export const bookingValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  tattooType: z.string().min(1, "Tattoo type is required"),
  size: z.string().min(1, "Size is required"),
  placement: z.string().min(1, "Placement is required"),
  description: z.string().min(1, "Description is required"),
  preferredDate: z.date(),
  preferredTime: z.string().min(1, "Preferred time is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  customerId: z.string().optional(),
  artistId: z.string().optional(),
  notes: z.string().optional(),
});

// Validation schema for updating a booking
export const bookingUpdateValidator = z.object({
  id: z.number(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  tattooType: z.string().optional(),
  size: z.string().optional(),
  placement: z.string().optional(),
  description: z.string().optional(),
  preferredDate: z.date().optional(),
  preferredTime: z.string().optional(),
  paymentMethod: z.string().optional(),
  depositPaid: z.boolean().optional(),
  customerId: z.string().optional(),
  artistId: z.string().optional(),
  notes: z.string().optional(),
});

// Validation schema for updating booking status
export const bookingStatusValidator = z.object({
  id: z.number(),
  depositPaid: z.boolean(),
});

// Export the booking router with all procedures
export const bookingRouter = router({
  // Create a new booking
  create: publicProcedure
    .input(bookingValidator)
    .mutation(async ({ input, ctx }) => {
      try {
        // Create the booking with conditional field assignment using proper Prisma types
        const bookingData: Prisma.BookingCreateInput = {
          name: input.name,
          email: input.email,
          phone: input.phone,
          tattooType: input.tattooType,
          size: input.size,
          placement: input.placement,
          description: input.description,
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime,
          paymentMethod: input.paymentMethod,
          depositPaid: false,
        };

        // Only add relation fields if they are defined
        if (input.customerId) {
          bookingData.Customer = { connect: { id: input.customerId } };
        }
        if (input.artistId) {
          bookingData.Artist = { connect: { id: input.artistId } };
        }
        if (input.notes !== undefined) {
          bookingData.notes = input.notes;
        }

        const booking = await ctx.db.booking.create({
          data: sanitizeForPrisma(bookingData),
        });

        return booking;
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create booking: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Get all bookings (admin only)
  getAll: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.db.booking.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          Artist: {
            include: {
              User: true,
            },
          },
          Customer: true,
        },
      });
    }),

  // Get bookings for the current user
  getMine: protectedProcedure
    .query(async ({ ctx }) => {
      // Get artist profile if user is an artist
      const artist = ctx.user.role === 'artist' ? 
        await ctx.db.artist.findUnique({
          where: { userId: ctx.user.id },
        }) : null;

      // Get customer profile
      const customer = await ctx.db.customer.findFirst({
        where: emailWhereCondition(ctx.user.email),
      });

      if (!artist && !customer) {
        return [];
      }

      // Get bookings based on user role
      return ctx.db.booking.findMany({
        where: {
          OR: [
            // Artist's bookings
            ...(artist ? [{ artistId: artist.id }] : []),
            // Customer's bookings
            ...(customer ? [{ customerId: customer.id }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          Artist: {
            include: {
              User: true,
            },
          },
          Customer: true,
        },
      });
    }),

  // Get a booking by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: {
          Artist: {
            include: {
              User: true,
            },
          },
          Customer: true,
          Payment: true,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Booking with ID ${input.id} not found`,
        });
      }

      return booking;
    }),

  // Update a booking
  update: protectedProcedure
    .input(bookingUpdateValidator)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      try {
        // Find the booking first
        const existingBooking = await ctx.db.booking.findUnique({
          where: { id },
          include: {
            Artist: true,
            Customer: true,
          },
        });

        if (!existingBooking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Booking with ID ${id} not found`,
          });
        }

        // Check if user has permission to update
        const isAdmin = ctx.user.role === 'admin';
        const isArtist = existingBooking.artistId && 
          await ctx.db.artist.findFirst({ 
            where: { 
              userId: ctx.user.id,
              id: existingBooking.artistId
            } 
          });
        const isCustomer = existingBooking.customerId && 
          await ctx.db.customer.findFirst({
            where: {
              id: existingBooking.customerId,
              ...emailWhereCondition(ctx.user.email)
            }
          });

        if (!isAdmin && !isArtist && !isCustomer) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this booking',
          });
        }

        // Prepare the update data
        const updateData: Prisma.BookingUpdateInput = {};
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.tattooType !== undefined) updateData.tattooType = data.tattooType;
        if (data.size !== undefined) updateData.size = data.size;
        if (data.placement !== undefined) updateData.placement = data.placement;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate;
        if (data.preferredTime !== undefined) updateData.preferredTime = data.preferredTime;
        if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
        if (data.depositPaid !== undefined) updateData.depositPaid = data.depositPaid;
        if (data.customerId !== undefined) {
          updateData['Customer'] = data.customerId 
            ? { connect: { id: data.customerId } }
            : { disconnect: true };
        }
        if (data.artistId !== undefined) {
          updateData['Artist'] = data.artistId 
            ? { connect: { id: data.artistId } }
            : { disconnect: true };
        }
        if (data.notes !== undefined) updateData.notes = data.notes;
        
        // Update the booking
        const updatedBooking = await ctx.db.booking.update({
          where: { id },
          data: sanitizeForPrisma(updateData),
          include: {
            Artist: {
              include: {
                User: true,
              },
            },
            Customer: true,
          },
        });

        return updatedBooking;
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update booking: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Update booking deposit status
  updateStatus: adminProcedure
    .input(bookingStatusValidator)
    .mutation(async ({ input, ctx }) => {
      const { id, depositPaid } = input;

      try {
        const updatedBooking = await ctx.db.booking.update({
          where: { id },
          data: sanitizeForPrisma({ depositPaid }),
        });

        return updatedBooking;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update booking status: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Delete a booking (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.booking.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to delete booking: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Count bookings for dashboard
  getCounts: adminProcedure
    .query(async ({ ctx }) => {
      const total = await ctx.db.booking.count();
      const pending = await ctx.db.booking.count({
        where: { depositPaid: false },
      });
      const confirmed = await ctx.db.booking.count({
        where: { depositPaid: true },
      });

      return {
        total,
        pending,
        confirmed,
      };
    }),
});