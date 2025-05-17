/**
 * Admin Router
 *
 * This router handles all admin-related API endpoints,
 * including dashboard data, user management, and analytics.
 */
import { z, safeArray } from '../utils/safe-zod';
import { adminProcedure, router } from '../server';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

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
        customer: true,
        artist: {
          include: {
            user: true,
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
        customer: true,
        artist: true,
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
          bookings: {
            select: {
              id: true,
            },
          },
          appointments: {
            select: {
              id: true,
            },
          },
          tags: true,
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
          bookings: {
            orderBy: { createdAt: 'desc' },
            include: {
              artist: {
                include: {
                  user: true,
                },
              },
            },
          },
          appointments: {
            orderBy: { startDate: 'desc' },
            include: {
              artist: true,
            },
          },
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
          testimonials: true,
          tags: true,
          notes: {
            orderBy: { createdAt: 'desc' },
          },
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
      const { id, ...data } = input;

      try {
        const updatedCustomer = await ctx.db.customer.update({
          where: { id },
          data,
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

  // Add a note to a customer
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
        const note = await ctx.db.note.create({
          data: input,
        });

        return note;
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

  // Delete a customer note
  deleteCustomerNote: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.note.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to delete note: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
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
            tags: {
              connect: { id: input.tagId },
            },
          },
          include: {
            tags: true,
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
            tags: {
              disconnect: { id: input.tagId },
            },
          },
          include: {
            tags: true,
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
          data: input,
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

  // Get analytics data
  getAnalytics: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        metrics: safeArray(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { startDate, endDate, metrics } = input;

      // Default to last 30 days if no dates provided
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      // Format dates to match our storage format (YYYY-MM-DD)
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // Build where clause for analytics
      const where: Prisma.AnalyticsWhereInput = {
        date: {
          gte: formatDate(start),
          lte: formatDate(end),
        },
      };

      // Filter by metrics if provided
      if (metrics && metrics.length > 0) {
        where.metric = {
          in: metrics,
        };
      }

      // Get analytics data
      const analyticsData = await ctx.db.analytics.findMany({
        where,
        orderBy: [{ date: 'asc' }, { metric: 'asc' }],
      });

      // Restructure data for charting
      const groupedByDate = analyticsData.reduce(
        (acc, item) => {
          if (!acc[item.date]) {
            acc[item.date] = { date: item.date };
          }

          acc[item.date][item.metric] = item.count;
          return acc;
        },
        {} as Record<string, unknown>,
      );

      // Convert to array
      const chartData = Object.values(groupedByDate);

      // Get all available metrics
      const availableMetrics = [...new Set(analyticsData.map(item => item.metric))];

      return {
        chartData,
        availableMetrics,
      };
    }),
});
