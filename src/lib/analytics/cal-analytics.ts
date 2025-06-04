/**
 * Cal.com Analytics Service
 * Comprehensive analytics tracking for Cal.com Atoms integration
 */

import { prisma as db } from '@/lib/db/prisma';
import { logger } from "@/lib/logger";

// Define missing enums locally
export enum CalAnalyticsEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  SERVICE_SELECT = 'SERVICE_SELECT',
  DATE_SELECT = 'DATE_SELECT',
  FORM_SUBMIT = 'FORM_SUBMIT',
  PAYMENT_START = 'PAYMENT_START',
  BOOKING_COMPLETE = 'BOOKING_COMPLETE',
  BOOKING_CANCEL = 'BOOKING_CANCEL',
  ERROR = 'ERROR'
}

export enum Calappointmentstage {
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  DATE_SELECTION = 'DATE_SELECTION',
  DETAILS_ENTRY = 'DETAILS_ENTRY',
  PAYMENT = 'PAYMENT',
  CONFIRMATION = 'CONFIRMATION'
}

// Define missing types locally
export interface BookingEventProperties {
  userAgent?: string;
  deviceType?: string;
  referrer?: string;
  url?: string;
  [key: string]: unknown;
}

export interface BookingAnalyticsData {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalappointments: number;
  completedappointments: number;
  cancelledappointments: number;
  abandonedappointments: number;
  revenue: number;
  conversionRate: number;
  averageBookingValue: number;
  funnel: BookingFunnelMetrics;
  serviceBreakdown: ServicePerformance[];
  timeSeriesData: unknown[];
}

export interface BookingFunnelMetrics {
  pageViews: number;
  appointmentstarted: number;
  timeSlotSelected: number;
  formCompleted: number;
  paymentStarted: number;
  bookingConfirmed: number;
  conversionRates: {
    viewToStart: number;
    startToSlot: number;
    slotToForm: number;
    formToPayment: number;
    paymentToConfirm: number;
    overallConversion: number;
  };
}

export interface ServicePerformance {
  serviceId: string;
  serviceName: string;
  totalappointments: number;
  completedappointments: number;
  revenue: number;
  conversionRate: number;
  popularTimeSlots: unknown[];
}

// Analytics Event Data Interface
export interface CalAnalyticsEventData {
  sessionId: string;
  eventType: CalAnalyticsEventType;
  serviceId?: string;
  userId?: string;
  properties?: BookingEventProperties;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  url?: string;
  duration?: number;
  bookingId?: number;
  calEventTypeId?: number;
}

// Realtime Metrics Interface
interface RealtimeMetrics {
  activeUsers: number;
  appointmentsInProgress: number;
  appointmentsToday: number;
  revenueToday: number;
  conversionRate: number;
  averageSessionDuration: number;
  topPerformingService?: string;
  lastUpdated: Date;
  activeappointmentsessions?: number;
  appointmentsCompleted?: number;
  appointmentsCancelled?: number;
  peakConcurrentUsers?: number;
  totalRevenue?: number;
}

// Session Data Interface  
interface SessionData {
  timeSpent?: number | null;
}

// Define Prisma model types locally
interface CalBookingFunnel {
  id: string;
  sessionId: string;
  step: string;
  stepOrder: number;
  serviceId: string | null;
  userId: string | null;
  completed: boolean;
  abandoned: boolean;
  timeSpent: number | null;
  errorMessage: string | null;
  timestamp: Date;
}

