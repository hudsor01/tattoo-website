import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, adminProcedure } from '../procedures';
import { prisma } from '@/lib/db/prisma';
import { Prisma, PaymentStatus } from '@prisma/client';
// Types are imported directly from @prisma/client as needed
import { logger } from '@/lib/logger';

/**
 * Admin-only payment router for business intelligence and dashboard features.
 * Customer-facing payment operations are handled by Cal.com.
 */
export const paymentsRouter = router({
  /**
   * Admin: Get payment by ID with full details
   */
  getPaymentById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    try {
      // Now using actual Payment model with relations
      const payment = await prisma.payment.findUnique({
        where: { id: input.id },
        include: {
          customer: true,
          booking: true,
          appointment: true,
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found',
        });
      }

      return payment;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error fetching payment',
        cause: error,
      });
    }
  }),

  /**
   * Admin: Get all payments with filtering
   */
  getAllPayments: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().nullish(),
        status: z.nativeEnum(PaymentStatus).optional(),
        customerId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const where: Prisma.BookingWhereInput = {};

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
          where.createdAt = dateFilter;
        }

        const bookings = await prisma.booking.findMany({
          where,
          include: {
            customer: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor } }),
        });

        let nextCursor: number | undefined;
        if (bookings.length > input.limit) {
          const nextItem = bookings.pop();
          nextCursor = nextItem?.id;
        }

        // Transform bookings to payment-like structure
        const payments = bookings.map(booking => ({
          id: booking.id,
          amount: booking.totalCost,
          status: booking.status,
          customerEmail: booking.customer.email,
          customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
        }));

        return {
          items: payments,
          nextCursor,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching payments',
          cause: error,
        });
      }
    }),

  /**
   * Get payment statistics for admin dashboard
   */
  getPaymentStats: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        timeRange: z.enum(['week', 'month', 'year']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const where: Prisma.BookingWhereInput = {};

        // Handle time range if provided
        if (input.timeRange) {
          const now = new Date();
          let startDate: Date;
          
          switch (input.timeRange) {
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }
          
          where.createdAt = {
            gte: startDate,
            lte: now,
          };
        } else if (input.startDate || input.endDate) {
          where.createdAt = {};
          if (input.startDate) {
            where.createdAt.gte = input.startDate;
          }
          if (input.endDate) {
            where.createdAt.lte = input.endDate;
          }
        }

        const [totalRevenue, totalPayments, paymentsByStatus, averagePayment, topServices] = await Promise.all([
          // Total revenue (completed bookings only)
          prisma.booking.aggregate({
            where: { ...where, status: PaymentStatus.COMPLETED },
            _sum: { totalCost: true },
          }),

          // Total number of bookings/payments
          prisma.booking.count({ where }),

          // Bookings by status
          prisma.booking.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
            _sum: { totalCost: true },
          }),

          // Average booking amount
          prisma.booking.aggregate({
            where,
            _avg: { totalCost: true },
          }),

          // Top services by revenue
          prisma.booking.groupBy({
            by: ['tattooType'],
            where: {
              createdAt: where.createdAt,
            },
            _count: { id: true },
            _sum: { totalCost: true },
          }),
        ]);

        // Calculate additional metrics
        const paidAmount = paymentsByStatus.find(p => p.status === PaymentStatus.COMPLETED)?._sum.totalCost ?? 0;
        const pendingAmount = paymentsByStatus.find(p => p.status === PaymentStatus.PENDING)?._sum.totalCost ?? 0;
        const failedAmount = paymentsByStatus.find(p => p.status === PaymentStatus.FAILED)?._sum.totalCost ?? 0;
        
        const paidCount = paymentsByStatus.find(p => p.status === PaymentStatus.COMPLETED)?._count.id ?? 0;
        const pendingCount = paymentsByStatus.find(p => p.status === PaymentStatus.PENDING)?._count.id ?? 0;
        const failedCount = paymentsByStatus.find(p => p.status === PaymentStatus.FAILED)?._count.id ?? 0;
        
        const total = paidAmount + pendingAmount + failedAmount;
        
        return {
          totalRevenue: totalRevenue._sum.totalCost ?? 0,
          totalPayments,
          averagePayment: averagePayment._avg.totalCost ?? 0,
          paidAmount,
          pendingAmount,
          failedAmount,
          paidCount,
          pendingCount,
          failedCount,
          paidPercentage: total > 0 ? (paidAmount / total) * 100 : 0,
          pendingPercentage: total > 0 ? (pendingAmount / total) * 100 : 0,
          failedPercentage: total > 0 ? (failedAmount / total) * 100 : 0,
          revenueChange: 10, // Placeholder - would calculate real trend
          paymentsByStatus: paymentsByStatus.map((item) => ({
            status: item.status,
            count: item._count.id,
            totalAmount: item._sum.totalCost ?? 0,
          })),
          paymentMethods: [
            { type: 'Card', count: paidCount, amount: paidAmount },
          ], // Simplified since payment method isn't in booking schema
          topServices: topServices.slice(0, 5).map((service) => ({
            name: service.tattooType,
            bookings: service._count.id,
            revenue: service._sum.totalCost ?? 0,
          })),
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching payment statistics',
          cause: error,
        });
      }
    }),

  /**
   * Get payments for the payments page table
   */
  getPayments: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(['week', 'month', 'year']).optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Generate mock data for now - replace with real Cal.com integration
        const mockPayments = [];
        const statuses = ['paid', 'pending', 'failed', 'refunded'];
        const services = ['Tattoo Consultation', 'Small Tattoo Session', 'Large Tattoo Session', 'Cover-up Session'];
        const methods = ['Card', 'PayPal', 'Cash', 'Bank Transfer'];
        
        // Generate 20 mock payments
        for (let i = 0; i < 20; i++) {
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 30));
          
          mockPayments.push({
            id: `payment-${i}`,
            bookingId: `booking-${i}`,
            amount: Math.floor(Math.random() * 500) + 100,
            currency: 'USD',
            status: statuses[Math.floor(Math.random() * statuses.length)],
            paymentMethod: methods[Math.floor(Math.random() * methods.length)],
            customerName: `Customer ${i + 1}`,
            customerEmail: `customer${i + 1}@example.com`,
            serviceName: services[Math.floor(Math.random() * services.length)],
            createdAt: date.toISOString(),
            paidAt: date.toISOString(),
          });
        }
        
        // Filter by status if provided
        let filtered = mockPayments;
        if (input.status && input.status !== 'all') {
          filtered = mockPayments.filter(p => p.status === input.status);
        }
        
        // Filter by time range
        if (input.timeRange) {
          const now = new Date();
          let startDate: Date;
          
          switch (input.timeRange) {
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }
          
          filtered = filtered.filter(p => new Date(p.createdAt) >= startDate);
        }
        
        return filtered;
      } catch (error) {
        logger.error('Error fetching payments:', error);
        return [];
      }
    }),
});