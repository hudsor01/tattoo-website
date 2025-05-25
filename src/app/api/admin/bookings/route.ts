import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    void logger.info('✅ Admin access granted - production mode');

    // Fetch bookings from database
    const bookings = await prisma.booking.findMany({
      include: {
        Customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        Appointment: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            deposit: true,
            totalPrice: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to recent bookings
    });

    return NextResponse.json({ 
      bookings,
      count: bookings.length 
    });

  } catch (error) {
    void logger.error('Failed to fetch bookings', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}