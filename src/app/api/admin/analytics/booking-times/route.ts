/**
 * Booking Times Analytics API
 * 
 * Provides booking time distribution data for time slot analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import type { User } from '@/lib/prisma-types';

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Default to last 30 days if no dates provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate) : defaultStartDate,
        lte: endDate ? new Date(endDate) : defaultEndDate,
      },
    };

    // Get bookings with preferred dates
    const bookings = await prisma.booking.findMany({
      where: {
        ...dateFilter,
        status: { in: ['COMPLETED', 'CONFIRMED', 'PENDING'] },
        preferredDate: { not: null as any },
      },
      select: {
        preferredDate: true,
        createdAt: true,
      },
    });

    // Time slot data (hourly breakdown)
    const timeSlotMap = new Map<string, number>();
    
    // Initialize time slots
    for (let hour = 9; hour <= 17; hour++) {
      const timeString = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      timeSlotMap.set(timeString, 0);
    }

    // Count bookings by preferred time
    bookings.forEach(booking => {
      if (booking.preferredDate) {
        const hour = booking.preferredDate.getHours();
        const timeString = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
        if (timeSlotMap.has(timeString)) {
          timeSlotMap.set(timeString, (timeSlotMap.get(timeString) ?? 0) + 1);
        }
      }
    });

    const timeSlotData = Array.from(timeSlotMap.entries()).map(([time, appointments]) => ({
      time,
      appointments,
    }));

    // Day of week data
    const dayMap = new Map<string, number>();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Initialize days
    days.forEach(day => dayMap.set(day, 0));

    // Count by day of week
    bookings.forEach(booking => {
      const dayOfWeek = booking.createdAt.getDay();
      const dayName = days[dayOfWeek];
      if (dayName) {
        dayMap.set(dayName, (dayMap.get(dayName) ?? 0) + 1);
      }
    });

    const dayData = Array.from(dayMap.entries()).map(([day, appointments]) => ({
      day,
      appointments,
    }));

    return NextResponse.json({
      success: true,
      data: {
        timeSlots: timeSlotData,
        days: dayData,
        totalBookings: bookings.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    void logger.error('Booking times API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch booking times data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
