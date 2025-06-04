/**
 * Cal.com Analytics Service
 * 
 * Purpose: Synchronize Cal.com data and provide real-time analytics
 * Assumptions: Database connection available, Cal.com API accessible
 * Dependencies: Prisma for database, Cal.com API client, real-time publisher
 * 
 * Trade-offs:
 * - Batch processing vs real-time updates: Performance vs latency
 * - Data denormalization for query performance vs storage overhead
 * - Retry logic vs immediate failure for reliability
 */

import { PrismaClient } from '@prisma/client';
import { calApi, type CalBookingResponse } from '@/lib/cal/api';
import { realTimePublisher, type MetricsUpdateEvent } from '@/lib/realtime/pusher-client';
import { z } from 'zod';

import { logger } from "@/lib/logger";
// Validation Schemas
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

const syncOptionsSchema = z.object({
  forceFullSync: z.boolean().default(false),
  batchSize: z.number().min(1).max(1000).default(100),
  maxRetries: z.number().min(0).max(10).default(3),
});

// Analytics Response Types
export interface DashboardMetrics {
  dailyStats: any;
  totalRevenue: any;
  totalappointments: string;
  conversionRate: any;
  overview: {
    totalappointments: number;
    confirmedappointments: number;
    cancelledappointments: number;
    pendingappointments: number;
    conversionRate: number;
    totalRevenue: number;
    averageBookingValue: number;
    customerCount: number;
  };
  todayMetrics: {
    todayappointments: number;
    todayRevenue: number;
    todayConversions: number;
    liveVisitors: number;
  };
  trends: Array<{
    date: string;
    appointments: number;
    revenue: number;
    conversions: number;
  }>;
  topServices: Array<{
    eventTypeId: number;
    serviceName: string;
    bookingCount: number;
    revenue: number;
    conversionRate: number;
  }>;
  recentappointments: Array<{
    id: string;
    title: string;
    attendeeName: string;
    startTime: Date;
    status: string;
    revenue: number;
  }>;
  upcomingappointments: Array<{
    id: string;
    title: string;
    attendeeName: string;
    startTime: Date;
    eventType: string;
  }>;
}

export interface BookingAnalytics {
  funnelMetrics: {
    pageViews: number;
    appointmentstarted: number;
    timeSlotSelected: number;
    formCompleted: number;
    paymentStarted: number;
    bookingConfirmed: number;
    conversionRates: {
      viewToStart: number;
      startToConfirm: number;
      overallConversion: number;
    };
  };
  servicePerformance: Array<{
    serviceId: string;
    serviceName: string;
    totalappointments: number;
    revenue: number;
    avgRating: number;
    popularTimeSlots: string[];
  }>;
}

export class CalAnalyticsService {
  private db: PrismaClient;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(db?: PrismaClient) {
    this.db = db ?? new PrismaClient();
  }

