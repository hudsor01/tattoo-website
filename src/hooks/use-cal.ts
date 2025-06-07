/**
 * Consolidated Cal.com hooks for analytics and appointments
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { logger } from "@/lib/logger";
import { 
  generateSessionId, 
  trackPageView, 
  trackServiceSelection, 
  trackBookingComplete,
  CalAnalyticsService,
  getAnalyticsProperties,
  CalAnalyticsEventType,
  CalBookingStage
} from '@/lib/analytics/cal-analytics';
import type { Booking } from '@prisma/client';

// Define booking type using actual Prisma model
export type CalBooking = Booking;

// Local type aliases for backward compatibility
type Calappointmentstage = CalBookingStage;

/**
 * Hook for managing analytics session
 */
export function useCalAnalyticsSession() {
  const sessionIdRef = useRef<string | undefined>(undefined);

  const getSessionId = useCallback(() => {
    sessionIdRef.current ??= generateSessionId();
    return sessionIdRef.current;
  }, []);

  const resetSession = useCallback(() => {
    sessionIdRef.current = generateSessionId();
    return sessionIdRef.current;
  }, []);

  return {
    sessionId: getSessionId(),
    getSessionId,
    resetSession,
  };
}

/**
 * Hook for tracking page views
 */
export function useCalPageTracking(serviceId?: string) {
  const { sessionId } = useCalAnalyticsSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      void trackPageView(sessionId, serviceId);
    }
  }, [sessionId, serviceId]);

  return { sessionId };
}

/**
 * Hook for tracking booking events
 */
export function useCalBookingTracking() {
  const { sessionId } = useCalAnalyticsSession();

  const trackEvent = useCallback(async (
    eventType: CalAnalyticsEventType,
    data: {
      serviceId?: string;
      bookingId?: string;
      calEventTypeId?: number;
      duration?: number;
      properties?: Record<string, unknown>;
    } = {}
  ) => {
    try {
      await CalAnalyticsService.trackEvent({
        sessionId,
        eventType,
        serviceId: data.serviceId,
        bookingId: data.bookingId,
        calEventTypeId: data.calEventTypeId,
        duration: data.duration,
        properties: {
          ...getAnalyticsProperties(),
          ...data.properties,
        },
      });
    } catch (error) {
      void logger.error('Failed to track booking event:', error);
    }
  }, [sessionId]);

  const trackServiceSelect = useCallback(async (serviceId: string) => {
    await trackServiceSelection(sessionId, serviceId);
  }, [sessionId]);

  const trackappointmentstart = useCallback(async (serviceId: string, calEventTypeId?: number) => {
    await trackEvent(CalAnalyticsEventType.BOOKING_START, { 
      serviceId, 
      ...(calEventTypeId !== undefined && { calEventTypeId })
    });
  }, [trackEvent]);

  const trackBookingCancel = useCallback(async (serviceId: string, reason?: string) => {
    await trackEvent(CalAnalyticsEventType.BOOKING_CANCEL, { 
      serviceId, 
      properties: { cancellationReason: reason } 
    });
  }, [trackEvent]);

  const trackFormStart = useCallback(async (serviceId: string) => {
    await trackEvent(CalAnalyticsEventType.FORM_START, { serviceId });
  }, [trackEvent]);

  const trackFormComplete = useCallback(async (serviceId: string) => {
    await trackEvent(CalAnalyticsEventType.FORM_COMPLETE, { serviceId });
  }, [trackEvent]);

  const trackPaymentStart = useCallback(async (serviceId: string, amount: number) => {
    await trackEvent(CalAnalyticsEventType.PAYMENT_START, { 
      serviceId, 
      properties: { amount } 
    });
  }, [trackEvent]);

  const trackPaymentComplete = useCallback(async (
    serviceId: string, 
    amount: number, 
    paymentMethod: string
  ) => {
    await trackEvent(CalAnalyticsEventType.PAYMENT_COMPLETE, { 
      serviceId, 
      properties: { amount, paymentMethod } 
    });
  }, [trackEvent]);

  const trackPaymentFailed = useCallback(async (
    serviceId: string, 
    amount: number, 
    error: string
  ) => {
    await trackEvent(CalAnalyticsEventType.PAYMENT_FAILED, { 
      serviceId, 
      properties: { amount, error } 
    });
  }, [trackEvent]);

  const trackComplete = useCallback(async (
    bookingId: string, 
    serviceId: string
  ) => {
    await trackBookingComplete(sessionId, bookingId, serviceId);
  }, [sessionId]);

  return {
    sessionId,
    trackEvent,
    trackServiceSelect,
    trackappointmentstart,
    trackBookingCancel,
    trackFormStart,
    trackFormComplete,
    trackPaymentStart,
    trackPaymentComplete,
    trackPaymentFailed,
    trackComplete,
  };
}

/**
 * Hook for tracking booking funnel progress
 */
