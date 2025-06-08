/**
 * Service Distribution Analytics API
 * 
 * Provides service breakdown data for pie charts
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

    // Get bookings grouped by tattoo type
    const bookings = await prisma.booking.findMany({
      where: {
        ...dateFilter,
        status: { in: ['COMPLETED', 'CONFIRMED', 'PENDING'] },
      },
      select: {
        tattooType: true,
      },
    });

    // Group by service type and count
    const serviceMap = new Map<string, number>();
    
    bookings.forEach(booking => {
      const serviceName = booking.tattooType || 'Consultation';
      serviceMap.set(serviceName, (serviceMap.get(serviceName) ?? 0) + 1);
    });

    // Convert to chart data format with colors
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const serviceData = Array.from(serviceMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
      percentage: bookings.length > 0 ? Math.round((value / bookings.length) * 100) : 0,
    }));

    // Sort by value descending
    serviceData.sort((a, b) => b.value - a.value);

    return NextResponse.json({
      success: true,
      data: serviceData,
      total: bookings.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    void logger.error('Service distribution API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch service distribution data',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
