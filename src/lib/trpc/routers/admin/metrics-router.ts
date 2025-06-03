/**
 * Admin Metrics Router
 *
 * This router handles all metrics and stats-related admin operations
 * for the dashboard and analytics features.
 */
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';

/**
 * Admin metrics router with all metrics and stats procedures
 */
export const adminMetricsRouter = router({
  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    try {
      // Get counts from different entities with proper error handling
      const [
        usersCount,
        customersCount,
        designsCount,
        testimonialsCount
      ] = await Promise.all([
        ctx.prisma.user.count().catch(error => {
          logger.error('Error counting users', { error });
          return 0;
        }),
        ctx.prisma.customer.count().catch(error => {
          logger.error('Error counting customers', { error });
          return 0;
        }),
        // Designs count - set to 0 for now as there's no design model
        Promise.resolve(0),
        // Testimonials count - set to 0 for now as there's no testimonial field
        Promise.resolve(0)
      ]);

      // Get booking and appointment counts from Cal.com integration
      // These were stubs in the original implementation
      // Now we're implementing proper queries
      const bookingsCount = await ctx.prisma.calBooking.count().catch(error => {
        logger.error('Error counting Cal.com bookings', { error });
        return 0;
      });

      const appointmentsCount = await ctx.prisma.appointment.count().catch(error => {
        logger.error('Error counting appointments', { error });
        return 0;
      });

      // Get artist count - using users with artist role
      const artistsCount = await ctx.prisma.user.count({
        where: {
          role: 'artist'
        }
      }).catch(error => {
        logger.error('Error counting artists', { error });
        return 0;
      });

      // Get recent bookings with customer info
      const recentBookings = await ctx.prisma.calBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }).catch(error => {
        logger.error('Error fetching recent bookings', { error });
        return [];
      });

      // Get event types for recent bookings to map service names
      const recentBookingEventTypeIds = [...new Set(recentBookings.map(b => b.eventTypeId))];
      const recentEventTypes = await ctx.prisma.calEventType.findMany({
        where: {
          calEventTypeId: {
            in: recentBookingEventTypeIds,
          },
        },
        select: {
          calEventTypeId: true,
          title: true,
        },
      }).catch(error => {
        logger.error('Error fetching event types for recent bookings', { error });
        return [];
      });

      // Create event type lookup map
      const eventTypeNameMap = new Map(
        recentEventTypes.map(et => [et.calEventTypeId, et.title])
      );

      // Enhance bookings with proper service names and customer names
      const enhancedRecentBookings = recentBookings.map(booking => ({
        ...booking,
        serviceName: eventTypeNameMap.get(booking.eventTypeId) ?? booking.serviceName,
        customer: booking.customer ? {
          ...booking.customer,
          name: `${booking.customer.firstName} ${booking.customer.lastName}`.trim() || booking.customer.email
        } : null
      }));

      // Get upcoming appointments with customer info
      const upcomingAppointments = await ctx.prisma.appointment.findMany({
        where: {
          startTime: {
            gte: new Date()
          }
        },
        take: 5,
        orderBy: { startTime: 'asc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }).catch(error => {
        logger.error('Error fetching upcoming appointments', { error });
        return [];
      });

      // Enhance appointments with customer names
      const enhancedAppointments = upcomingAppointments.map(appointment => ({
        ...appointment,
        customer: appointment.customer ? {
          ...appointment.customer,
          name: `${appointment.customer.firstName} ${appointment.customer.lastName}`.trim() || appointment.customer.email
        } : null
      }));

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
        recentActivity: {
          bookings: enhancedRecentBookings,
          appointments: enhancedAppointments,
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard stats', { error });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }),

  /**
   * Get booking statistics with time range filtering
   */
  getBookingStats: adminProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        interval: z.enum(['day', 'week', 'month']).default('day')
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { startDate, endDate, interval } = input;
        
        // Parse dates or use defaults
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        
        // Build date filter
        const dateFilter = {
          createdAt: {
            gte: start,
            lte: end,
          },
        };

        // Get booking counts
        const totalBookings = await ctx.prisma.calBooking.count({
          where: dateFilter,
        });

        // Get completed bookings (those with COMPLETED status)
        const completedBookings = await ctx.prisma.calBooking.count({
          where: {
            ...dateFilter,
            status: 'COMPLETED',
          },
        });

        // Get conversion rate
        const conversionRate = totalBookings > 0 
          ? (completedBookings / totalBookings) * 100
          : 0;

        // Get bookings by service type with names
        const bookingsByService = await ctx.prisma.calBooking.groupBy({
          by: ['eventTypeId'],
          _count: {
            id: true,
          },
          where: dateFilter,
        });

        // Get event type details for service name mapping
        const eventTypeIds = bookingsByService.map(booking => booking.eventTypeId);
        const eventTypes = await ctx.prisma.calEventType.findMany({
          where: {
            calEventTypeId: {
              in: eventTypeIds,
            },
          },
          select: {
            calEventTypeId: true,
            title: true,
            slug: true,
            price: true,
            currency: true,
          },
        });

        // Create a lookup map for efficient service name mapping
        const eventTypeLookup = new Map(
          eventTypes.map(et => [et.calEventTypeId, {
            name: et.title,
            slug: et.slug,
            price: et.price,
            currency: et.currency,
          }])
        );

        // Map bookings with service names
        const bookingsByServiceWithNames = bookingsByService.map(booking => ({
          eventTypeId: booking.eventTypeId,
          serviceName: eventTypeLookup.get(booking.eventTypeId)?.name ?? `Service #${booking.eventTypeId}`,
          serviceSlug: eventTypeLookup.get(booking.eventTypeId)?.slug ?? '',
          servicePrice: eventTypeLookup.get(booking.eventTypeId)?.price ?? 0,
          serviceCurrency: eventTypeLookup.get(booking.eventTypeId)?.currency ?? 'USD',
          count: booking._count.id,
        }));

        return {
          totalBookings,
          completedBookings,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          bookingsByService: bookingsByServiceWithNames,
          timeRange: {
            start: start.toISOString(),
            end: end.toISOString(),
            interval,
          },
        };
      } catch (error) {
        logger.error('Error getting booking stats', { error });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch booking statistics',
        });
      }
    }),
  
  /**
   * Get customer growth statistics
   */
  getCustomerGrowthStats: adminProcedure
    .input(
      z.object({
        months: z.number().int().min(1).max(24).default(12),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const { months } = input;
        
        // Calculate start date based on number of months
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        
        // Get all customers created within the time range
        const customers = await ctx.prisma.customer.findMany({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
        
        // Group by month for the chart
        const monthlyGrowth: Record<string, number> = {};
        
        // Initialize all months with 0
        for (let i = 0; i < months; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyGrowth[monthKey] = 0;
        }
        
        // Count customers by month
        customers.forEach(customer => {
          const date = new Date(customer.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] ?? 0) + 1;
        });
        
        // Calculate total and growth rate
        const totalNewCustomers = customers.length;
        
        // Format for chart display (convert object to array)
        const growthData = Object.entries(monthlyGrowth).map(([month, count]) => ({
          month,
          count,
        })).sort((a, b) => a.month.localeCompare(b.month));
        
        return {
          totalNewCustomers,
          growthByMonth: growthData,
          timeRange: {
            startDate: startDate.toISOString(),
            endDate: new Date().toISOString(),
          },
        };
      } catch (error) {
        logger.error('Error getting customer growth stats', { error });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer growth statistics',
        });
      }
    }),
});