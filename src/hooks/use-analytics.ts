/**
 * Analytics Hooks
 *
 * This file provides React hooks for tracking analytics events
 * throughout the application.
 */

import { useCallback, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc/client';
import type {
  AnalyticsEventType,
  BaseEventType,
  BookingEventType,
  ConversionEventType,
  ErrorEventType,
  GalleryEventType,
  InteractionEventType,
  PageViewEventType,
} from '@/lib/trpc/routers/types';
import { EventCategory } from '@/lib/trpc/routers/types';
import { v4 as uuidv4 } from 'uuid';
import { usePathname, useSearchParams } from 'next/navigation';
import { getDeviceInfo } from '@/lib/utils/browser/device-detection';

// Simple cookie utilities for client-side use
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, options: { maxAge?: number; path?: string } = {}) => {
  if (typeof document === 'undefined') return;
  let cookieString = `${name}=${value}`;
  if (options.maxAge) cookieString += `; max-age=${options.maxAge}`;
  if (options.path) cookieString += `; path=${options.path}`;
  document.cookie = cookieString;
};

/**
 * Main analytics hook for tracking events
 */
export const useAnalytics = () => {
  const pathname = usePathname();

  // Get the current session ID from cookie or create a new one
  const getSessionId = useCallback(() => {
    const existingSessionId = getCookie('tattoo_session_id');

    if (existingSessionId) {
      return existingSessionId as string;
    }

    const newSessionId = uuidv4();

    // Set session ID cookie, expires in 30 minutes
    setCookie('tattoo_session_id', newSessionId, {
      maxAge: 30 * 60, // 30 minutes
      path: '/',
    });

    return newSessionId;
  }, []);

  // Get device information
  const getDeviceInfoForAnalytics = useCallback(() => {
    const deviceInfo = getDeviceInfo();
    
    return {
      deviceType: deviceInfo.deviceType || undefined,
      browser: deviceInfo.browser || undefined,
      os: deviceInfo.os || undefined,
    };
  }, []);

  // tRPC procedures
  // Check the actual procedure names in your analytics router
  const trackEventMutation = trpc.analytics.track.useMutation();
  const trackPageViewMutation = trpc.analytics.trackPageView.useMutation();
  const trackInteractionMutation = trpc.analytics.trackInteraction.useMutation();
  const trackBookingEventMutation = trpc.analytics.trackBooking.useMutation();
  const trackGalleryEventMutation = trpc.analytics.trackGallery.useMutation();
  const trackConversionMutation = trpc.analytics.trackConversion.useMutation();
  const trackErrorMutation = trpc.analytics.trackError.useMutation();

  // Add common properties to events
  const enhanceEvent = useCallback(
    <T extends BaseEventType>(event: T): T => {
      const sessionId = getSessionId();
      const { deviceType, browser, os } = getDeviceInfoForAnalytics();

      return {
        ...event,
        timestamp: event.timestamp || new Date(),
        sessionId: event.sessionId || sessionId,
        path: event.path || pathname,
        deviceType: event.deviceType || deviceType,
        browser: event.browser || browser,
        os: event.os || os,
      };
    },
    [pathname, getSessionId, getDeviceInfoForAnalytics],
  );

  // Track a generic event
  const trackEvent = useCallback(
    (event: AnalyticsEventType) => {
      const enhancedEvent = enhanceEvent(event);
      trackEventMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackEventMutation],
  );

  // Track a page view
  const trackPageView = useCallback(
    (event: Omit<PageViewEventType, 'category' | 'action'>) => {
      const pageViewEvent: PageViewEventType = {
        ...event,
        category: EventCategory.PAGE_VIEW,
        action: 'view',
      };

      const enhancedEvent = enhanceEvent(pageViewEvent);
      trackPageViewMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackPageViewMutation],
  );

  // Track an interaction
  const trackInteraction = useCallback(
    (event: Omit<InteractionEventType, 'category'>) => {
      const interactionEvent: InteractionEventType = {
        ...event,
        category: EventCategory.INTERACTION,
      };

      const enhancedEvent = enhanceEvent(interactionEvent);
      trackInteractionMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackInteractionMutation],
  );

  // Track a booking event
  const trackBookingEvent = useCallback(
    (event: Omit<BookingEventType, 'category'>) => {
      const bookingEvent: BookingEventType = {
        ...event,
        category: EventCategory.BOOKING,
      };

      const enhancedEvent = enhanceEvent(bookingEvent);
      trackBookingEventMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackBookingEventMutation],
  );

  // Track a gallery event
  const trackGalleryEvent = useCallback(
    (event: Omit<GalleryEventType, 'category'>) => {
      const galleryEvent: GalleryEventType = {
        ...event,
        category: EventCategory.GALLERY,
      };

      const enhancedEvent = enhanceEvent(galleryEvent);
      trackGalleryEventMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackGalleryEventMutation],
  );

  // Track a conversion
  const trackConversion = useCallback(
    (event: Omit<ConversionEventType, 'category'>) => {
      const conversionEvent: ConversionEventType = {
        ...event,
        category: EventCategory.CONVERSION,
      };

      const enhancedEvent = enhanceEvent(conversionEvent);
      trackConversionMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackConversionMutation],
  );

  // Track an error
  const trackError = useCallback(
    (event: Omit<ErrorEventType, 'category' | 'action'>) => {
      const errorEvent: ErrorEventType = {
        ...event,
        category: EventCategory.ERROR,
        action: 'error',
      };

      const enhancedEvent = enhanceEvent(errorEvent);
      trackErrorMutation.mutate(enhancedEvent);
    },
    [enhanceEvent, trackErrorMutation],
  );

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
    trackBookingEvent,
    trackGalleryEvent,
    trackConversion,
    trackError,
  };
};

