import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET endpoint for retrieving all payments (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Optional query parameters for filtering
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');
    const page = Number(searchParams.get('page') || '1');
    const status = searchParams.get('status'); // 'completed', 'pending', or 'failed'
    const clientEmail = searchParams.get('clientEmail'); // Filter by client email
    const clientId = searchParams.get('clientId'); // Filter by client ID

    // Validate parameters
    const validatedLimit = Math.min(100, Math.max(1, limit)); // Between 1 and 100
    const validatedPage = Math.max(1, page);
    const skip = (validatedPage - 1) * validatedLimit;

    // Build filter based on query parameters
    const filter: Prisma.PaymentWhereInput = {};

    if (status) {
      filter.status = status;
    }

    if (clientEmail) {
      filter.customerEmail = clientEmail;
    }

    if (clientId) {
      filter.OR = [
        { Booking: { customerId: clientId } },
        { Booking: { Customer: { id: clientId } } }
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.payment.count({
      where: filter,
    });

    // Get payments
    const payments = await prisma.payment.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
      skip,
      include: {
        Booking: {
          select: {
            id: true,
            name: true,
            email: true,
            preferredDate: true,
            preferredTime: true,
          },
        },
      },
    });

    return NextResponse.json({
      payments,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
        perPage: validatedLimit,
      },
    });
  } catch (error) {
    console.error('Error retrieving payments:', error);
    return NextResponse.json({ error: 'Failed to retrieve payments' }, { status: 500 });
  }
}

/**
 * PATCH endpoint to manually verify a pending payment
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.paymentId || typeof body.paymentId !== 'number') {
      return NextResponse.json({ error: 'Invalid or missing payment ID' }, { status: 400 });
    }

    const paymentId = body.paymentId;

    // Find payment in database
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'verified' },
    });

    // Update booking deposit status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { depositPaid: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}
