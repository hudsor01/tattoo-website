/**
 * Dashboard Stats tRPC Router
 *
 * Provides type-safe procedures for dashboard statistics and summary data.
 * Split from dashboard-router.ts for better maintainability and organization.
 */

import { router, publicProcedure } from '@/lib/trpc/procedures';
import { prisma } from '@/lib/db/prisma';
import { formatDateRange } from '@/lib/utils/date-format';
import { Prisma, AppointmentStatus } from '@prisma/client';
import { z } from 'zod';

// Stats filter schema using Zod
const StatsFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.string().optional(),
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  compareWithPrevious: z.boolean().optional(),
});
import { handleRouterError } from '../../utils/router-error-handler';

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
  } else if (entityType === 'booking') {
    if (startDate && endDate) {
      filter['date'] = { gte: startDate, lte: endDate };
    } else if (startDate) {
      filter['date'] = { gte: startDate };
    } else if (endDate) {
      filter['date'] = { lte: endDate };
    }
  } else if (entityType === 'customer') {
    if (startDate && endDate) {
      filter['createdAt'] = { gte: startDate, lte: endDate };
    } else if (startDate) {
      filter['createdAt'] = { gte: startDate };
    } else if (endDate) {
      filter['createdAt'] = { lte: endDate };
    }
  }

  return filter;
}

/**
 * Get the date range for the previous period
 */
function getPreviousRange(startDate: Date, endDate: Date): { startDate: Date; endDate: Date } {
  const diffMs = endDate.getTime() - startDate.getTime();

  return {
    startDate: new Date(startDate.getTime() - diffMs),
    endDate: new Date(startDate.getTime() - 1), // End just before the current period starts
  };
}

/**
 * Build type-safe createdAt filter for customer queries
 */
function buildCreatedAtFilter(startDate?: Date, endDate?: Date): Prisma.CustomerWhereInput {
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

export const statsRouter = router({
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
            startTime: { gte: new Date() },
            status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          },
        }),
        prisma.appointment.count({
          where: {
            status: AppointmentStatus.COMPLETED,
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
                  lte: previousEndDate,
                },
              },
            })
          : 0,
      ]);

      // Get revenue statistics from appointments instead of payments
      const [appointmentsWithRevenue] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            ...buildDateFilter('appointment', startDate, endDate),
            status: AppointmentStatus.COMPLETED,
          },
          select: {
            id: true,
            startTime: true,
          },
        }),
        compareToPrevious && previousStartDate && previousEndDate
          ? prisma.appointment.findMany({
              where: {
                ...buildDateFilter('appointment', previousStartDate, previousEndDate),
                status: AppointmentStatus.COMPLETED,
              },
              select: {
                id: true,
                startTime: true,
              },
            })
          : [],
      ]);

      // Calculate revenue totals from completed appointments
      // We can now use the totalPrice field from the Appointment model
      const [totalRevenueFromAppointments, previousPeriodRevenueFromAppointments] = await Promise.all([
        prisma.appointment.aggregate({
          where: {
            ...buildDateFilter('appointment', startDate, endDate),
            status: AppointmentStatus.COMPLETED,
          },
          _sum: {
            totalPrice: true
          }
        }),
        compareToPrevious && previousStartDate && previousEndDate
          ? prisma.appointment.aggregate({
              where: {
                ...buildDateFilter('appointment', previousStartDate, previousEndDate),
                status: AppointmentStatus.COMPLETED,
              },
              _sum: {
                totalPrice: true
              }
            })
          : Promise.resolve({ _sum: { totalPrice: 0 } })
      ]);

      // Also check for revenue from Cal.com bookings
      const [calBookingsRevenue, previousPeriodCalBookingsRevenue] = await Promise.all([
        prisma.calBooking.aggregate({
          where: {
            startTime: { gte: startDate, lte: endDate },
            paymentStatus: 'COMPLETED',
          },
          _sum: {
            paymentAmount: true
          }
        }),
        compareToPrevious && previousStartDate && previousEndDate
          ? prisma.calBooking.aggregate({
              where: {
                startTime: { gte: previousStartDate, lte: previousEndDate },
                paymentStatus: 'COMPLETED',
              },
              _sum: {
                paymentAmount: true
              }
            })
          : Promise.resolve({ _sum: { paymentAmount: 0 } })
      ]);

      // Combine revenue from both sources
      const totalRevenue = (totalRevenueFromAppointments._sum.totalPrice ?? 0) + 
                           (calBookingsRevenue._sum.paymentAmount ?? 0);
      
      const previousPeriodRevenue = (previousPeriodRevenueFromAppointments._sum.totalPrice ?? 0) + 
                                    (previousPeriodCalBookingsRevenue._sum.paymentAmount ?? 0);

      // Calculate percentage changes
      const appointmentChange = compareToPrevious && previousPeriodAppointments > 0
        ? ((appointmentsInPeriod - previousPeriodAppointments) / previousPeriodAppointments) * 100
        : 0;

      const customerChange = compareToPrevious && previousPeriodNewCustomers > 0
        ? ((newCustomersInPeriod - previousPeriodNewCustomers) / previousPeriodNewCustomers) * 100
        : 0;

      const revenueChange = compareToPrevious && previousPeriodRevenue > 0
        ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
        : 0;

      return {
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
          completed: completedAppointments,
          inPeriod: appointmentsInPeriod,
          change: appointmentChange,
        },
        customers: {
          total: totalCustomers,
          newInPeriod: newCustomersInPeriod,
          change: customerChange,
        },
        revenue: {
          total: totalRevenue,
          inPeriod: totalRevenue,
          change: revenueChange,
          paymentsCount: appointmentsWithRevenue.length,
        },
        period: {
          label: period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      };
    } catch (error) {
      return handleRouterError(error, {
        operation: 'query',
        procedureName: 'getStats',
        routerName: 'stats',
        input
      });
    }
  }),

  getWeeklyBookings: publicProcedure.query(async () => {
    try {
      // Get last 7 days of contact submissions (since bookings are handled by Cal.com)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days including today

      const contacts = await prisma.contact.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
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

      // Create chart data for last 7 days
      const chartData = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayContacts = contacts.filter(contact => {
          const contactDate = new Date(contact.createdAt);
          return contactDate.toDateString() === date.toDateString();
        });

        chartData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          bookings: dayContacts.length, // Keep property name as 'bookings' for frontend compatibility
        });
      }

      return chartData;
    } catch (error) {
      return handleRouterError(error, {
        operation: 'query',
        procedureName: 'getWeeklyBookings',
        routerName: 'stats'
      });
    }
  }),

  getServiceDistribution: publicProcedure.query(async () => {
    try {
      // Get service distribution from appointments
      const appointments = await prisma.appointment.findMany({
        where: {
          status: { in: [AppointmentStatus.COMPLETED, AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        },
        // No title or description fields in current schema
        select: {
          id: true,
          serviceId: true, // Use serviceId instead of title
        },
      });

      // Group appointments by service type (based on title)
      const serviceMap = new Map<string, number>();
      
      appointments.forEach(appointment => {
        const serviceName = appointment.serviceId ?? 'Other';
        serviceMap.set(serviceName, (serviceMap.get(serviceName) ?? 0) + 1);
      });

      // Convert to chart data format
      const chartData = Array.from(serviceMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / appointments.length) * 100),
      }));

      // Sort by value descending
      chartData.sort((a, b) => b.value - a.value);

      return chartData;
    } catch (error) {
      return handleRouterError(error, {
        operation: 'query',
        procedureName: 'getServiceDistribution',
        routerName: 'stats'
      });
    }
  }),
});