import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import { logger } from '@/lib/logger';
import { getCalBookings } from '@/lib/cal/api';
// CalBookingPaymentInfo defined inline where needed

// Route runtime configuration (Node.js runtime for Next.js 15.2.0+)
export const runtime = 'nodejs';

export async function GET(_req: Request) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    void logger.info('✅ Admin access granted - production mode');

    // Fetch bookings from Cal.com API since there's no Booking model in Prisma
    const calBookings = await getCalBookings({
      limit: 100, // Limit to recent bookings
    });
    
    // Transform Cal.com bookings to match expected format
    const bookings = calBookings.map(booking => {
      const attendee = booking.attendees?.[0];
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      return {
        id: booking.uid,
        title: booking.title,
        calId: booking.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: booking.status,
        startTime,
        endTime,
        customer: attendee ? {
          id: attendee.email, // Use email as ID
          firstName: attendee.name.split(' ')[0] ?? '',
          lastName: attendee.name.split(' ').slice(1).join(' ') ?? '',
          email: attendee.email,
          phone: null,
        } : null,
        payment: booking.payment ? {
          amount: (booking.payment as CalBookingPaymentInfo).amount ?? 0,
          status: (booking.payment as CalBookingPaymentInfo).status ?? 'pending',
        } : null,
      };
    });

    return NextResponse.json({
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    void logger.error('Failed to fetch bookings', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}