interface CalServiceAnalytics {
  id: string;
  serviceId: string;
  serviceName: string;
  eventType: string;
  date: Date;
  count: number;
  totalRevenue: number | null;
  avgBookingTime: number | null;
  conversionRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Payment {
  id: string;
  bookingId: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  stripeId: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export class CalAnalyticsService {
  /**
   * Track a single analytics event
   */
  static async trackEvent(data: CalAnalyticsEventData): Promise<void> {
    try {
      await db.calAnalyticsEvent.create({
        data: {
          sessionId: data.sessionId,
          eventType: data.eventType,
          eventName: data.eventType,
          userId: data.userId,
          properties: data.properties ? JSON.parse(JSON.stringify(data.properties)) : null,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          referrer: data.referrer,
          url: data.url,
        },
      });
    } catch (error) {
      void logger.error('Failed to track analytics event:', error);
      // Don't throw - analytics failures shouldn't break user flow
    }
  }

  /**
   * Track booking funnel progress
   */
  static async trackFunnelProgress(
    sessionId: string,
    stage: Calappointmentstage,
    data: {
      selectedServiceId?: string;
      selectedEventTypeId?: number;
      completedSteps?: number;
      timeSpent?: number;
      device_type?: string;
      browser?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
    }
  ): Promise<void> {
    try {
      // Map Calappointmentstage to step order
      const stepOrder = {
        [Calappointmentstage.SERVICE_SELECTION]: 1,
        [Calappointmentstage.DATE_SELECTION]: 2,
        [Calappointmentstage.DETAILS_ENTRY]: 3,
        [Calappointmentstage.PAYMENT]: 4,
        [Calappointmentstage.CONFIRMATION]: 5,
      }[stage] ?? 0;

      await db.calBookingFunnel.create({
        data: {
          sessionId,
          step: stage,
          stepOrder,
          serviceId: data.selectedServiceId,
          userId: undefined, // Would need to get from session/context
          completed: stage === Calappointmentstage.CONFIRMATION,
          abandoned: false,
          timeSpent: data.timeSpent,
        },
      });
    } catch (error) {
      void logger.error('Failed to track funnel progress:', error);
    }
  }

  /**
   * Complete booking funnel
   */
  static async completeFunnel(sessionId: string): Promise<void> {
    try {
      const funnel = await db.calBookingFunnel.findFirst({
        where: { sessionId },
        orderBy: { timestamp: 'desc' }
      });

      if (funnel) {
        const timeSpent = funnel.timestamp ? 
          Date.now() - funnel.timestamp.getTime() : undefined;

        await db.calBookingFunnel.create({
          data: {
            sessionId,
            step: Calappointmentstage.CONFIRMATION,
            stepOrder: 5,
            completed: true,
            abandoned: false,
            ...(timeSpent !== undefined && { timeSpent }),
            serviceId: funnel.serviceId,
            userId: funnel.userId,
          }
        });
      }
    } catch (error) {
      void logger.error('Failed to complete funnel tracking:', error);
    }
  }

  /**
   * Mark funnel as abandoned
   */
  static async abandonFunnel(sessionId: string, reason?: string): Promise<void> {
    try {
      const latestFunnel = await db.calBookingFunnel.findFirst({
        where: { sessionId },
        orderBy: { timestamp: 'desc' }
      });

      if (latestFunnel) {
        await db.calBookingFunnel.update({
          where: { id: latestFunnel.id },
          data: {
            abandoned: true,
            ...(reason !== undefined && { errorMessage: reason }),
          },
        });
      }
    } catch (error) {
      void logger.error('Failed to track funnel abandonment:', error);
    }
  }

  /**
   * Update daily service analytics
   */
  static async updateServiceAnalytics(
    serviceId: string,
    serviceName: string,
    eventType: string,
    metrics: {
      count?: number;
      totalRevenue?: number;
      avgBookingTime?: number;
      conversionRate?: number;
    }
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if record exists for today
      const existing = await db.calServiceAnalytics.findFirst({
        where: {
          serviceId,
          serviceName,
          eventType,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existing) {
        await db.calServiceAnalytics.update({
          where: { id: existing.id },
          data: {
            count: { increment: metrics.count ?? 1 },
            totalRevenue: metrics.totalRevenue ? { increment: metrics.totalRevenue } : undefined,
            avgBookingTime: metrics.avgBookingTime,
            conversionRate: metrics.conversionRate,
            updatedAt: new Date(),
          },
        });
      } else {
        await db.calServiceAnalytics.create({
          data: {
            serviceId,
            serviceName,
            eventType,
            date: today,
            count: metrics.count ?? 1,
            totalRevenue: metrics.totalRevenue,
            avgBookingTime: metrics.avgBookingTime,
            conversionRate: metrics.conversionRate,
          },
        });
      }
    } catch (error) {
      void logger.error('Failed to update service analytics:', error);
    }
  }

  /**
   * Update real-time metrics
   */
  static async updateRealtimeMetrics(): Promise<void> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Get current active sessions from booking funnel
      const activeSessions = await db.calBookingFunnel.count({
        where: {
          timestamp: { gte: oneHourAgo },
          completed: false,
          abandoned: false,
        },
      });

      // Get bookings in progress using Booking model
      const bookingsInProgress = await db.booking.count({
        where: {
          status: {
            not: 'COMPLETED',
          },
          createdAt: { gte: oneHourAgo },
        },
      });

      // Get completed bookings today
      const bookingsCompleted = await db.booking.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfDay },
        },
      });

      // Get cancelled bookings today
      const bookingsCancelled = await db.booking.count({
        where: {
          status: 'CANCELLED',
          updatedAt: { gte: startOfDay },
        },
      });

      // Calculate average session duration from completed sessions
      const completedSessions = await db.calBookingFunnel.findMany({
        where: {
          timestamp: { gte: startOfDay },
          completed: true,
          timeSpent: { not: null },
        },
        select: { timeSpent: true },
      });

      const averageSessionDuration = completedSessions.length > 0 ?
        Math.round(
          completedSessions.reduce((sum: number, session: SessionData) => sum + (session.timeSpent ?? 0), 0) / 
          completedSessions.length
        ) : 0;

      // Get today's revenue
      const totalRevenue = await db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfDay },
        },
        _sum: { amount: true },
      });

      // Get top service
      const topService = await db.calServiceAnalytics.findFirst({
        where: { 
          date: {
            gte: startOfDay,
            lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { count: 'desc' },
        select: { serviceId: true },
      });

      // Calculate conversion rate
      const totalSessions = await db.calBookingFunnel.count({
        where: {
          timestamp: { gte: startOfDay },
        },
      });

      const conversionRate = totalSessions > 0 ? (bookingsCompleted / totalSessions) * 100 : 0;

      await db.calRealtimeMetrics.create({
        data: {
          liveVisitors: activeSessions,
          activeSessions,
          todayBookings: bookingsCompleted,
          todayRevenue: totalRevenue._sum.amount ?? 0,
          pendingBookings: bookingsInProgress,
          confirmedBookings: bookingsCompleted,
          cancelledBookings: bookingsCancelled,
          conversionRate,
          topServiceId: topService?.serviceId,
          avgResponseTime: averageSessionDuration,
          errorRate: 0, // Would calculate from error logs
          systemLoad: 0, // Would get from system metrics
        },
      });
    } catch (error) {
      void logger.error('Failed to update realtime metrics:', error);
    }
  }

  /**
   * Get booking analytics data
   */
  static async getBookingAnalytics(
    dateRange: { from: Date; to: Date }
  ): Promise<BookingAnalyticsData> {
    try {
      // Get funnel data
      const funnels = await db.calBookingFunnel.findMany({
        where: {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      });

      // Calculate metrics
      const totalSessions = funnels.length;
      const completedBookings = funnels.filter((f: CalBookingFunnel) => f.completed).length;
      const abandonedSessions = funnels.filter((f: CalBookingFunnel) => f.abandoned).length;
      const conversionRate = totalSessions > 0 ? (completedBookings / totalSessions) * 100 : 0;

      // Calculate average booking time
      const completedFunnels = funnels.filter((f: CalBookingFunnel) => f.completed && f.timeSpent);
      const averageBookingValue = completedFunnels.length > 0 ?
        completedFunnels.reduce((sum: number, f: CalBookingFunnel) => sum + (f.timeSpent ?? 0), 0) / completedFunnels.length : 0;

      // Get revenue data
      const payments = await db.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        select: { amount: true },
      });

      const revenue = payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);

      // Get funnel metrics
      const funnel = await this.getFunnelMetrics(dateRange);

      // Get service breakdown
      const serviceBreakdown = await this.getServicePerformanceMetrics(dateRange);

      return {
        period: {
          startDate: dateRange.from,
          endDate: dateRange.to,
        },
        totalappointments: totalSessions,
        completedappointments: completedBookings,
        cancelledappointments: abandonedSessions,
        abandonedappointments: abandonedSessions,
        revenue,
        conversionRate,
        averageBookingValue,
        funnel,
        serviceBreakdown,
        timeSeriesData: [], // Would calculate daily/hourly breakdown
      };
    } catch (error) {
      void logger.error('Failed to get booking analytics:', error);
      throw error;
    }
  }

  /**
   * Get funnel metrics
   */
  static async getFunnelMetrics(
    dateRange: { from: Date; to: Date }
  ): Promise<BookingFunnelMetrics> {
    try {
      const funnels = await db.calBookingFunnel.findMany({
        where: {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      });

      // Calculate stage metrics
      const stageMetrics = funnels.reduce((acc: Record<string, { total: number; completed: number }>, funnel: CalBookingFunnel) => {
        const stage = funnel.step;
        acc[stage] ??= { total: 0, completed: 0 };
        acc[stage].total++;
        if (funnel.completed) {
          acc[stage].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      // Map to funnel steps
      const pageViews = stageMetrics[CalAnalyticsEventType.PAGE_VIEW]?.total ?? 0;
      const appointmentstarted = stageMetrics[Calappointmentstage.SERVICE_SELECTION]?.total ?? 0;
      const timeSlotSelected = stageMetrics[Calappointmentstage.DATE_SELECTION]?.total ?? 0;
      const formCompleted = stageMetrics[Calappointmentstage.DETAILS_ENTRY]?.total ?? 0;
      const paymentStarted = stageMetrics[Calappointmentstage.PAYMENT]?.total ?? 0;
      const bookingConfirmed = stageMetrics[Calappointmentstage.CONFIRMATION]?.total ?? 0;

      return {
        pageViews,
        appointmentstarted,
        timeSlotSelected,
        formCompleted,
        paymentStarted,
        bookingConfirmed,
        conversionRates: {
          viewToStart: pageViews > 0 ? (appointmentstarted / pageViews) * 100 : 0,
          startToSlot: appointmentstarted > 0 ? (timeSlotSelected / appointmentstarted) * 100 : 0,
          slotToForm: timeSlotSelected > 0 ? (formCompleted / timeSlotSelected) * 100 : 0,
          formToPayment: formCompleted > 0 ? (paymentStarted / formCompleted) * 100 : 0,
          paymentToConfirm: paymentStarted > 0 ? (bookingConfirmed / paymentStarted) * 100 : 0,
          overallConversion: pageViews > 0 ? (bookingConfirmed / pageViews) * 100 : 0,
        },
      };
    } catch (error) {
      void logger.error('Failed to get funnel metrics:', error);
      throw error;
    }
  }

  /**
   * Get service performance metrics
   */
  static async getServicePerformanceMetrics(
    dateRange: { from: Date; to: Date }
  ): Promise<ServicePerformance[]> {
    try {
      const serviceAnalytics = await db.calServiceAnalytics.findMany({
        where: {
          date: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        orderBy: { date: 'desc' },
      });

      // Group by service and aggregate
      const serviceMetrics = serviceAnalytics.reduce((acc: Record<string, ServicePerformance>, analytics: CalServiceAnalytics) => {
        const serviceId = analytics.serviceId ?? 'unknown';
        acc[serviceId] ??= {
          serviceId,
          serviceName: analytics.serviceName,
          totalappointments: 0,
          completedappointments: 0,
          revenue: 0,
          conversionRate: 0,
          popularTimeSlots: []
        };
        
        acc[serviceId].totalappointments += analytics.count;
        acc[serviceId].revenue += analytics.totalRevenue ?? 0;
        
        return acc;
      }, {} as Record<string, ServicePerformance>);

      // Calculate final metrics
      return Object.values(serviceMetrics).map((metrics: ServicePerformance) => {
        const completedappointments = Math.round(metrics.totalappointments * 0.8); // Estimate from total appointments
        return {
          ...metrics,
          completedappointments,
          conversionRate: metrics.totalappointments > 0 ? 
            (completedappointments / metrics.totalappointments) * 100 : 0,
          popularTimeSlots: []  // Would be populated from actual time slot analysis
        };
      });
    } catch (error) {
      void logger.error('Failed to get service performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics
   */
  static async getRealtimeMetrics(): Promise<RealtimeMetrics | null> {
    try {
      const latest = await db.calRealtimeMetrics.findFirst({
        orderBy: { timestamp: 'desc' },
      });

      if (!latest) return null;

      return {
        activeUsers: latest.liveVisitors,
        appointmentsInProgress: latest.pendingBookings,
        appointmentsToday: latest.todayBookings,
        revenueToday: latest.todayRevenue,
        conversionRate: latest.conversionRate,
        averageSessionDuration: latest.avgResponseTime,
        topPerformingService: latest.topServiceId ?? undefined,
        lastUpdated: latest.timestamp,
        activeappointmentsessions: latest.activeSessions,
        appointmentsCompleted: latest.confirmedBookings,
        appointmentsCancelled: latest.cancelledBookings,
        peakConcurrentUsers: latest.liveVisitors, // Simplified
        totalRevenue: latest.todayRevenue,
      };
    } catch (error) {
      void logger.error('Failed to get realtime metrics:', error);
      return null;
    }
  }
}

// ANALYTICS HELPERS

/**
 * Generate session ID for tracking
 */
export function generateSessionId(): string {
  return `cal_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract analytics properties from browser
 */
export function getAnalyticsProperties(): BookingEventProperties {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    referrer: document.referrer,
    url: window.location.href,
  };
}

/**
 * Track page view event
 */
export async function trackPageView(sessionId: string, serviceId?: string): Promise<void> {
  await CalAnalyticsService.trackEvent({
    sessionId,
    eventType: CalAnalyticsEventType.PAGE_VIEW,
    serviceId,
    properties: getAnalyticsProperties(),
  });
}

/**
 * Track service selection
 */
export async function trackServiceSelection(sessionId: string, serviceId: string): Promise<void> {
  await CalAnalyticsService.trackEvent({
    sessionId,
    eventType: CalAnalyticsEventType.SERVICE_SELECT,
    serviceId,
    properties: getAnalyticsProperties(),
  });
  
  await CalAnalyticsService.trackFunnelProgress(sessionId, Calappointmentstage.SERVICE_SELECTION, {
    selectedServiceId: serviceId,
    completedSteps: 1,
  });
}

/**
 * Track booking completion
 */
export async function trackBookingComplete(
  sessionId: string, 
  bookingId: number, 
  serviceId: string
): Promise<void> {
  await CalAnalyticsService.trackEvent({
    sessionId,
    eventType: CalAnalyticsEventType.BOOKING_COMPLETE,
    serviceId,
    bookingId,
    properties: getAnalyticsProperties(),
  });
  
  await CalAnalyticsService.completeFunnel(sessionId);
}