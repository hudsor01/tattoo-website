/**
 * Dashboard tRPC Router
 *
 * Provides type-safe procedures for all dashboard-related data fetching and actions.
 * This router centralizes all dashboard functionality for better maintainability.
 */

import { z } from 'zod';
import { router, procedure } from '@/lib/trpc/server';
import { prisma } from '@/lib/db/db-client';
import { TRPCError } from '@trpc/server';
import { formatDateRange } from '@/lib/utils/date';

// Schema for statistics filtering
const StatsFilterSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
  compareToPrevious: z.boolean().optional().default(true),
});

// Schema for appointments filtering
const AppointmentsFilterSchema = z.object({
  status: z
    .enum(['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .optional()
    .default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Schema for payments filtering
const PaymentsFilterSchema = z.object({
  status: z.enum(['all', 'paid', 'pending', 'refunded', 'failed']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  period: z.enum(['all', 'today', 'week', 'month', 'year']).optional().default('all'),
});

// Define the dashboard router
export const dashboardRouter = router({
  /**
   * Get all dashboard statistics and summary data
   */
  getStats: procedure.input(StatsFilterSchema.optional()).query(async ({ input }) => {
    // Default to current month if no period specified
    const period = input?.period || 'month';
    const compareToPrevious = input?.compareToPrevious ?? true;

    try {
      // Get date ranges for filtering
      const { startDate, endDate } = formatDateRange(period);
      let previousStartDate, previousEndDate;

      if (compareToPrevious) {
        const previousRange = getPreviousRange(period, startDate, endDate);
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
          where: {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        compareToPrevious
          ? prisma.appointment.count({
              where: {
                startDate: {
                  gte: previousStartDate,
                  lte: previousEndDate,
                },
              },
            })
          : 0,
      ]);

      // Get customers counts
      const [totalCustomers, newCustomersInPeriod, previousPeriodNewCustomers] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        compareToPrevious
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

      // Get revenue statistics
      const [paymentsInPeriod, previousPeriodPayments] = await Promise.all([
        prisma.payment.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'paid',
          },
          select: {
            id: true,
            amount: true,
            createdAt: true,
          },
        }),
        compareToPrevious
          ? prisma.payment.findMany({
              where: {
                createdAt: {
                  gte: previousStartDate,
                  lte: previousEndDate,
                },
                status: 'paid',
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
        (sum: number, payment: { amount: number }) => sum + payment.amount,
        0,
      );
      const previousPeriodRevenue = previousPeriodPayments.reduce(
        (sum: number, payment: { amount: number }) => sum + payment.amount,
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
          value: `$${revenueInPeriod.toFixed(2)}`,
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
  getUpcomingAppointments: procedure.input(AppointmentsFilterSchema).query(async ({ input }) => {
    const { status, limit, page, startDate, endDate } = input;
    const skip = (page - 1) * limit;

    try {
      // Build the where clause
      const where: Record<string, unknown> = {};

      // Filter by status if not "all"
      if (status !== 'all') {
        where['status'] = status;
      }

      // Default to upcoming appointments if no date range provided
      if (!startDate && !endDate) {
        where['startDate'] = { gte: new Date() };
      } else {
        // Apply custom date range if provided
        where['startDate'] = {};
        if (startDate) (where['startDate'] as { gte?: Date; lte?: Date }).gte = new Date(startDate);
        if (endDate) (where['startDate'] as { gte?: Date; lte?: Date }).lte = new Date(endDate);
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
            customer: {
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

      // Format the appointments
      type AppointmentCustomer = {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
      };

      type AppointmentType = {
        id: string;
        title: string;
        startDate: Date;
        endDate: Date;
        status: string;
        customerId: string;
        customer: AppointmentCustomer;
        deposit?: number | null;
        totalPrice?: number | null;
        description?: string | null;
      };

      const formattedAppointments = appointments.map((appointment: AppointmentType) => ({
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startDate.toISOString(),
        endTime: appointment.endDate.toISOString(),
        status: appointment.status,
        customerId: appointment.customerId,
        clientName: `${appointment.customer.firstName} ${appointment.customer.lastName}`.trim(),
        clientEmail: appointment.customer.email,
        clientPhone: appointment.customer.phone || '',
        depositPaid: appointment.deposit ? true : false,
        depositAmount: appointment.deposit || 0,
        price: appointment.totalPrice || 0,
        description: appointment.description || '',
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
  getRecentPayments: procedure.input(PaymentsFilterSchema).query(async ({ input }) => {
    const { status, limit, page, period } = input;
    const skip = (page - 1) * limit;

    try {
      // Build the where clause
      const where: Record<string, unknown> = {};

      // Filter by status if not "all"
      if (status !== 'all') {
        where['status'] = status;
      }

      // Filter by period if not "all"
      if (period !== 'all') {
        const { startDate, endDate } = formatDateRange(period);
        where['createdAt'] = {
          gte: startDate,
          lte: endDate,
        };
      }

      // Define PaymentType before usage
      type PaymentCustomer = {
        firstName: string;
        lastName: string;
        email: string;
      };

      type PaymentAppointment = {
        title: string;
        id: string;
      };

      type PaymentType = {
        id: string;
        amount: number;
        status: string;
        paymentMethod: string;
        createdAt: Date;
        customerId: string;
        customer: PaymentCustomer | null;
        appointmentId: string;
        appointment: PaymentAppointment | null;
      };

      // Get payments with count for pagination
      const [payments, totalCount]: [PaymentType[], number] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            appointment: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      // Calculate totals for the period
      const totalAmount = payments.reduce(
        (sum: number, payment: { amount: number }) => sum + payment.amount,
        0,
      );

      const formattedPayments = payments.map((payment: PaymentType) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        date: payment.createdAt.toISOString(),
        customerId: payment.customerId,
        clientName: payment.customer
          ? `${payment.customer.firstName} ${payment.customer.lastName}`.trim()
          : 'Unknown',
        clientEmail: payment.customer?.email || '',
        appointmentId: payment.appointmentId,
        appointmentTitle: payment.appointment?.title || null,
      }));

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

  getNotifications: procedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional().default(5),
      }),
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
            customer: {
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
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
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
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),
        ]);

        // Format notifications
        type NotificationCustomer = {
          firstName: string;
          lastName: string;
        };

        type NotificationAppointment = {
          id: string;
          title: string;
          customer: NotificationCustomer;
          startDate: Date;
          status: string;
        };

        const notifications = upcomingAppointments.map((appointment: NotificationAppointment) => ({
          id: appointment.id,
          type: 'appointment',
          title: `Upcoming: ${appointment.title}`,
          message: `${appointment.customer.firstName} ${appointment.customer.lastName} - ${formatAppointmentTime(appointment.startDate)}`,
          time: appointment.startDate.toISOString(),
          status: appointment.status,
          link: `/admin/dashboard/appointments?id=${appointment.id}`,
        }));

        // Format activity feed (merge and sort by date)
        type ActivityPayment = {
          id: string;
          customer: NotificationCustomer | null;
          amount: number;
          createdAt: Date;
        };

        type ActivityCustomer = {
          id: string;
          firstName: string;
          lastName: string;
          createdAt: Date;
        };

        type ActivityCompletedAppointment = {
          id: string;
          title: string;
          customer: NotificationCustomer;
          updatedAt: Date;
        };

        const activityItems = [
          ...recentPayments.map((payment: ActivityPayment) => ({
            id: `payment-${payment.id}`,
            type: 'payment',
            title: 'Payment Received',
            message: `${payment.customer?.firstName ?? ''} ${payment.customer?.lastName ?? ''} paid $${payment.amount.toFixed(2)}`,
            time: payment.createdAt.toISOString(),
            link: `/admin/dashboard/payments?id=${payment.id}`,
          })),
          ...recentCustomers.map((customer: ActivityCustomer) => ({
            id: `customer-${customer.id}`,
            type: 'customer',
            title: 'New Customer',
            message: `${customer.firstName} ${customer.lastName} signed up`,
            time: customer.createdAt.toISOString(),
            link: `/admin/dashboard/customers?id=${customer.id}`,
          })),
          ...completedAppointments.map((appointment: ActivityCompletedAppointment) => ({
            id: `completed-${appointment.id}`,
            type: 'completed',
            title: 'Appointment Completed',
            message: `${appointment.title} with ${appointment.customer.firstName} ${appointment.customer.lastName}`,
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
  confirmAppointment: procedure.input(z.string()).mutation(async ({ input: appointmentId }) => {
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
        data: { status: 'confirmed' },
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

// Helper functions

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function calculateCompletionRate(completed: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((completed / total) * 100)}%`;
}

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
      return 'Current Period';
  }
}

function formatAppointmentTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
// Helper function to get the previous period's date range
function getPreviousRange(
  period: string,
  startDate: Date,
  endDate: Date,
): { startDate: Date; endDate: Date } {
  const durationMs = endDate.getTime() - startDate.getTime();

  const previousStartDate = new Date(startDate);
  previousStartDate.setTime(previousStartDate.getTime() - durationMs);

  const previousEndDate = new Date(previousStartDate);
  previousEndDate.setTime(previousEndDate.getTime() + durationMs);

  return { startDate: previousStartDate, endDate: previousEndDate };
}
