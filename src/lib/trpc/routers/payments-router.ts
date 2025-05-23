import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../procedures';
import { prisma } from '@/lib/db/prisma';
import { PaymentStatus } from '@/types/enum-types';

export const paymentsRouter = router({
  /**
   * Get all payments for the authenticated user
   */
  getUserPayments: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.number().nullish(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const payments = await prisma.payment.findMany({
          where: {
            customerEmail: ctx.user.email!,
          },
          include: {
            Booking: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: input.limit + 1,
          ...(input.cursor && { cursor: { id: input.cursor } }),
        });
        
        let nextCursor: number | undefined;
        if (payments.length > input.limit) {
          const nextItem = payments.pop();
          nextCursor = nextItem!.id;
        }
        
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
   * Get payment by ID (user can only see their own payments)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const payment = await prisma.payment.findFirst({
          where: {
            id: input.id,
            customerEmail: ctx.user.email!,
          },
          include: {
            Booking: true,
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
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().nullish(),
      status: z.nativeEnum(PaymentStatus).optional(),
      customerId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const where: any = {};
        
        if (input.status) {
          where.status = input.status;
        }
        
        if (input.customerId) {
          // Find customer email for filtering
          const customer = await prisma.customer.findUnique({
            where: { id: input.customerId },
            select: { email: true },
          });
          if (customer) {
            where.customerEmail = customer.email;
          }
        }
        
        if (input.startDate || input.endDate) {
          where.createdAt = {};
          if (input.startDate) {
            where.createdAt.gte = input.startDate;
          }
          if (input.endDate) {
            where.createdAt.lte = input.endDate;
          }
        }
        
        const payments = await prisma.payment.findMany({
          where,
          include: {
            Booking: {
              select: {
                id: true,
                createdAt: true,
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
        if (payments.length > input.limit) {
          const nextItem = payments.pop();
          nextCursor = nextItem!.id;
        }
        
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
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const where: any = {};
        
        if (input.startDate || input.endDate) {
          where.createdAt = {};
          if (input.startDate) {
            where.createdAt.gte = input.startDate;
          }
          if (input.endDate) {
            where.createdAt.lte = input.endDate;
          }
        }
        
        const [
          totalRevenue,
          totalPayments,
          paymentsByStatus,
          averagePayment,
        ] = await Promise.all([
          // Total revenue (completed payments only)
          prisma.payment.aggregate({
            where: { ...where, status: PaymentStatus.COMPLETED },
            _sum: { amount: true },
          }),
          
          // Total number of payments
          prisma.payment.count({ where }),
          
          // Payments by status
          prisma.payment.groupBy({
            by: ['status'],
            where,
            _count: { id: true },
            _sum: { amount: true },
          }),
          
          // Average payment amount
          prisma.payment.aggregate({
            where,
            _avg: { amount: true },
          }),
        ]);
        
        return {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPayments,
          averagePayment: averagePayment._avg.amount || 0,
          paymentsByStatus: paymentsByStatus.map(item => ({
            status: item.status,
            count: item._count.id,
            totalAmount: item._sum.amount || 0,
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
});