/**
 * Hook for automatic page view tracking
 */
export const usePageViewTracking = (pageTitle?: string) => {
  const { trackPageView } = useAnalytics();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();

  // Track page views
  useEffect(() => {
    // Skip tracking during development if needed
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_ANALYTICS_IN_DEV === 'true') {
      return;
    }

    // Track the page view
    // Use the provided title or a default
    trackPageView({
      pageTitle: pageTitle || (typeof document !== 'undefined' ? document.title : 'Home'),
      path: pathname,
    });
  }, [pathname, searchParamsString, trackPageView, pageTitle]);
};

/**
 * Hook for tracking booking funnel events
 */
export const useBookingAnalytics = () => {
  const { trackBookingEvent, trackConversion } = useAnalytics();
  const startTimeRef = useRef<Date>();

  // Start booking flow tracking
  const startBookingFlow = useCallback(
    (serviceId?: string, serviceName?: string) => {
      startTimeRef.current = new Date();

      trackBookingEvent({
        action: 'start',
        serviceId,
        serviceName,
        step: 1,
        totalSteps: 4, // Example: 4-step booking process
      });
    },
    [trackBookingEvent],
  );

  // Track service selection step
  const trackServiceSelection = useCallback(
    (serviceId: string, serviceName: string) => {
      trackBookingEvent({
        action: 'select_service',
        serviceId,
        serviceName,
        step: 1,
        totalSteps: 4,
      });
    },
    [trackBookingEvent],
  );

  // Track date selection step
  const trackDateSelection = useCallback(
    (serviceId: string, serviceName: string, appointmentDate: Date) => {
      trackBookingEvent({
        timestamp: new Date(),
        action: 'select_date',
        serviceId,
        serviceName,
        appointmentDate,
        step: 2,
        totalSteps: 4,
      });
    },
    [trackBookingEvent],
  );

  // Track customer details step
  const trackDetailsEntry = useCallback(
    (serviceId: string, serviceName: string, appointmentDate: Date) => {
      trackBookingEvent({
        action: 'enter_details',
        serviceId,
        serviceName,
        appointmentDate,
        step: 3,
        totalSteps: 4,
      });
    },
    [trackBookingEvent],
  );

  // Track payment step
  const trackPayment = useCallback(
    (serviceId: string, serviceName: string, appointmentDate: Date) => {
      trackBookingEvent({
        action: 'payment',
        serviceId,
        serviceName,
        appointmentDate,
        step: 4,
        totalSteps: 4,
      });
    },
    [trackBookingEvent],
  );

  // Track completion
  const trackCompletion = useCallback(
    (bookingId: string, serviceId: string, serviceName: string, appointmentDate: Date) => {
      const timeSpent = startTimeRef.current
        ? new Date().getTime() - startTimeRef.current.getTime()
        : undefined;

      // Track the booking event
      trackBookingEvent({
        action: 'complete',
        bookingId,
        serviceId,
        serviceName,
        appointmentDate,
        timeSpent,
      });

      // Also track as a conversion
      trackConversion({
        action: 'book_appointment',
        conversionId: bookingId,
        label: `Booked: ${serviceName}`,
      });
    },
    [trackBookingEvent, trackConversion],
  );

  // Track abandonment
  const trackAbandonment = useCallback(
    (step: number, serviceId?: string, serviceName?: string, appointmentDate?: Date) => {
      const timeSpent = startTimeRef.current
        ? new Date().getTime() - startTimeRef.current.getTime()
        : undefined;

      trackBookingEvent({
        action: 'abandon',
        serviceId,
        serviceName,
        appointmentDate,
        step,
        totalSteps: 4,
        timeSpent,
      });
    },
    [trackBookingEvent],
  );

  return {
    startBookingFlow,
    trackServiceSelection,
    trackDateSelection,
    trackDetailsEntry,
    trackPayment,
    trackCompletion,
    trackAbandonment,
  };
};

