/**
 * Dashboard tRPC Router
 *
 * Provides type-safe procedures for all dashboard-related data fetching and actions.
 * This router centralizes all dashboard functionality for better maintainability.
 * 
 * TYPESCRIPT ERROR FIXES (2023-05-21):
 * - Fixed issues with exactOptionalPropertyTypes: true for Prisma filters
 * - Updated optional filter properties to use conditional spreading pattern instead of undefined assignments
 * - Implemented strict null/undefined checks for object property access
 * - Added proper type narrowing throughout the query handlers
 * - Fixed TS2532 error for accessing possibly undefined chartData[dayIndex].bookings using optional chaining
 */

import { z } from 'zod';
import { router, publicProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { TRPCError } from '@trpc/server';
import { formatDateRange } from '@/lib/utils/date-format';
import { sanitizeForPrisma } from '@/lib/utils/prisma-helper';
import { Prisma } from '@prisma/client';

// Schema for statistics filtering
const StatsFilterSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
  compareToPrevious: z.boolean().optional().default(true),
});

// Schema for appointments filtering
const AppointmentsFilterSchema = z.object({
  status: z
    .enum(['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .optional()
    .default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Schema for payments filtering
const PaymentsFilterSchema = z.object({
  status: z.enum(['all', 'verified', 'pending', 'failed']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  period: z.enum(['all', 'today', 'week', 'month', 'year']).optional().default('all'),
});

// Helper functions

/**
 * Helper function to build type-safe date filters for appointment queries
 * Prevents Prisma exactOptionalPropertyTypes errors by only including properties when values exist
 */
function buildDateFilter(
  entityType: 'appointment' | 'booking' | 'customer',
  startDate?: Date,
  endDate?: Date
): Record<string, { gte?: Date; lte?: Date }> {
  const filter: Record<string, { gte?: Date; lte?: Date }> = {};
  
  if (entityType === 'appointment') {
    if (startDate && endDate) {
      filter['startDate'] = { gte: startDate };
      filter['endDate'] = { lte: endDate };
    } else if (startDate) {
      filter['startDate'] = { gte: startDate };
    } else if (endDate) {
      filter['endDate'] = { lte: endDate };
    }
  }
  
  return filter;
}

/**
 * Calculate percentage change between current and previous values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate completion rate as a percentage string
 */
function calculateCompletionRate(completed: number, total: number): string {
  if (total === 0) {
    return '0%';
  }
  const rate = Math.round((completed / total) * 100);
  return `${rate}%`;
}

/**
 * Get user-friendly label for a time period
 */
function getPeriodLabel(period: string): string {
  switch (period) {
    case 'today':
      return 'Today';
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'year':
      return 'This Year';
    default:
      return 'Custom Period';
  }
}

/**
 * Format appointment start time for display
 */
function formatAppointmentTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get the date range for the previous period
 */
function getPreviousRange(
  startDate: Date,
  endDate: Date
): { startDate: Date; endDate: Date } {
  const diffMs = endDate.getTime() - startDate.getTime();
  
  return {
    startDate: new Date(startDate.getTime() - diffMs),
    endDate: new Date(startDate.getTime() - 1) // End just before the current period starts
  };
}

/**
 * Build type-safe createdAt filter for customer queries
 */
function buildCreatedAtFilter(
  startDate?: Date,
  endDate?: Date
): Prisma.CustomerWhereInput {
  const where: Prisma.CustomerWhereInput = {};
  
  if (startDate || endDate) {
    const createdAt: Prisma.DateTimeFilter = {};
    
    if (startDate) {
      createdAt.gte = startDate;
    }
    
    if (endDate) {
      createdAt.lte = endDate;
    }
    
    where.createdAt = createdAt;
  }
  
  return where;
}

// Define the dashboard router
export const dashboardRouter = router({
  /**
   * Get all dashboard statistics and summary data
   */
  getStats: publicProcedure.input(StatsFilterSchema.optional()).query(async ({ input }) => {
    // Default to current month if no period specified
    const period = input?.period ?? 'month';
    const compareToPrevious = input?.compareToPrevious ?? true;

    try {
      // Get date ranges for filtering
      const { startDate, endDate } = formatDateRange(period);
      let previousStartDate, previousEndDate;

      if (compareToPrevious) {
        const previousRange = getPreviousRange(startDate, endDate);
        previousStartDate = previousRange.startDate;
        previousEndDate = previousRange.endDate;
      }

      // Get appointments counts
      const [
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        appointmentsInPeriod,
        previousPeriodAppointments,
      ] = await Promise.all([
        prisma.appointment.count(),
        prisma.appointment.count({
          where: {
            startDate: { gte: new Date() },
            status: { in: ['scheduled', 'confirmed'] },
          },
        }),
        prisma.appointment.count({
          where: {
            status: 'completed',
          },
        }),
        prisma.appointment.count({
          where: buildDateFilter('appointment', startDate, endDate),
        }),
        compareToPrevious
          ? prisma.appointment.count({
              where: buildDateFilter('appointment', previousStartDate, previousEndDate),
            })
          : 0,
      ]);

      // Get customers counts
      const [totalCustomers, newCustomersInPeriod, previousPeriodNewCustomers] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({
          where: buildCreatedAtFilter(startDate, endDate),
        }),
        compareToPrevious && previousStartDate && previousEndDate
          ? prisma.customer.count({
              where: {
                createdAt: { 
                  gte: previousStartDate,
                  lte: previousEndDate 
                },
              },
            })
          : 0,
      ]);

      // Get revenue statistics
      const [paymentsInPeriod, previousPeriodPayments] = await Promise.all([
        prisma.payment.findMany({
          where: {
            ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {}),
            status: 'verified',
          },
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        }),
        compareToPrevious && previousStartDate && previousEndDate
          ? prisma.payment.findMany({
              where: {
                createdAt: { 
                  gte: previousStartDate,
                  lte: previousEndDate 
                },
                status: 'verified',
              },
              select: {
                id: true,
                amount: true,
                createdAt: true,
              },
            })
          : [],
      ]);

      // Calculate revenue totals
      const revenueInPeriod = paymentsInPeriod.reduce(
        (sum: number, payment) => sum + payment.amount,
        0,
      );
      const previousPeriodRevenue = previousPeriodPayments.reduce(
        (sum: number, payment) => sum + payment.amount,
        0,
      );

      // Calculate percentage changes
      const appointmentsChange = calculatePercentageChange(
        appointmentsInPeriod,
        previousPeriodAppointments,
      );
      const customersChange = calculatePercentageChange(
        newCustomersInPeriod,
        previousPeriodNewCustomers,
      );
      const revenueChange = calculatePercentageChange(revenueInPeriod, previousPeriodRevenue);

      // Format the stats as cards for the dashboard
      const stats = [
        {
          title: 'Appointments',
          value: appointmentsInPeriod.toString(),
          change: appointmentsChange > 0 ? `+${appointmentsChange}%` : `${appointmentsChange}%`,
          description: `${upcomingAppointments} upcoming`,
          color: '#3b82f6', // blue
          icon: 'CalendarIcon',
          link: '/admin/dashboard/appointments',
        },
        {
          title: 'New Customers',
          value: newCustomersInPeriod.toString(),
          change: customersChange > 0 ? `+${customersChange}%` : `${customersChange}%`,
          description: `${totalCustomers} total customers`,
          color: '#10b981', // green
          icon: 'PersonIcon',
          link: '/admin/dashboard/customers',
        },
        {
          title: 'Revenue',
          value: `$${typeof revenueInPeriod === 'number' ? revenueInPeriod.toFixed(2) : '0.00'}`,
          change: revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`,
          description: `From ${period}ly payments`,
          color: '#d62828', // red
          icon: 'PaymentIcon',
          link: '/admin/dashboard/payments',
        },
        {
          title: 'Completion Rate',
          value: calculateCompletionRate(completedAppointments, totalAppointments),
          change: '',
          description: `${completedAppointments} completed sessions`,
          color: '#8b5cf6', // purple
          icon: 'ScheduleIcon',
          link: '/admin/dashboard/appointments?status=completed',
        },
      ];

      return {
        stats,
        summary: {
          appointments: {
            total: totalAppointments,
            upcoming: upcomingAppointments,
            completed: completedAppointments,
            period: appointmentsInPeriod,
            change: appointmentsChange,
          },
          customers: {
            total: totalCustomers,
            new: newCustomersInPeriod,
            change: customersChange,
          },
          revenue: {
            period: revenueInPeriod,
            previous: previousPeriodRevenue,
            change: revenueChange,
          },
          completionRate: parseInt(
            calculateCompletionRate(completedAppointments, totalAppointments),
          ),
          period: {
            label: getPeriodLabel(period),
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
        totalCustomers,
        pendingBookings: upcomingAppointments,
        completedAppointments,
        recentMessages: 0, // Default value
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch dashboard statistics',
        cause: error,
      });
    }
  }),

  /**
   * Get upcoming appointments for the dashboard
   */
  getUpcomingAppointments: publicProcedure.input(AppointmentsFilterSchema).query(async ({ input }) => {
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
        where.startDate = { gte: new Date() };
      } else {
        // Apply custom date range if provided
        const dateFilter: Prisma.DateTimeFilter = {};
        
        if (startDate) {
          dateFilter.gte = new Date(startDate);
        }
        
        if (endDate) {
          dateFilter.lte = new Date(endDate);
        }
        
        where.startDate = dateFilter;
      }

      // Get appointments with count for pagination
      const [appointments, totalCount] = await Promise.all([
        prisma.appointment.findMany({
          where,
          orderBy: {
            startDate: 'asc',
          },
          skip,
          take: limit,
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
        }),
        prisma.appointment.count({ where }),
      ]);

      // Format the appointments using the correct field names
      const formattedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startDate.toISOString(),
        endTime: appointment.endDate.toISOString(),
        status: appointment.status,
        customerId: appointment.customerId,
        clientName: `${appointment.Customer.firstName ?? ''} ${appointment.Customer.lastName ?? ''}`.trim(),
        clientEmail: appointment.Customer.email ?? '',
        clientPhone: appointment.Customer.phone ?? '',
        depositPaid: appointment.deposit ? true : false,
        depositAmount: appointment.deposit ?? 0,
        price: appointment.totalPrice ?? 0,
        description: appointment.description ?? '',
      }));

      // Return with pagination info
      return {
        appointments: formattedAppointments,
        pagination: {
          total: totalCount,
          page,
          limit,
          pageCount: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch upcoming appointments',
        cause: error,
      });
    }
  }),

  /**
   * Get recent payments for the dashboard
   */
  getRecentPayments: publicProcedure.input(PaymentsFilterSchema).query(async ({ input }) => {
    const { status, limit, page, period } = input;
    const skip = (page - 1) * limit;

    try {
      // Build the where clause using type-safe techniques
      const where: Prisma.PaymentWhereInput = {};

      // Filter by status if not "all"
      if (status !== 'all') {
        where.status = status;
      }

      // Filter by period if not "all"
      if (period !== 'all') {
        const { startDate, endDate } = formatDateRange(period);
        
        if (startDate && endDate) {
          where.createdAt = {
            gte: startDate,
            lte: endDate,
          };
        }
      }

      // Get payments with count for pagination
      const [payments, totalCount] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
          include: {
            Booking: {
              select: {
                Customer: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  }
                },
                Appointment: {
                  select: {
                    id: true,
                    title: true,
                  }
                }
              }
            }
          },
        }),
        prisma.payment.count({ where }),
      ]);

      // Calculate totals for the period
      const totalAmount = payments.reduce(
        (sum: number, payment) => sum + payment.amount,
        0,
      );

      const formattedPayments = payments.map((payment) => {
        const customer = payment.Booking?.Customer;
        const appointment = payment.Booking?.Appointment;
        return {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          date: payment.createdAt.toISOString(),
          customerId: customer?.id ?? '',
          clientName: customer 
            ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
            : payment.customerName ?? 'Unknown',
          clientEmail: customer?.email ?? payment.customerEmail ?? '',
          appointmentId: appointment?.id ?? '',
          appointmentTitle: appointment?.title ?? null,
          bookingId: payment.bookingId
        };
      });

      // Return with pagination info
      return {
        payments: formattedPayments,
        pagination: {
          total: totalCount,
          page,
          limit,
          pageCount: Math.ceil(totalCount / limit),
        },
        totalAmount,
      };
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent payments',
        cause: error,
      });
    }
  }),
  
  /**
   * Get recent bookings for the dashboard
   */
  getRecentBookings: publicProcedure.input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(10),
      cursor: z.number().optional(),
      status: z.string().optional(),
    })
  ).query(async ({ input }) => {
    const { limit, cursor, status } = input;
    
    try {
      // Build the where clause using type-safe techniques
      const where: Prisma.BookingWhereInput = {};
      
      // Filter by status if provided
      // Using proper type assertion for BookingWhereInput with status field
      if (status && status !== 'all') {
        (where as Prisma.BookingWhereInput & { status?: string }).status = status;
      }
      
      // Get total count for pagination info
      const totalCount = await prisma.booking.count({ where });
      
      // Build query options for cursor-based pagination
      const queryOptions: Prisma.BookingFindManyArgs = {
        where,
        take: limit + 1, // Take one extra to determine if there are more
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              address: true,
              city: true,
              state: true,
            }
          },
          Appointment: {
            select: {
              id: true,
              startDate: true,
              status: true,
              designNotes: true,
            }
          }
        }
      };
      
      // Add cursor if provided
      if (cursor) {
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1; // Skip the cursor item
      }
      
      const bookings = await prisma.booking.findMany(queryOptions);
      
      // Check if there are more items
      let nextCursor: number | null = null;
      if (bookings.length > limit) {
        const nextItem = bookings.pop();
        nextCursor = nextItem ? nextItem.id : null;
      }
      
      // Return the properly formatted response
      return {
        bookings: bookings.map(booking => ({
          id: booking.id,
          customerId: booking.customerId,
          appointmentId: null, // appointmentId field not available in Booking model
          name: booking.name,
          email: booking.email,
          tattooType: booking.tattooType,
          size: booking.size,
          placement: booking.placement,
          description: booking.description,
          estimatedPrice: null, // Not available in Booking model
          preferredDate: booking.preferredDate?.toISOString(),
          status: booking.calStatus ?? (booking.depositPaid ? 'confirmed' : 'pending'),
          depositPaid: booking.depositPaid,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          Customer: null, // Customer relationship not included in this query
        })),
        nextCursor,
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent bookings',
        cause: error
      });
    }
  }),
  
  /**
   * Get weekly booking data for charts
   */
  getWeeklyBookings: publicProcedure.query(async () => {
    try {
      // Get start and end dates for the current week
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Get bookings for each day of the week
      const bookings = await prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        },
        select: {
          createdAt: true
        }
      });
      
      // Initialize days of the week
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = daysOfWeek.map(day => ({ name: day, bookings: 0 }));
      
      // Count bookings for each day with proper null checks
      bookings.forEach(booking => {
        const dayIndex = booking.createdAt.getDay();
        if (dayIndex >= 0 && dayIndex < chartData.length && chartData[dayIndex]) {
          chartData[dayIndex].bookings += 1;
        }
      });
      
      return chartData;
    } catch (error) {
      console.error('Error fetching weekly bookings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch weekly booking data',
        cause: error
      });
    }
  }),
  
  /**
   * Get service distribution data for pie charts
   */
  getServiceDistribution: publicProcedure.query(async () => {
    try {
      // Get count of bookings by tattoo type
      const bookingsByType = await prisma.booking.groupBy({
        by: ['tattooType'],
        _count: {
          id: true
        }
      });
      
      // Define colors for pie chart
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'];
      
      // Format data for pie chart
      const pieData = bookingsByType.map((item, index) => ({
        name: item.tattooType ?? 'Unknown',
        value: item._count.id,
        color: colors[index % colors.length]
      }));
      
      return pieData;
    } catch (error) {
      console.error('Error fetching service distribution:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch service distribution data',
        cause: error
      });
    }
  }),
  
  /**
   * Get recent contacts for the dashboard
   getRecentContacts: publicProcedure.input(
z.object({
limit: z.number().min(1).max(50).optional().default(10)
})
).query(async ({ input }) => { {
    const { limit } = input;
    
    try {
      const contacts = await prisma.contact.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      });
      
      return contacts.map(contact => ({
        id: contact.id.toString(),
        firstName: contact.Customer?.firstName ?? contact.name.split(' ')[0] ?? '',
        lastName: contact.Customer?.lastName ?? (contact.name.split(' ').length > 1 ? contact.name.split(' ').slice(1).join(' ') : ''),
        email: contact.Customer?.email ?? contact.email,
        phone: contact.Customer?.phone ?? '',
        message: contact.message,
        createdAt: contact.createdAt.toISOString()
      }));
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent contacts',
        cause: error
      });
    }
  }),
  
  /**
   * Get recent activity for the activity feed
   */
  getRecentActivity: publicProcedure.input(
    z.object({
      limit: z.number().min(1).max(50).optional().default(5)
    })
  ).query(async ({ input }) => {
    const { limit } = input;
    
    try {
      // Get recent bookings
      const recentBookings = await prisma.booking.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          Customer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Get recent appointments
      const recentAppointments = await prisma.appointment.findMany({
        take: limit,
        orderBy: {
          updatedAt: 'desc'
        },
        where: {
          status: 'completed'
        },
        include: {
          Customer: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      // Format activity data
      const bookingActivities = recentBookings.map(booking => ({
        id: `booking-${booking.id}`,
        type: 'booking',
        message: `New booking: ${booking.name ?? `${booking.Customer?.firstName ?? ''} ${booking.Customer?.lastName ?? ''}`.trim()} booked a ${booking.tattooType} session`,
        timestamp: booking.createdAt.toISOString()
      }));
      
      const appointmentActivities = recentAppointments.map(appointment => ({
        id: `appointment-${appointment.id}`,
        type: 'appointment',
        message: `Appointment completed: ${appointment.title} with ${appointment.Customer.firstName} ${appointment.Customer.lastName}`,
        timestamp: appointment.updatedAt.toISOString()
      }));
      
      // Combine and sort activities
      return [...bookingActivities, ...appointmentActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recent activity',
        cause: error
      });
    }
  }),

  getNotifications: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(5),
      })
    )
    .query(async ({ input }) => {
      const { limit } = input;

      try {
        // Get all upcoming appointments for notifications
        const upcomingAppointments = await prisma.appointment.findMany({
          where: {
            startDate: { gte: new Date() },
            status: { in: ['scheduled', 'confirmed'] },
          },
          orderBy: {
            startDate: 'asc',
          },
          take: limit,
          include: {
            Customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        // Get recent activity (payments, new customers, appointments)
        const [recentPayments, recentCustomers, completedAppointments] = await Promise.all([
          prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
              Booking: {
                select: {
                  Customer: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
          }),
          prisma.appointment.findMany({
            where: { status: 'completed' },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            include: {
              Customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),
        ]);

        const notifications = upcomingAppointments.map((appointment) => ({
          id: appointment.id,
          type: 'appointment',
          title: `Upcoming: ${appointment.title}`,
          message: `${appointment.Customer.firstName} ${appointment.Customer.lastName} - ${formatAppointmentTime(appointment.startDate)}`,
          time: appointment.startDate.toISOString(),
          status: appointment.status,
          link: `/admin/dashboard/appointments?id=${appointment.id}`,
        }));

        const activityItems = [
          ...recentPayments.map((payment) => {
            // Extract name from payment record directly since Booking.Customer relationship changed
            const names = payment.customerName ? payment.customerName.split(' ') : ['', ''];
            const firstName = names[0] ?? '';
            const lastName = names.slice(1).join(' ') ?? '';
            
            return {
              id: `payment-${payment.id}`,
              type: 'payment',
              title: 'Payment Received',
              message: `${firstName} ${lastName} paid $${payment.amount.toFixed(2)}`,
              time: payment.createdAt.toISOString(),
              link: `/admin/dashboard/payments?id=${payment.id}`,
            };
          }),
          ...recentCustomers.map((customer) => ({
            id: `customer-${customer.id}`,
            type: 'customer',
            title: 'New Customer',
            message: `${customer.firstName} ${customer.lastName} signed up`,
            time: customer.createdAt.toISOString(),
            link: `/admin/dashboard/customers?id=${customer.id}`,
          })),
          ...completedAppointments.map((appointment) => ({
            id: `completed-${appointment.id}`,
            type: 'completed',
            title: 'Appointment Completed',
            message: `${appointment.title} with ${appointment.Customer.firstName} ${appointment.Customer.lastName}`,
            time: appointment.updatedAt.toISOString(),
            link: `/admin/dashboard/appointments?id=${appointment.id}`,
          })),
        ]
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, limit);

        return {
          notifications,
          activity: activityItems,
        };
      } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications',
          cause: error,
        });
      }
    }),

  confirmAppointment: publicProcedure.input(z.string()).mutation(async ({ input: appointmentId }) => {
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
          updatedAt: new Date()
        }),
      });

      return {
        success: true,
        appointment: updatedAppointment,
      };
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to confirm appointment',
        cause: error,
      });
    }
  }),
});