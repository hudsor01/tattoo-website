/**
 * Cal.com Analytics Service - Simplified Version
 * Basic analytics tracking adapted for simplified schema
 */

import { prisma as db } from '@/lib/db/prisma';
import { logger } from "@/lib/logger";

// Define analytics enums locally
export enum CalAnalyticsEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  SERVICE_SELECT = 'SERVICE_SELECT',
  DATE_SELECT = 'DATE_SELECT',
  FORM_SUBMIT = 'FORM_SUBMIT',
  FORM_START = 'FORM_START',
  FORM_COMPLETE = 'FORM_COMPLETE',
  PAYMENT_START = 'PAYMENT_START',
  PAYMENT_COMPLETE = 'PAYMENT_COMPLETE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BOOKING_START = 'BOOKING_START',
  BOOKING_COMPLETE = 'BOOKING_COMPLETE',
  BOOKING_CANCEL = 'BOOKING_CANCEL',
  ERROR = 'ERROR'
}

export enum CalBookingStage {
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  DATE_SELECTION = 'DATE_SELECTION',
  DETAILS_ENTRY = 'DETAILS_ENTRY',
  PAYMENT = 'PAYMENT',
  CONFIRMATION = 'CONFIRMATION'
}

// Define analytics types locally
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
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  abandonedBookings: number;
  revenue: number;
  conversionRate: number;
  averageBookingValue: number;
  funnel: BookingFunnelMetrics;
  serviceBreakdown: ServicePerformance[];
  timeSeriesData: unknown[];
}

export interface BookingFunnelMetrics {
  pageViews: number;
  bookingsStarted: number;
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
  totalBookings: number;
  completedBookings: number;
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
  bookingId?: string;
  calEventTypeId?: number;
}

// Realtime Metrics Interface
interface RealtimeMetrics {
  activeUsers: number;
  bookingsInProgress: number;
  bookingsToday: number;
  revenueToday: number;
  conversionRate: number;
  averageSessionDuration: number;
  topPerformingService?: string;
  lastUpdated: Date;
  activeBookingSessions?: number;
  bookingsCompleted?: number;
  bookingsCancelled?: number;
  peakConcurrentUsers?: number;
  totalRevenue?: number;
}

export class CalAnalyticsService {
  static async trackEvent(data: CalAnalyticsEventData): Promise<void> {
    try {
      // For now, we'll log the event and could store in a simple analytics table later
      void logger.info('Cal Analytics Event:', {
        sessionId: data.sessionId,
        eventType: data.eventType,
        serviceId: data.serviceId,
        userId: data.userId,
      });

      // Store basic analytics event in system log for now
      // In production, consider adding dedicated analytics tables to Prisma schema
      void logger.info('Cal Analytics Event Tracked:', {
        timestamp: new Date().toISOString(),
        sessionId: data.sessionId,
        eventType: data.eventType,
        serviceId: data.serviceId,
        userId: data.userId,
        bookingId: data.bookingId,
        calEventTypeId: data.calEventTypeId,
        duration: data.duration,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        referrer: data.referrer,
        url: data.url,
        properties: data.properties,
      });
    } catch (error) {
      void logger.error('Failed to track analytics event:', error);
      // Don't throw - analytics failures shouldn't break user flow
    }
  }

