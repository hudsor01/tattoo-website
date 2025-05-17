/**
 * Analytics Hooks
 *
 * Custom hooks for tracking user interactions and retrieving analytics data.
 * Provides utilities for event tracking and analytics querying.
 */
import { useCallback, useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { nanoid } from 'nanoid';

// Event types that can be tracked
export type EventType =
  | 'page_view'
  | 'gallery_view'
  | 'design_view'
  | 'booking_started'
  | 'booking_completed'
  | 'contact_submitted';

// Get or create a client ID for anonymous tracking
function getClientId() {
  // Try to get the client ID from localStorage
  if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('clientId');

    if (storedId) {
      return storedId;
    }

    // If no client ID exists, create a new one
    const newId = nanoid();
    localStorage.setItem('clientId', newId);
    return newId;
  }

  // For SSR, return a placeholder
  return 'server-rendered';
}

/**
 * Hook for tracking user events
 */
export function useEventTracking() {
  const [clientId, setClientId] = useState<string>('');
  const trackEvent = trpc.analytics.trackEvent.useMutation();

  // Set client ID on mount
  useEffect(() => {
    setClientId(getClientId());
  }, []);

  // Track a user event
  const track = useCallback(
    (eventType: EventType, itemId?: string, metadata?: Record<string, unknown>) => {
      if (clientId) {
        trackEvent.mutate({
          eventType,
          itemId,
          metadata,
          clientId,
        });
      } else {
        // Queue the event to be tracked when clientId is available
        const queuedEvent = { eventType, itemId, metadata };

        // Using a small timeout to allow the clientId to be set
        setTimeout(() => {
          const currentClientId = getClientId();
          trackEvent.mutate({
            eventType: queuedEvent.eventType,
            itemId: queuedEvent.itemId,
            metadata: queuedEvent.metadata,
            clientId: currentClientId,
          });
        }, 100);
      }
    },
    [clientId, trackEvent],
  );

  // Automatically track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && clientId) {
      // Track initial page view
      track('page_view', window.location.pathname);

      // Track subsequent page views
      const handleRouteChange = (url: string) => {
        track('page_view', url);
      };

      // Add router event listener (this is a simplified implementation)
      // In a real app, you would use the Next.js router events
      window.addEventListener('popstate', () => {
        handleRouteChange(window.location.pathname);
      });

      return () => {
        window.removeEventListener('popstate', () => {
          handleRouteChange(window.location.pathname);
        });
      };
    }
  }, [clientId, track]);

  return { track };
}

/**
 * Hook for retrieving analytics data (admin only)
 */
export function useAnalyticsData(
  startDate?: string,
  endDate?: string,
  metrics?: string[],
  groupBy: 'day' | 'week' | 'month' | 'event' = 'day',
) {
  const query = trpc.analytics.getAnalytics.useQuery(
    { startDate, endDate, metrics, groupBy },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: Boolean(startDate || endDate || metrics),
    },
  );

  return query;
}

/**
 * Hook for retrieving popular designs
 */
export function usePopularDesigns(limit = 5, period: 'day' | 'week' | 'month' | 'all' = 'month') {
  const query = trpc.analytics.getPopularDesigns.useQuery(
    { limit, period },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  );

  return query;
}