export function useCalFunnelTracking() {
  const { sessionId } = useCalAnalyticsSession();

  const updateStage = useCallback(async (
    stage: Calappointmentstage,
    data: {
      selectedServiceId?: string;
      selectedEventTypeId?: number;
      completedSteps?: number;
    } = {}
  ) => {
    try {
      const browserData = typeof window !== 'undefined' ? {
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'chrome' : 
                navigator.userAgent.includes('Firefox') ? 'firefox' :
                navigator.userAgent.includes('Safari') ? 'safari' : 'other',
      } : {};

      const urlParams = typeof window !== 'undefined' ? 
        new URLSearchParams(window.location.search) : new URLSearchParams();
      
      await CalAnalyticsService.trackFunnelProgress(sessionId, stage, {
        ...data,
        ...browserData,
        ...(urlParams.get('utm_source') && { utm_source: urlParams.get('utm_source') as string }),
        ...(urlParams.get('utm_medium') && { utm_medium: urlParams.get('utm_medium') as string }),
        ...(urlParams.get('utm_campaign') && { utm_campaign: urlParams.get('utm_campaign') as string }),
      });
    } catch (error) {
      void logger.error('Failed to update funnel stage:', error);
    }
  }, [sessionId]);

  const markAbandoned = useCallback(async (reason?: string) => {
    try {
      await CalAnalyticsService.abandonFunnel(sessionId, reason);
    } catch (error) {
      void logger.error('Failed to mark funnel as abandoned:', error);
    }
  }, [sessionId]);

  const complete = useCallback(async (bookingId?: number) => {
    try {
      await CalAnalyticsService.completeFunnel(sessionId, bookingId);
    } catch (error) {
      void logger.error('Failed to complete funnel:', error);
    }
  }, [sessionId]);

  return {
    sessionId,
    updateStage,
    markAbandoned,
    complete,
  };
}

/**
 * Hook for automatic abandonment tracking
 */
export function useCalAbandonmentTracking(timeoutMs: number = 300000) { // 5 minutes default
  const { markAbandoned } = useCalFunnelTracking();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      void markAbandoned('timeout');
    }, timeoutMs);
  }, [markAbandoned, timeoutMs]);

  const clearAbandonmentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    resetTimeout();
    
    const handleActivity = () => resetTimeout();
    const events = ['click', 'scroll', 'keypress', 'mousemove'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearAbandonmentTimeout();
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimeout, clearAbandonmentTimeout]);

  return {
    resetTimeout,
    clearTimeout: clearAbandonmentTimeout,
  };
}

/**
 * Hook for tracking service interactions
 */
export function useCalServiceTracking(serviceId: string, eventTypeId: number) {
  const incrementView = useCallback(async () => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        views: 1,
      });
    } catch (error) {
      void logger.error('Failed to track service view:', error);
    }
  }, [serviceId, eventTypeId]);

  const incrementSelection = useCallback(async () => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        selections: 1,
      });
    } catch (error) {
      void logger.error('Failed to track service selection:', error);
    }
  }, [serviceId, eventTypeId]);

  const incrementBooking = useCallback(async (revenue?: number) => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        appointments: 1,
        ...(revenue !== undefined && { revenue }),
      });
    } catch (error) {
      void logger.error('Failed to track service booking:', error);
    }
  }, [serviceId, eventTypeId]);

  const incrementCompletion = useCallback(async () => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        completions: 1,
      });
    } catch (error) {
      void logger.error('Failed to track service completion:', error);
    }
  }, [serviceId, eventTypeId]);

  const incrementCancellation = useCallback(async () => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        cancellations: 1,
      });
    } catch (error) {
      void logger.error('Failed to track service cancellation:', error);
    }
  }, [serviceId, eventTypeId]);

  const incrementReschedule = useCallback(async () => {
    try {
      await CalAnalyticsService.updateServiceAnalytics(serviceId, eventTypeId, {
        reschedules: 1,
      });
    } catch (error) {
      void logger.error('Failed to track service reschedule:', error);
    }
  }, [serviceId, eventTypeId]);

  // Track view on mount
  useEffect(() => {
    void incrementView();
  }, [incrementView]);

  return {
    incrementView,
    incrementSelection,
    incrementBooking,
    incrementCompletion,
    incrementCancellation,
    incrementReschedule,
  };
}

/**
 * Hook for performance timing
 */
export function useCalPerformanceTracking() {
  const startTimeRef = useRef<number | undefined>(undefined);

  const startTiming = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTiming = useCallback((): number => {
    if (!startTimeRef.current) return 0;
    const duration = Date.now() - startTimeRef.current;
    startTimeRef.current = undefined;
    return duration;
  }, []);

  return {
    startTiming,
    endTiming,
  };
}

/**
 * Hook for managing Cal.com appointments
 * Provides appointment management functionality with proper error handling
 */
export function useCalappointments() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [calappointments] = useState<CalBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync appointments (placeholder)
  const syncappointments = useCallback(async () => {
    setIsSyncing(true);
    try {
      // Sync appointments from Cal.com API
      const response = await fetch('/api/cal/appointments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync appointments');
      }
      toast({
        title: 'Success',
        description: 'Appointments synced successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to sync appointments',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Update booking status (placeholder)
  const updateappointmentstatus = useCallback(
    async (uid: string, status: 'accepted' | 'cancelled' | 'rejected') => {
      try {
        // Update booking status via API
        const response = await fetch('/api/cal/appointments/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, status }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update booking status');
        }
        
        void logger.info('Updated booking status:', { uid, status });
        toast({
          title: 'Success',
          description: 'Booking status updated',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to update booking status',
          variant: 'destructive',
        });
      }
    },
    []
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      // Refetch appointments from API
      const response = await fetch('/api/cal/appointments');
      if (response.ok) {
        // Data would be handled by the appointment management system
        void logger.info('Appointments refetched successfully');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    calappointments,
    isLoading,
    isSyncing,
    syncappointments,
    updateappointmentstatus,
    refetch,
  };
}
