/**
 * Admin Payments API
 * 
 * Provides payment management and tracking functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { Prisma, PaymentStatus } from '@prisma/client';
import type { User } from '@/lib/prisma-types';

// Define the payment type with included relations
type PaymentWithBooking = Prisma.PaymentGetPayload<{
  include: {
    booking: {
      include: {
        customer: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            email: true;
            phone: true;
          }
        }
      }
    }
  }
}>;

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user || (session.user as User).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: Prisma.PaymentWhereInput = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as PaymentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get payments with pagination
    const queryOptions: Prisma.PaymentFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              }
            }
          }
        }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const payments = await prisma.payment.findMany(queryOptions);

    // Check if there are more results
    const hasMore = payments.length > limit;
    if (hasMore) {
      payments.pop(); // Remove the extra item
    }

    const nextCursor = hasMore ? payments[payments.length - 1]?.id : null;

    // Get payment statistics
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          lte: endDate ? new Date(endDate) : new Date(),
        }
      }
    });

    // Transform payments for response - properly typed payments
    const transformedPayments = (payments as PaymentWithBooking[]).map((payment) => ({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status.toLowerCase(),
      paymentMethod: payment.paymentMethod ?? 'unknown',
      stripeId: payment.stripeId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      customerName: payment.booking?.customer 
        ? `${payment.booking.customer.firstName} ${payment.booking.customer.lastName}`.trim()
        : 'Unknown Customer',
      customerEmail: payment.booking?.customer?.email ?? 'No Email',
      description: payment.booking ? `Booking #${payment.booking.id.slice(-8)}` : 'Direct Payment',
    }));

    // Transform stats for response
    const transformedStats = {
      totalRevenue: stats.find(s => s.status === 'COMPLETED')?._sum.amount ?? 0,
      pendingAmount: stats.find(s => s.status === 'PENDING')?._sum.amount ?? 0,
      totalTransactions: stats.reduce((sum, s) => sum + s._count.id, 0),
      completedCount: stats.find(s => s.status === 'COMPLETED')?._count.id ?? 0,
      pendingCount: stats.find(s => s.status === 'PENDING')?._count.id ?? 0,
      failedCount: stats.find(s => s.status === 'FAILED')?._count.id ?? 0,
      refundedCount: stats.find(s => s.status === 'REFUNDED')?._count.id ?? 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        payments: transformedPayments,
        stats: transformedStats,
        pagination: {
          hasMore,
          nextCursor,
          total: transformedStats.totalTransactions
        }
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    void logger.error('Payments API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payments data',
      },
      { status: 500 }
    );
  }
}
