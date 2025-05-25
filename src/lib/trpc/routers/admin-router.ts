/**
 * Admin Router
 *
 * This router handles all admin-related API endpoints,
 * including dashboard data and user management.
 */
import { z } from '../utils/safe-zod';
import { adminProcedure, router } from '../server';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

// Export the admin router with all procedures
export const adminRouter = router({
  // Get dashboard overview stats
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    // Get counts from different entities
    const usersCount = await ctx.db.user.count();
    const customersCount = await ctx.db.customer.count();
    const bookingsCount = await ctx.db.booking.count();
    const appointmentsCount = await ctx.db.appointment.count();
    const artistsCount = await ctx.db.artist.count();
    const testimonialsCount = await ctx.db.testimonial.count();
    const designsCount = await ctx.db.tattooDesign.count();

    // Get recent bookings
    const recentBookings = await ctx.db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        Customer: true,
        Artist: {
          include: {
            User: true,
          },
        },
      },
    });

    // Get upcoming appointments
    const upcomingAppointments = await ctx.db.appointment.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      take: 5,
      orderBy: { startDate: 'asc' },
      include: {
        Customer: true,
        Artist: true,
      },
    });

    // Return all stats
    return {
      counts: {
        users: usersCount,
        customers: customersCount,
        bookings: bookingsCount,
        appointments: appointmentsCount,
        artists: artistsCount,
        testimonials: testimonialsCount,
        designs: designsCount,
      },
      recentBookings,
      upcomingAppointments,
    };
  }),

  // Customer endpoints
  customers: router({
    getAll: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(1000).default(100),
          cursor: z.string().nullish(),
          search: z.string().optional(),
        }),
      )
      .query(async ({ input, ctx }) => {
        const { limit, cursor, search } = input;

        // Build the where clause
        let where: Prisma.CustomerWhereInput = {};

        // Add search filter if provided
        if (search) {
          where = {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          };
        }

        const customers = await ctx.db.customer.findMany({
          where,
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor } } : {}),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        let nextCursor: string | undefined;
        if (customers.length > limit) {
          const nextItem = customers.pop();
          nextCursor = nextItem!.id;
        }

        return {
          items: customers,
          nextCursor,
        };
      }),
  }),

  // Get customer list with pagination
  getCustomers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      // Build the where clause
      let where: Prisma.CustomerWhereInput = {};

      // Add search filter if provided
      if (search) {
        where = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Get total count for pagination
      const totalCount = await ctx.db.customer.count({ where });

      // Get customers
      const customers = await ctx.db.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Booking: {
            select: {
              id: true,
            },
          },
          Appointment: {
            select: {
              id: true,
            },
          },
          Tag: true,
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      return {
        customers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    }),

  // Get customer details by ID
  getCustomerById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const customer = await ctx.db.customer.findUnique({
        where: { id: input.id },
        include: {
          Booking: {
            orderBy: { createdAt: 'desc' },
            include: {
              Artist: {
                include: {
                  User: true,
                },
              },
            },
          },
          Appointment: {
            orderBy: { startDate: 'desc' },
            include: {
              Artist: true,
            },
          },
          Transaction: {
            orderBy: { createdAt: 'desc' },
          },
          Testimonial: true,
          Tag: true,
        },
      });

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Customer with ID ${input.id} not found`,
        });
      }

      return customer;
    }),

  // Update customer details
  updateCustomer: adminProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        birthDate: z.date().optional(),
        allergies: z.string().optional(),
        source: z.string().optional(),
        personalNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      try {
        // Convert the input data to a format acceptable by Prisma
        const updateData: Prisma.CustomerUpdateInput = {};
        
        if (input.firstName !== null && input.firstName !== undefined) updateData.firstName = input.firstName;
        if (input.lastName !== null && input.lastName !== undefined) updateData.lastName = input.lastName;
        if (input.email !== null && input.email !== undefined) updateData.email = input.email;
        if (input.phone !== null && input.phone !== undefined) updateData.phone = input.phone;
        if (input.address !== null && input.address !== undefined) updateData.address = input.address;
        if (input.city !== null && input.city !== undefined) updateData.city = input.city;
        if (input.state !== null && input.state !== undefined) updateData.state = input.state;
        if (input.postalCode !== null && input.postalCode !== undefined) updateData.postalCode = input.postalCode;
        if (input.country !== null && input.country !== undefined) updateData.country = input.country;
        if (input.birthDate !== null && input.birthDate !== undefined) updateData.birthDate = input.birthDate;
        if (input.allergies !== null && input.allergies !== undefined) updateData.allergies = input.allergies;
        if (input.source !== null && input.source !== undefined) updateData.source = input.source;
        if (input.personalNotes !== null && input.personalNotes !== undefined) updateData.notes = input.personalNotes;
        
        const updatedCustomer = await ctx.db.customer.update({
          where: { id },
          data: updateData,
        });

        return updatedCustomer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update customer: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Add a note to a customer (placeholders until Note model is added)
  addCustomerNote: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        content: z.string().min(1),
        type: z.string().default('manual'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Since the Note model doesn't exist, we'll update the customer's notes field
        const customer = await ctx.db.customer.findUnique({
          where: { id: input.customerId },
          select: { notes: true },
        });
        
        const currentNotes = customer?.notes || '';
        const newNote = `[${new Date().toISOString()}] ${input.content}`;
        const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;
        
        await ctx.db.customer.update({
          where: { id: input.customerId },
          data: { notes: updatedNotes },
        });

        return { id: 'temp-note-id', content: input.content, type: input.type, customerId: input.customerId };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to add note: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Delete a customer note (placeholders until Note model is added)
  deleteCustomerNote: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => {
      // This is a placeholder until the Note model is properly implemented
      // For now, just return success as notes are stored in the customer.notes field
      return { success: true };
    }),

  // Manage customer tags
  addTagToCustomer: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        tagId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const customer = await ctx.db.customer.update({
          where: { id: input.customerId },
          data: {
            Tag: {
              connect: { id: input.tagId },
            },
          },
          include: {
            Tag: true,
          },
        });

        return customer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to add tag: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Remove tag from customer
  removeTagFromCustomer: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        tagId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const customer = await ctx.db.customer.update({
          where: { id: input.customerId },
          data: {
            Tag: {
              disconnect: { id: input.tagId },
            },
          },
          include: {
            Tag: true,
          },
        });

        return customer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to remove tag: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Get all tags
  getTags: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }),

  // Create a new tag
  createTag: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().default('gray'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const tag = await ctx.db.tag.create({
          data: {
            id: randomUUID(),
            name: input.name,
            color: input.color,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return tag;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle unique constraint violation
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'A tag with this name already exists',
              cause: error,
            });
          }

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create tag: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Delete a tag
  deleteTag: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    try {
      await ctx.db.tag.delete({
        where: { id: input.id },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to delete tag: ${error.message}`,
          cause: error,
        });
      }
      throw error;
    }
  }),

  // Create a new customer
  createCustomer: adminProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),  
        email: z.string().email('Valid email is required'),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const customer = await ctx.db.customer.create({
          data: {
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone?.trim() || null,
            address: input.address?.trim() || null,
            city: input.city?.trim() || null,
            state: input.state?.trim() || null,
            postalCode: input.zipCode?.trim() || null,
            notes: input.notes?.trim() || null,
            tags: [], // Initialize as empty array
          },
          // Only select the fields we need to avoid serialization issues
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return customer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle unique constraint violation (email already exists)
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'A customer with this email already exists',
              cause: error,
            });
          }

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create customer: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
});