  static async trackFunnelProgress(
    sessionId: string,
    stage: CalBookingStage,
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
      void logger.info('Funnel Progress:', {
        sessionId,
        stage,
        data,
      });
      
      // Log funnel progress for analytics tracking
      void logger.info('Cal Funnel Progress Tracked:', {
        timestamp: new Date().toISOString(),
        sessionId,
        stage,
        selectedServiceId: data.selectedServiceId,
        selectedEventTypeId: data.selectedEventTypeId,
        completedSteps: data.completedSteps,
        timeSpent: data.timeSpent,
        device_type: data.device_type,
        browser: data.browser,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
      });
    } catch (error) {
      void logger.error('Failed to track funnel progress:', error);
    }
  }


  static async abandonFunnel(sessionId: string, reason?: string): Promise<void> {
    try {
      void logger.info('Funnel Abandoned:', { sessionId, reason });
      
      // Log funnel abandonment for analytics tracking
      void logger.info('Cal Funnel Abandoned:', {
        timestamp: new Date().toISOString(),
        sessionId,
        reason: reason ?? 'unknown',
        abandonmentPoint: 'user_exit',
      });
    } catch (error) {
      void logger.error('Failed to track funnel abandonment:', error);
    }
  }

  static async getBookingAnalytics(
    dateRange: { from: Date; to: Date }
  ): Promise<BookingAnalyticsData> {
    try {
      // Get bookings from our simplified schema
      const bookings = await db.booking.findMany({
        where: {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
      const abandonedBookings = bookings.filter(b => b.status === 'PENDING').length;

      const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Mock funnel metrics since we don't have Cal funnel models yet
      const funnel: BookingFunnelMetrics = {
        pageViews: totalBookings * 3, // Estimated
        bookingsStarted: totalBookings,
        timeSlotSelected: Math.round(totalBookings * 0.8),
        formCompleted: Math.round(totalBookings * 0.7),
        paymentStarted: Math.round(totalBookings * 0.6),
        bookingConfirmed: completedBookings,
        conversionRates: {
          viewToStart: 33.3,
          startToSlot: 80,
          slotToForm: 87.5,
          formToPayment: 85.7,
          paymentToConfirm: conversionRate,
          overallConversion: conversionRate,
        },
      };

      return {
        period: {
          startDate: dateRange.from,
          endDate: dateRange.to,
        },
        totalBookings,
        completedBookings,
        cancelledBookings,
        abandonedBookings,
        revenue: 0, // Revenue calculation would require Payment model integration
        conversionRate,
        averageBookingValue: 0,
        funnel,
        serviceBreakdown: [], // Service breakdown would require analytics aggregation tables
        timeSeriesData: [],
      };
    } catch (error) {
      void logger.error('Failed to get booking analytics:', error);
      throw error;
    }
  }

  static async getFunnelMetrics(
    dateRange: { from: Date; to: Date }
  ): Promise<BookingFunnelMetrics> {
    try {
      const bookings = await db.booking.count({
        where: {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      });

      // Return calculated funnel metrics based on current bookings
      return {
        pageViews: bookings * 3,
        bookingsStarted: bookings,
        timeSlotSelected: Math.round(bookings * 0.8),
        formCompleted: Math.round(bookings * 0.7),
        paymentStarted: Math.round(bookings * 0.6),
        bookingConfirmed: Math.round(bookings * 0.5),
        conversionRates: {
          viewToStart: 33.3,
          startToSlot: 80,
          slotToForm: 87.5,
          formToPayment: 85.7,
          paymentToConfirm: 83.3,
          overallConversion: 16.7,
        },
      };
    } catch (error) {
      void logger.error('Failed to get funnel metrics:', error);
      throw error;
    }
  }

  static async getServicePerformanceMetrics(
    _dateRange: { from: Date; to: Date }
  ): Promise<ServicePerformance[]> {
    // Return mock service data for now
    // Return mock service performance data - would be replaced with real analytics aggregation
    return [
      {
        serviceId: 'consultation',
        serviceName: 'Free Consultation',
        totalBookings: 10,
        completedBookings: 8,
        revenue: 0,
        conversionRate: 80,
        popularTimeSlots: [],
      },
      {
        serviceId: 'tattoo-session',
        serviceName: 'Tattoo Session',
        totalBookings: 15,
        completedBookings: 12,
        revenue: 1800,
        conversionRate: 80,
        popularTimeSlots: [],
      },
    ];
  }

  static async getRealtimeMetrics(): Promise<RealtimeMetrics | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayBookings = await db.booking.count({
        where: {
          createdAt: { gte: today },
        },
      });

      return {
        activeUsers: 5, // Would be calculated from active sessions in production
        bookingsInProgress: 2,
        bookingsToday: todayBookings,
        revenueToday: 0,
        conversionRate: 75,
        averageSessionDuration: 180,
        topPerformingService: 'consultation',
        lastUpdated: new Date(),
        activeBookingSessions: 1,
        bookingsCompleted: Math.round(todayBookings * 0.8),
        bookingsCancelled: Math.round(todayBookings * 0.1),
        peakConcurrentUsers: 8,
        totalRevenue: 0,
      };
    } catch (error) {
      void logger.error('Failed to get realtime metrics:', error);
      return null;
    }
  }

  // Additional service analytics methods (simplified for current schema)
  static async updateServiceAnalytics(
    serviceId: string,
    eventTypeId: number,
    updates: {
      views?: number;
      selections?: number;
      appointments?: number;
      completions?: number;
      cancellations?: number;
      reschedules?: number;
      revenue?: number;
    }
  ): Promise<void> {
    try {
      void logger.info('Service Analytics Update:', {
        serviceId,
        eventTypeId,
        updates,
      });
      // Log service analytics update for tracking
      void logger.info('Service Analytics Updated:', {
        timestamp: new Date().toISOString(),
        serviceId,
        eventTypeId,
        updates,
      });
    } catch (error) {
      void logger.error('Failed to update service analytics:', error);
    }
  }

  static async completeFunnel(sessionId: string, bookingId?: number): Promise<void> {
    try {
      void logger.info('Funnel Completed:', { sessionId, bookingId });
      // Log funnel completion for analytics tracking
      void logger.info('Cal Funnel Completed:', {
        timestamp: new Date().toISOString(),
        sessionId,
        bookingId,
        conversionComplete: true,
      });
    } catch (error) {
      void logger.error('Failed to complete funnel tracking:', error);
    }
  }
}

export function generateSessionId(): string {
  return `cal_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getAnalyticsProperties(): BookingEventProperties {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    referrer: document.referrer,
    url: window.location.href,
  };
}

export async function trackPageView(sessionId: string, serviceId?: string): Promise<void> {
  await CalAnalyticsService.trackEvent({
    sessionId,
    eventType: CalAnalyticsEventType.PAGE_VIEW,
    serviceId,
    properties: getAnalyticsProperties(),
  });
}

export async function trackServiceSelection(sessionId: string, serviceId: string): Promise<void> {
  await CalAnalyticsService.trackEvent({
    sessionId,
    eventType: CalAnalyticsEventType.SERVICE_SELECT,
    serviceId,
    properties: getAnalyticsProperties(),
  });
  
  await CalAnalyticsService.trackFunnelProgress(sessionId, CalBookingStage.SERVICE_SELECTION, {
    selectedServiceId: serviceId,
    completedSteps: 1,
  });
}

export async function trackBookingComplete(
  sessionId: string, 
  bookingId: string, 
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