/**
 * Analytics Database Query Utilities
 * 
 * This module provides standardized database query patterns and utilities
 * for analytics-related database operations.
 */

import { PrismaClient } from '@prisma/client';
import { AnalyticsTimePeriod } from '@/types/analytics-types';

// Use a singleton Prisma client instance
const prisma = new PrismaClient();

// Date range typings for query helpers
export type DateRange = {
  startDate: Date;
  endDate: Date;
};

/**
 * Get start and end dates for today
 */
export function getTodayDateRange(): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    startDate: today,
    endDate: tomorrow
  };
}

/**
 * Get date range for a specific time period
 */
export function getDateRangeForPeriod(period: AnalyticsTimePeriod, customRange?: DateRange): DateRange {
  // If custom range is provided, use it
  if (period === AnalyticsTimePeriod.CUSTOM && customRange) {
    return customRange;
  }
  
  const endDate = new Date();
  let startDate = new Date();
  
  switch (period) {
    case AnalyticsTimePeriod.DAY:
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case AnalyticsTimePeriod.WEEK:
      startDate.setDate(startDate.getDate() - 7);
      break;
      
    case AnalyticsTimePeriod.MONTH:
      startDate.setMonth(startDate.getMonth() - 1);
      break;
      
    case AnalyticsTimePeriod.QUARTER:
      startDate.setMonth(startDate.getMonth() - 3);
      break;
      
    case AnalyticsTimePeriod.YEAR:
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
      
    default:
      startDate.setHours(0, 0, 0, 0);
  }
  
  return { startDate, endDate };
}

/**
 * Get the number of unique visitors in a date range
 */
export async function getUniqueVisitors(dateRange: DateRange): Promise<number> {
  const { startDate, endDate } = dateRange;
  
  const uniqueVisitors = await prisma.analyticsEvent.groupBy({
    by: ['sessionId'],
    where: {
      timestamp: {
        gte: startDate,
        lt: endDate,
      },
      sessionId: {
        not: null,
      },
    },
  });
  
  return uniqueVisitors.length;
}

/**
 * Get the number of page views in a date range
 */
export async function getPageViews(dateRange: DateRange): Promise<number> {
  const { startDate, endDate } = dateRange;
  
  return prisma.analyticsEvent.count({
    where: {
      category: 'page_view',
      timestamp: {
        gte: startDate,
        lt: endDate,
      },
    },
  });
}

/**
 * Get the number of completed bookings in a date range
 */
export async function getCompletedBookings(dateRange: DateRange): Promise<number> {
  const { startDate, endDate } = dateRange;
  
  return prisma.analyticsEvent.count({
    where: {
      category: 'booking',
      action: 'complete',
      timestamp: {
        gte: startDate,
        lt: endDate,
      },
    },
  });
}

/**
 * Get the number of conversions in a date range
 */
export async function getConversions(dateRange: DateRange): Promise<number> {
  const { startDate, endDate } = dateRange;
  
  return prisma.analyticsEvent.count({
    where: {
      category: 'conversion',
      timestamp: {
        gte: startDate,
        lt: endDate,
      },
    },
  });
}

/**
 * Get live stats data for the current day
 */
export async function getLiveStatsData() {
  const dateRange = getTodayDateRange();
  
  // Get data in parallel for better performance
  const [visitors, pageViews, bookings, conversions] = await Promise.all([
    getUniqueVisitors(dateRange),
    getPageViews(dateRange),
    getCompletedBookings(dateRange),
    getConversions(dateRange)
  ]);
  
  // Calculate conversion rate
  const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
  
  return {
    visitors,
    pageViews,
    conversionRate,
    bookings,
  };
}

/**
 * Generate date periods based on period type
 */
export function generateDatePeriods(
  startDate: Date,
  endDate: Date,
  periodType: AnalyticsTimePeriod
): Array<{ start: Date; end: Date; label: string }> {
  const periods: { start: Date; end: Date; label: string }[] = [];
  let current = new Date(startDate);
  
  while (current < endDate) {
    const start = new Date(current);
    let end: Date;
    let label: string;
    
    switch (periodType) {
      case AnalyticsTimePeriod.DAY:
        end = new Date(current);
        end.setDate(end.getDate() + 1);
        label = start.toISOString().split('T')[0];
        break;
        
      case AnalyticsTimePeriod.WEEK:
        end = new Date(current);
        end.setDate(end.getDate() + 7);
        label = `${start.toISOString().split('T')[0]} - ${
          new Date(end.getTime() - 1).toISOString().split('T')[0]
        }`;
        break;
        
      case AnalyticsTimePeriod.MONTH:
        end = new Date(current);
        end.setMonth(end.getMonth() + 1);
        label = `${start.toLocaleString('default', { month: 'short' }) || ''} ${start.getFullYear()}`;
        break;
        
      case AnalyticsTimePeriod.QUARTER: {
        end = new Date(current);
        end.setMonth(end.getMonth() + 3);
        const quarter = Math.floor(start.getMonth() / 3) + 1;
        label = `Q${quarter} ${start.getFullYear()}`;
        break;
      }
        
      case AnalyticsTimePeriod.YEAR:
        end = new Date(current);
        end.setFullYear(end.getFullYear() + 1);
        label = start.getFullYear().toString();
        break;
        
      default:
        end = new Date(current);
        end.setDate(end.getDate() + 1);
        label = start.toISOString().split('T')[0];
    }
    
    // Ensure we don't go beyond the end date
    if (end > endDate) {
      end = new Date(endDate);
    }
    
    periods.push({ start, end, label });
    current = end;
  }
  
  return periods;
}

/**
 * Get recent analytics events
 */
export async function getRecentEvents(limit: number = 10) {
  return prisma.analyticsEvent.findMany({
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}

/**
 * Group events by time period and calculate statistics
 */
export async function getAnalyticsByPeriod(startDate: Date, endDate: Date, period: AnalyticsTimePeriod) {
  // Get all events in the date range
  const events = await prisma.analyticsEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });
  
  // Create date periods based on the selected period type
  const periods = generateDatePeriods(startDate, endDate, period);
  
  // Initialize stats for each period
  const periodStats = periods.map(({ start, end, label }) => {
    // Filter events for this period
    const periodEvents = events.filter(
      event => event.timestamp >= start && event.timestamp < end
    );
    
    // Count unique visitors
    const visitors = new Set(
      periodEvents.filter(e => e.sessionId).map(e => e.sessionId)
    ).size;
    
    // Count page views
    const pageViews = periodEvents.filter(e => e.category === 'page_view').length;
    
    // Count bookings
    const bookings = periodEvents.filter(
      e => e.category === 'booking' && e.action === 'complete'
    ).length;
    
    // Count conversions
    const conversions = periodEvents.filter(e => e.category === 'conversion').length;
    
    // Calculate conversion rate
    const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;
    
    return {
      date: label,
      visitors,
      pageViews,
      conversionRate,
      bookings,
    };
  });
  
  // Calculate totals
  const totalVisitors = new Set(events.filter((e) => e.sessionId).map((e) => e.sessionId)).size;
  const totalPageViews = events.filter((e) => e.category === 'page_view').length;
  const totalBookings = events.filter((e) => e.category === 'booking' && e.action === 'complete').length;
  const totalConversions = events.filter((e) => e.category === 'conversion').length;
  const totalConversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;
  
  return {
    dailyStats: periodStats,
    totals: {
      visitors: totalVisitors,
      pageViews: totalPageViews,
      conversionRate: totalConversionRate,
      bookings: totalBookings
    }
  };
}

// Export Prisma instance for direct use
export { prisma };