/**
 * Hook for tracking gallery interactions
 */
export const useGalleryAnalytics = () => {
  const { trackGalleryEvent } = useAnalytics();
  const viewStartTimeRef = useRef<Record<string, Date>>({});

  // Track design view
  const trackDesignView = useCallback(
    (designId: string, designType?: string, artist?: string, tags?: string[]) => {
      // Record start time for view duration tracking
      viewStartTimeRef.current[designId] = new Date();

      trackGalleryEvent({
        action: 'view',
        designId,
        designType,
        artist,
        tags,
      });
    },
    [trackGalleryEvent],
  );

  // Track view ended (with duration)
  const trackDesignViewEnded = useCallback(
    (designId: string) => {
      if (viewStartTimeRef.current[designId]) {
        const viewTime = new Date().getTime() - viewStartTimeRef.current[designId].getTime();

        // Update the event with view time
        trackGalleryEvent({
          action: 'view',
          designId,
          viewTime,
        });

        // Clean up
        delete viewStartTimeRef.current[designId];
      }
    },
    [trackGalleryEvent],
  );

  // Track design favorite
  const trackDesignFavorite = useCallback(
    (designId: string, designType?: string) => {
      trackGalleryEvent({
        action: 'favorite',
        designId,
        designType,
      });
    },
    [trackGalleryEvent],
  );

  // Track design unfavorite
  const trackDesignUnfavorite = useCallback(
    (designId: string, designType?: string) => {
      trackGalleryEvent({
        action: 'unfavorite',
        designId,
        designType,
      });
    },
    [trackGalleryEvent],
  );

  // Track design share
  const trackDesignShare = useCallback(
    (designId: string, designType?: string) => {
      trackGalleryEvent({
        action: 'share',
        designId,
        designType,
      });
    },
    [trackGalleryEvent],
  );

  // Track gallery filtering
  const trackGalleryFilter = useCallback(
    (filterType: string, filterValue: string) => {
      trackGalleryEvent({
        action: 'filter',
        label: `${filterType}:${filterValue}`,
      });
    },
    [trackGalleryEvent],
  );

  // Track gallery search
  const trackGallerySearch = useCallback(
    (searchQuery: string) => {
      trackGalleryEvent({
        action: 'search',
        label: searchQuery,
      });
    },
    [trackGalleryEvent],
  );

  return {
    trackDesignView,
    trackDesignViewEnded,
    trackDesignFavorite,
    trackDesignUnfavorite,
    trackDesignShare,
    trackGalleryFilter,
    trackGallerySearch,
  };
};

/**
 * Hook to automatically catch and report errors
 */
export const useErrorTracking = () => {
  const { trackError } = useAnalytics();

  // Error boundary handler
  const handleError = useCallback(
    (error: Error, componentStack?: string, componentName?: string) => {
      trackError({
        errorMessage: error.message,
        errorStack: componentStack || error.stack,
        componentName,
        severity: 'high',
      });
    },
    [trackError],
  );

  return {
    trackError,
    handleError,
  };
};

/**
 * Hook for retrieving popular designs
 */
export function usePopularDesigns(limit = 5, period: 'day' | 'week' | 'month' | 'all' = 'month') {
  const { data, isLoading, error } = trpc.analytics.getPopularDesigns.useQuery({
    limit,
    period,
  });

  return {
    designs: data ?? [],
    isLoading,
    error,
  };
}

/**
 * Hook for retrieving view analytics
 */
export function useViewAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const { data, isLoading, error } = trpc.analytics.getViewAnalytics.useQuery({
    period,
  });

  return {
    analytics: data ?? {
      totalViews: 0,
      uniqueVisitors: 0,
      pageViews: {},
      topPages: [],
      viewsOverTime: [],
    },
    isLoading,
    error,
  };
}

/**
 * Hook for retrieving conversion rates
 */
export function useConversionRates(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const { data, isLoading, error } = trpc.analytics.getConversionRates.useQuery({
    period,
  });

  return {
    rates: data ?? {
      overall: 0,
      byStep: {},
      dropoffRates: {},
    },
    isLoading,
    error,
  };
}