  // Data Synchronization
  async syncCalappointments(options: z.infer<typeof syncOptionsSchema> = {}): Promise<{
    processed: number;
    updated: number;
    created: number;
    errors: number;
  }> {
    const validatedOptions = syncOptionsSchema.parse(options);
    const { batchSize, forceFullSync } = validatedOptions;

    // Get last sync timestamp
    const lastSync = forceFullSync ? null : await this.getLastSyncTimestamp('appointments');
    const startAfter = lastSync?.toISOString();

    let processed = 0;
    let updated = 0;
    let created = 0;
    let errors = 0;
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      try {
        const response = await calApi.getappointments({
          limit: batchSize,
          offset,
          ...(startAfter && { startAfter }),
        });

        const appointments = response.data;
        hasMore = response.pagination.hasMore;

        for (const booking of appointments) {
          try {
            const result = await this.upsertBooking(booking);
            if (result.created) {
              created++;
              // Publish real-time update for new appointments
              await this.publishNewBookingEvent(booking);
            } else {
              updated++;
            }
            processed++;
          } catch (error) {
            void logger.error(`Error processing booking ${booking.id}:`, error);
            errors++;
          }
        }

        offset += batchSize;

        // Update sync state
        await this.updateSyncState('appointments', {
          lastSyncAt: new Date(),
          recordsProcessed: processed,
          recordsError: errors,
          lastRunStatus: errors > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
        });

      } catch (error) {
        void logger.error('Error fetching appointments from Cal.com:', error);
        hasMore = false;
        await this.updateSyncState('appointments', {
          lastRunStatus: 'ERROR',
          lastRunError: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { processed, updated, created, errors };
  }

  private async upsertBooking(calBooking: CalBookingResponse): Promise<{ created: boolean }> {
    const existingBooking = await this.db.calBooking.findUnique({
      where: { calBookingId: calBooking.id },
    });

    const bookingData = {
      calBookingId: calBooking.id,
      calBookingUid: calBooking.uid,
      title: calBooking.title,
      description: calBooking.description ?? null,
      startTime: new Date(calBooking.start),
      endTime: new Date(calBooking.end),
      status: this.mapCalStatusToDb(calBooking.status),
      attendeeEmail: calBooking.attendees[0]?.email ?? '',
      attendeeName: calBooking.attendees[0]?.name ?? '',
      attendeeTimeZone: calBooking.attendees[0]?.timeZone ?? 'UTC',
      hostEmail: calBooking.eventType?.title ?? '',
      hostName: calBooking.eventType?.title ?? '',
      serviceName: calBooking.eventType.title,
      servicePrice: calBooking.eventType.price,
      serviceCurrency: calBooking.eventType.currency,
      eventTypeId: calBooking.eventType.id,
      eventTypeSlug: calBooking.eventType.slug,
      isPaid: calBooking.payment?.[0]?.success ?? false,
      paymentStatus: this.mapPaymentStatus(calBooking.payment?.[0]),
      paymentAmount: calBooking.payment?.[0]?.amount,
      paymentCurrency: calBooking.payment?.[0]?.currency,
      syncedAt: new Date(),
    };

    if (existingBooking) {
      await this.db.calBooking.update({
        where: { id: existingBooking.id },
        data: bookingData,
      });
      return { created: false };
    } else {
      await this.db.calBooking.create({ data: bookingData });
      
      // Update customer record
      await this.upsertCustomer(calBooking.attendees[0]);
      
      return { created: true };
    }
  }

  private async upsertCustomer(attendee: CalBookingResponse['attendees'][0]): Promise<void> {
    if (!attendee?.email) return;

    await this.db.customer.upsert({
      where: { email: attendee.email },
      update: {
        firstName: attendee.name.split(' ')[0] ?? attendee.name,
        lastName: attendee.name.split(' ').slice(1).join(' ') ?? '',
        lastBookingAt: new Date(),
        bookingCount: { increment: 1 },
      },
      create: {
        firstName: attendee.name.split(' ')[0] ?? attendee.name,
        lastName: attendee.name.split(' ').slice(1).join(' ') ?? '',
        email: attendee.email,
        lastBookingAt: new Date(),
        bookingCount: 1,
      },
    });
  }

  // Dashboard Metrics
  async getDashboardMetrics(dateRange: z.infer<typeof dateRangeSchema>): Promise<DashboardMetrics> {
    const { startDate, endDate } = dateRangeSchema.parse(dateRange);

    const [
      overview,
      todayMetrics,
      trends,
      topServices,
      recentappointments,
      upcomingappointments,
    ] = await Promise.all([
      this.getOverviewMetrics(startDate, endDate),
      this.getTodayMetrics(),
      this.getBookingTrends(startDate, endDate),
      this.getTopServices(startDate, endDate),
      this.getRecentappointments(),
      this.getUpcomingappointments(),
    ]);

    return {
      overview,
      todayMetrics,
      trends,
      topServices,
      recentappointments,
      upcomingappointments,
    };
  }

  private async getOverviewMetrics(startDate: Date, endDate: Date) {
    const [
      totalappointments,
      confirmedappointments,
      cancelledappointments,
      pendingappointments,
      revenueData,
      customerCount,
    ] = await Promise.all([
      this.db.calBooking.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.db.calBooking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'ACCEPTED',
        },
      }),
      this.db.calBooking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'CANCELLED',
        },
      }),
      this.db.calBooking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PENDING',
        },
      }),
      this.db.calBooking.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'COMPLETED',
        },
        _sum: { paymentAmount: true },
        _avg: { paymentAmount: true },
      }),
      this.db.customer.count(),
    ]);

    const totalRevenue = revenueData._sum.paymentAmount ?? 0;
    const averageBookingValue = revenueData._avg.paymentAmount ?? 0;
    const conversionRate = totalappointments > 0 ? (confirmedappointments / totalappointments) * 100 : 0;

    return {
      totalappointments,
      confirmedappointments,
      cancelledappointments,
      pendingappointments,
      conversionRate,
      totalRevenue,
      averageBookingValue,
      customerCount,
    };
  }

  private async getTodayMetrics() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [todayappointments, todayRevenueData] = await Promise.all([
      this.db.calBooking.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.db.calBooking.aggregate({
        where: {
          createdAt: { gte: startOfDay },
          paymentStatus: 'COMPLETED',
        },
        _sum: { paymentAmount: true },
      }),
    ]);

    return {
      todayappointments,
      todayRevenue: todayRevenueData._sum.paymentAmount ?? 0,
      todayConversions: todayappointments, // Simplified - could be more sophisticated
      liveVisitors: 0, // Would need to implement visitor tracking
    };
  }

  private async getBookingTrends(startDate: Date, endDate: Date) {
    // Get daily aggregated data
    const dailyappointments = await this.db.$queryRaw<Array<{
      date: string;
      appointments: bigint;
      revenue: number;
    }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as appointments,
        COALESCE(SUM(payment_amount), 0) as revenue
      FROM cal_appointments 
      WHERE created_at >= ${startDate} 
        AND created_at <= ${endDate}
        AND payment_status = 'COMPLETED'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailyappointments.map(day => ({
      date: day.date,
      appointments: Number(day.appointments),
      revenue: Number(day.revenue),
      conversions: Number(day.appointments), // Simplified
    }));
  }

  private async getTopServices(startDate: Date, endDate: Date) {
    const topServices = await this.db.calBooking.groupBy({
      by: ['eventTypeId', 'serviceName'],
      where: { createdAt: { gte: startDate, lte: endDate } },
      _count: { eventTypeId: true },
      _sum: { paymentAmount: true },
      orderBy: { _count: { eventTypeId: 'desc' } },
      take: 5,
    });

    return topServices.map(service => ({
      eventTypeId: service.eventTypeId,
      serviceName: service.serviceName,
      bookingCount: service._count.eventTypeId,
      revenue: service._sum.paymentAmount ?? 0,
      conversionRate: 100, // Would need additional data to calculate properly
    }));
  }

  private async getRecentappointments() {
    const recentappointments = await this.db.calBooking.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        attendeeName: true,
        startTime: true,
        status: true,
        paymentAmount: true,
      },
    });

    return recentappointments.map(booking => ({
      id: booking.id,
      title: booking.title,
      attendeeName: booking.attendeeName,
      startTime: booking.startTime,
      status: booking.status,
      revenue: booking.paymentAmount ?? 0,
    }));
  }

  private async getUpcomingappointments() {
    const upcomingappointments = await this.db.calBooking.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { in: ['ACCEPTED', 'CONFIRMED'] },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
      select: {
        id: true,
        title: true,
        attendeeName: true,
        startTime: true,
        serviceName: true,
      },
    });

    return upcomingappointments.map(booking => ({
      id: booking.id,
      title: booking.title,
      attendeeName: booking.attendeeName,
      startTime: booking.startTime,
      eventType: booking.serviceName,
    }));
  }

  // Real-time Event Publishing
  private async publishNewBookingEvent(booking: CalBookingResponse): Promise<void> {
    await realTimePublisher.publishNewBooking({
      id: booking.uid,
      title: booking.title,
      attendee: {
        name: booking.attendees[0]?.name ?? '',
        email: booking.attendees[0]?.email ?? '',
      },
      startTime: booking.start,
      eventType: booking.eventType.title,
      status: booking.status,
    });
  }

  async publishMetricsUpdate(): Promise<void> {
    const todayMetrics = await this.getTodayMetrics();
    
    const event: MetricsUpdateEvent = {
      type: 'metrics-update',
      metrics: {
        todayappointments: todayMetrics.todayappointments,
        todayRevenue: todayMetrics.todayRevenue,
        pendingappointments: 0, // Would need to calculate
        liveVisitors: 0, // Would need visitor tracking
      },
      timestamp: new Date().toISOString(),
    };

    await realTimePublisher.publishMetricsUpdate(event);
  }

  // Utility Methods
  private mapCalStatusToDb(calStatus: string): string {
    const statusMap: Record<string, string> = {
      'accepted': 'ACCEPTED',
      'pending': 'PENDING',
      'cancelled': 'CANCELLED',
      'rejected': 'REJECTED',
    };
    return statusMap[calStatus] ?? 'PENDING';
  }

  private mapPaymentStatus(payment?: CalBookingResponse['payment'][0]): string {
    if (!payment) return 'PENDING';
    return payment.success ? 'COMPLETED' : 'FAILED';
  }

  private async getLastSyncTimestamp(syncType: string): Promise<Date | null> {
    const syncState = await this.db.calSyncState.findUnique({
      where: { syncType },
    });
    return syncState?.lastSyncAt ?? null;
  }

  private async updateSyncState(
    syncType: string,
    updates: {
      lastSyncAt?: Date;
      recordsProcessed?: number;
      recordsError?: number;
      lastRunStatus?: string;
      lastRunError?: string;
    }
  ): Promise<void> {
    await this.db.calSyncState.upsert({
      where: { syncType },
      update: updates,
      create: {
        syncType,
        ...updates,
      },
    });
  }

  // Health Check
  async getServiceHealth(): Promise<{
    api: { status: string; responseTime?: number };
    database: { status: string; responseTime?: number };
    sync: { status: string; lastSync?: Date };
  }> {
    const startTime = Date.now();
    
    try {
      // Check Cal.com API
      const apiHealth = await calApi.healthCheck();
      const apiResponseTime = Date.now() - startTime;

      // Check database
      const dbStartTime = Date.now();
      await this.db.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;

      // Check sync status
      const syncState = await this.db.calSyncState.findUnique({
        where: { syncType: 'appointments' },
      });

      return {
        api: {
          status: apiHealth.status,
          responseTime: apiResponseTime,
        },
        database: {
          status: 'ok',
          responseTime: dbResponseTime,
        },
        sync: {
          status: syncState?.lastRunStatus ?? 'unknown',
          lastSync: syncState?.lastSyncAt ?? undefined,
        },
      };
    } catch {
      return {
        api: { status: 'error' },
        database: { status: 'error' },
        sync: { status: 'error' },
      };
    }
  }

  // Cleanup old data
  async cleanupOldData(retentionDays: number = 90): Promise<{ deletedRecords: number }> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await this.db.calWebhookEvent.deleteMany({
      where: {
        receivedAt: { lt: cutoffDate },
        processed: true,
      },
    });

    return { deletedRecords: result.count };
  }
}

// Export singleton instance
export const calAnalyticsService = new CalAnalyticsService();
