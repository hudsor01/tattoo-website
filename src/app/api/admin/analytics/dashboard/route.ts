/**
 * Admin Dashboard Analytics API
 * 
 * Provides analytics data for the admin dashboard charts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { calAnalyticsService } from '@/lib/analytics/cal-analytics-service';
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

    const dateRange = {
      startDate: startDate ? new Date(startDate) : defaultStartDate,
      endDate: endDate ? new Date(endDate) : defaultEndDate,
    };

    // Get dashboard metrics
    const metrics = await calAnalyticsService.getDashboardMetrics(dateRange);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    void logger.error('Dashboard analytics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard analytics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
