/**
 * Cal.com Analytics tRPC Router
 * 
 * Purpose: Type-safe API endpoints for Cal.com analytics and dashboard data
 * Assumptions: Database available, analytics service configured
 * Dependencies: tRPC, Prisma, Cal.com analytics service, Zod validation
 * 
 * Trade-offs:
 * - Type safety vs development speed: Complete type coverage vs rapid iteration
 * - Comprehensive validation vs performance: Data integrity vs query speed
 * - Caching vs real-time data: Performance vs data freshness
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';
import { TRPCError } from '@trpc/server';
import { router, adminProcedure, publicProcedure } from '@/lib/trpc/procedures';
import { calAnalyticsService } from '@/lib/analytics/cal-analytics-service';
import { calApi } from '@/lib/cal/api';
import { prisma as db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Sync result type
interface SyncResult {
  processed: number;
  updated: number;
  created: number;
  errors: number;
}

// Input Schemas
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.startDate < data.endDate,
  { message: "Start date must be before end date" }
);

const syncOptionsSchema = z.object({
  forceFullSync: z.boolean().default(false),
  batchSize: z.number().min(1).max(1000).default(100),
  syncType: z.enum(['bookings', 'event_types', 'all']).default('bookings'),
});

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

const bookingFiltersSchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED']).optional(),
  eventTypeId: z.number().optional(),
  attendeeEmail: z.string().email().optional(),
  dateRange: dateRangeSchema.optional(),
});

// Cal.com Analytics Router
export const calAnalyticsRouter = router({
  // Dashboard Metrics
  getDashboardMetrics: adminProcedure
    .input(dateRangeSchema)
    .query(async ({ input }) => {
      try {
        const metrics = await calAnalyticsService.getDashboardMetrics(input);
        
        return {
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching dashboard metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard metrics',
          cause: error,
        });
      }
    }),

  // Real-time Metrics
  getTodayMetrics: adminProcedure
    .query(async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const [todayBookings, todayRevenue, liveMetrics] = await Promise.all([
          db.calBooking.count({
            where: { createdAt: { gte: startOfDay } },
          }),
          db.calBooking.aggregate({
            where: {
              createdAt: { gte: startOfDay },
              paymentStatus: 'COMPLETED',
            },
            _sum: { paymentAmount: true },
          }),
          // Get live metrics from cache or calculate
          db.calMetricsSnapshot.findFirst({
            where: {
              date: startOfDay,
              hour: new Date().getHours(),
            },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        return {
          success: true,
          data: {
            todayBookings,
            todayRevenue: todayRevenue._sum.paymentAmount ?? 0,
            liveVisitors: liveMetrics?.liveVisitors ?? 0,
            activeSessions: liveMetrics?.activeSessions ?? 0,
            conversionRate: liveMetrics?.conversionRate ?? 0,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching today metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch today metrics',
          cause: error,
        });
      }
    }),

  // Booking Management
  getBookings: adminProcedure
    .input(bookingFiltersSchema.merge(paginationSchema))
    .query(async ({ input }) => {
      try {
        const { limit, offset, status, eventTypeId, attendeeEmail, dateRange } = input;
        
        const where: Prisma.CalBookingWhereInput = {};
        
        if (status) where.status = status;
        if (eventTypeId) where.eventTypeId = eventTypeId;
        if (attendeeEmail) where.attendeeEmail = attendeeEmail;
        if (dateRange) {
          where.startTime = {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          };
        }

        const [bookings, total] = await Promise.all([
          db.calBooking.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
              id: true,
              calBookingUid: true,
              title: true,
              attendeeName: true,
              attendeeEmail: true,
              startTime: true,
              endTime: true,
              status: true,
              serviceName: true,
              paymentAmount: true,
              paymentStatus: true,
              createdAt: true,
            },
          }),
          db.calBooking.count({ where }),
        ]);

        return {
          success: true,
          data: {
            bookings,
            pagination: {
              total,
              hasMore: offset + limit < total,
              nextOffset: offset + limit < total ? offset + limit : null,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching bookings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bookings',
          cause: error,
        });
      }
    }),

  // Get specific booking details
  getBookingById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const booking = await db.calBooking.findUnique({
          where: { id: input.id },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                totalSpent: true,
                bookingCount: true,
              },
            },
          },
        });

        if (!booking) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Booking not found',
          });
        }

        // Get related bookings for this customer
        const relatedBookings = await db.calBooking.findMany({
          where: {
            attendeeEmail: booking.attendeeEmail,
            id: { not: booking.id },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            startTime: true,
            status: true,
            paymentAmount: true,
          },
        });

        return {
          success: true,
          data: {
            booking,
            relatedBookings,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        void logger.error('Error fetching booking:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch booking details',
          cause: error,
        });
      }
    }),

  // Data Synchronization
  syncCalData: adminProcedure
    .input(syncOptionsSchema)
    .mutation(async ({ input }) => {
      try {
        const { forceFullSync, batchSize, syncType } = input;
        
        const results: Record<string, SyncResult> = {};

        if (syncType === 'bookings' || syncType === 'all') {
          const bookingResults = await calAnalyticsService.syncCalBookings({
            forceFullSync,
            batchSize,
            maxRetries: 3,
          });
          results['bookings'] = bookingResults;
        }

        if (syncType === 'event_types' || syncType === 'all') {
          // Sync event types
          const eventTypes = await calApi.getEventTypes();
          
          const eventTypeResults = { processed: 0, updated: 0, created: 0, errors: 0 };
          
          for (const eventType of eventTypes.data) {
            try {
              await db.calEventType.upsert({
                where: { calEventTypeId: eventType.id },
                update: {
                  title: eventType.title,
                  slug: eventType.slug,
                  description: eventType.description ?? null,
                  length: eventType.length,
                  price: eventType.price,
                  currency: eventType.currency,
                  hidden: eventType.hidden,
                  requiresConfirmation: eventType.requiresConfirmation,
                  syncedAt: new Date(),
                },
                create: {
                  calEventTypeId: eventType.id,
                  title: eventType.title,
                  slug: eventType.slug,
                  description: eventType.description ?? null,
                  length: eventType.length,
                  price: eventType.price,
                  currency: eventType.currency,
                  hidden: eventType.hidden,
                  requiresConfirmation: eventType.requiresConfirmation,
                  syncedAt: new Date(),
                },
              });
              
              eventTypeResults.processed++;
            } catch (error) {
              void logger.error(`Error syncing event type ${eventType.id}:`, error);
              eventTypeResults.errors++;
            }
          }
          
          results['eventTypes'] = eventTypeResults;
        }

        return {
          success: true,
          data: results,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error syncing Cal.com data:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync Cal.com data',
          cause: error,
        });
      }
    }),

  // Service Performance Analytics
  getServicePerformance: adminProcedure
    .input(dateRangeSchema.optional())
    .query(async ({ input }) => {
      try {
        const dateRange = input ?? {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        };

        const serviceStats = await db.calBooking.groupBy({
          by: ['eventTypeId', 'serviceName'],
          where: {
            createdAt: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
          _count: { eventTypeId: true },
          _sum: { paymentAmount: true },
          _avg: { paymentAmount: true },
          orderBy: { _count: { eventTypeId: 'desc' } },
        });

        const enrichedStats = await Promise.all(
          serviceStats.map(async (stat: typeof serviceStats[number]) => {
            // Get conversion rate (confirmed vs total bookings)
            const [totalBookings, confirmedBookings] = await Promise.all([
              db.calBooking.count({
                where: {
                  eventTypeId: stat.eventTypeId,
                  createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                  },
                },
              }),
              db.calBooking.count({
                where: {
                  eventTypeId: stat.eventTypeId,
                  status: { in: ['ACCEPTED', 'CONFIRMED'] },
                  createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                  },
                },
              }),
            ]);

            const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

            return {
              eventTypeId: stat.eventTypeId,
              serviceName: stat.serviceName,
              totalBookings: stat._count.eventTypeId,
              totalRevenue: stat._sum.paymentAmount ?? 0,
              averageValue: stat._avg.paymentAmount ?? 0,
              conversionRate,
              confirmedBookings,
            };
          })
        );

        return {
          success: true,
          data: enrichedStats,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching service performance:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch service performance data',
          cause: error,
        });
      }
    }),

  // Customer Analytics
  getCustomerAnalytics: adminProcedure
    .input(dateRangeSchema.optional())
    .query(async ({ input }) => {
      try {
        const dateRange = input ?? {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(),
        };

        const [
          totalCustomers,
          newCustomers,
          returningCustomers,
          topCustomers,
          customerGrowth,
        ] = await Promise.all([
          db.customer.count(),
          db.customer.count({
            where: {
              createdAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
              },
            },
          }),
          db.customer.count({
            where: {
              bookingCount: { gt: 1 },
              lastBookingAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
              },
            },
          }),
          db.customer.findMany({
            orderBy: { totalSpent: 'desc' },
            take: 10,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              totalSpent: true,
              bookingCount: true,
              lastBookingAt: true,
            },
          }),
          // Get daily customer growth
          db.$queryRaw<Array<{ date: string; newCustomers: bigint }>>(`
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as "newCustomers"
            FROM customer 
            WHERE created_at >= ${dateRange.startDate} 
              AND created_at <= ${dateRange.endDate}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
          `),
        ]);

        return {
          success: true,
          data: {
            overview: {
              totalCustomers,
              newCustomers,
              returningCustomers,
              retentionRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
            },
            topCustomers,
            growth: customerGrowth.map((day: { date: string; newCustomers: bigint }) => ({
              date: day.date,
              newCustomers: Number(day.newCustomers),
            })),
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching customer analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer analytics',
          cause: error,
        });
      }
    }),

  // Health Status
  getHealthStatus: adminProcedure
    .query(async () => {
      try {
        const health = await calAnalyticsService.getServiceHealth();
        
        return {
          success: true,
          data: health,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error checking health status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check service health',
          cause: error,
        });
      }
    }),

  // Webhook Events
  getWebhookEvents: adminProcedure
    .input(paginationSchema.merge(z.object({
      processed: z.boolean().optional(),
      triggerEvent: z.string().optional(),
    })))
    .query(async ({ input }) => {
      try {
        const { limit, offset, processed, triggerEvent } = input;
        
        const where: Prisma.CalWebhookEventWhereInput = {};
        if (processed !== undefined) where.processed = processed;
        if (triggerEvent) where.triggerEvent = triggerEvent;

        const [events, total] = await Promise.all([
          db.calWebhookEvent.findMany({
            where,
            orderBy: { receivedAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
              id: true,
              triggerEvent: true,
              calBookingId: true,
              calBookingUid: true,
              processed: true,
              processingError: true,
              retryCount: true,
              receivedAt: true,
              processedAt: true,
            },
          }),
          db.calWebhookEvent.count({ where }),
        ]);

        return {
          success: true,
          data: {
            events,
            pagination: {
              total,
              hasMore: offset + limit < total,
              nextOffset: offset + limit < total ? offset + limit : null,
            },
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching webhook events:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch webhook events',
          cause: error,
        });
      }
    }),

  // Public endpoint for basic metrics (for homepage, etc.)
  getPublicMetrics: publicProcedure
    .query(async () => {
      try {
        const [totalBookings, totalCustomers, totalRevenue] = await Promise.all([
          db.calBooking.count({
            where: { status: { in: ['ACCEPTED', 'CONFIRMED', 'COMPLETED'] } },
          }),
          db.customer.count(),
          db.calBooking.aggregate({
            where: { paymentStatus: 'COMPLETED' },
            _sum: { paymentAmount: true },
          }),
        ]);

        return {
          success: true,
          data: {
            totalBookings,
            totalCustomers,
            totalRevenue: totalRevenue._sum.paymentAmount ?? 0,
            // Don't expose sensitive data in public endpoint
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        void logger.error('Error fetching public metrics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch public metrics',
          cause: error,
        });
      }
    }),
});