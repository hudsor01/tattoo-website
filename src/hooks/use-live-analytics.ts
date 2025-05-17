/**
 * Hook for live analytics updates via Server-Sent Events (SSE)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnalyticsStreamEvents } from '@/lib/routers/analytics-router/live-updates';
import { AnalyticsEventType, EventCategory } from '@/lib/trpc/routers/types';

// Define the types of events we expect from the SSE stream
type LiveAnalyticsEvent = {
  type: AnalyticsStreamEvents;
  data: unknown;
  timestamp: string;
};

// Data structure for tracking counters
type EventCounts = {
  total: number;
  byCategory: Record<string, number>;
  pageViews: number;
  conversions: number;
  errors: number;
};

// Options for the hook
interface LiveAnalyticsOptions {
  bufferSize?: number;
  autoConnect?: boolean;
  initialEventCounts?: Partial<EventCounts>;
}

/**
 * Hook for consuming live analytics updates
 */
export function useLiveAnalytics(options: LiveAnalyticsOptions = {}) {
  // Default options
  const { bufferSize = 50, autoConnect = true, initialEventCounts } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(autoConnect);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Event data
  const [recentEvents, setRecentEvents] = useState<LiveAnalyticsEvent[]>([]);
  const [eventCounts, setEventCounts] = useState<EventCounts>({
    total: initialEventCounts?.total || 0,
    byCategory: initialEventCounts?.byCategory || {},
    pageViews: initialEventCounts?.pageViews || 0,
    conversions: initialEventCounts?.conversions || 0,
    errors: initialEventCounts?.errors || 0,
  });

  // Last heartbeat timestamp
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  // Store the EventSource instance in a ref so it persists across renders
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to the SSE stream
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      // Already connected
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Create new EventSource connection
      const eventSource = new EventSource('/api/analytics/stream');
      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      // Handle connection error
      eventSource.onerror = error => {
        console.error('SSE connection error:', error);
        setConnectionError('Failed to connect to analytics stream');
        setIsConnected(false);
        setIsConnecting(false);

        // Close and clean up the connection
        eventSource.close();
        eventSourceRef.current = null;
      };

      // Set up event listeners for different event types

      // Connected event
      eventSource.addEventListener('connected', event => {
        const data = JSON.parse(event.data);
        console.log('Connected to analytics stream:', data);
      });

      // Heartbeat event to keep the connection alive
      eventSource.addEventListener('heartbeat', event => {
        setLastHeartbeat(new Date().toISOString());
      });

      // New analytics event
      eventSource.addEventListener(AnalyticsStreamEvents.NEW_EVENT, event => {
        const analyticsEvent = JSON.parse(event.data) as AnalyticsEventType;

        // Add to recent events buffer
        setRecentEvents(current => {
          const newEvents = [
            {
              type: AnalyticsStreamEvents.NEW_EVENT,
              data: analyticsEvent,
              timestamp: new Date().toISOString(),
            },
            ...current,
          ].slice(0, bufferSize);

          return newEvents;
        });

        // Update counts
        setEventCounts(current => {
          const category = analyticsEvent.category;

          return {
            total: current.total + 1,
            byCategory: {
              ...current.byCategory,
              [category]: (current.byCategory[category] || 0) + 1,
            },
            pageViews:
              category === EventCategory.PAGE_VIEW ? current.pageViews + 1 : current.pageViews,
            conversions:
              category === EventCategory.CONVERSION ? current.conversions + 1 : current.conversions,
            errors: category === EventCategory.ERROR ? current.errors + 1 : current.errors,
          };
        });
      });

      // Stats update event
      eventSource.addEventListener(AnalyticsStreamEvents.STATS_UPDATE, event => {
        const data = JSON.parse(event.data);

        setRecentEvents(current =>
          [
            {
              type: AnalyticsStreamEvents.STATS_UPDATE,
              data,
              timestamp: new Date().toISOString(),
            },
            ...current,
          ].slice(0, bufferSize),
        );
      });

      // Conversion event
      eventSource.addEventListener(AnalyticsStreamEvents.CONVERSION, event => {
        const data = JSON.parse(event.data);

        setRecentEvents(current =>
          [
            {
              type: AnalyticsStreamEvents.CONVERSION,
              data,
              timestamp: new Date().toISOString(),
            },
            ...current,
          ].slice(0, bufferSize),
        );
      });

      // Error event
      eventSource.addEventListener(AnalyticsStreamEvents.ERROR_OCCURRED, event => {
        const data = JSON.parse(event.data);

        setRecentEvents(current =>
          [
            {
              type: AnalyticsStreamEvents.ERROR_OCCURRED,
              data,
              timestamp: new Date().toISOString(),
            },
            ...current,
          ].slice(0, bufferSize),
        );
      });

      // Top designs change event
      eventSource.addEventListener(AnalyticsStreamEvents.TOP_DESIGNS_CHANGE, event => {
        const data = JSON.parse(event.data);

        setRecentEvents(current =>
          [
            {
              type: AnalyticsStreamEvents.TOP_DESIGNS_CHANGE,
              data,
              timestamp: new Date().toISOString(),
            },
            ...current,
          ].slice(0, bufferSize),
        );
      });
    } catch (error) {
      console.error('Error setting up SSE connection:', error);
      setConnectionError('Failed to set up analytics stream connection');
      setIsConnected(false);
      setIsConnecting(false);
    }

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [bufferSize]);

  // Disconnect from the SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Clear the event buffer
  const clearEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  // Reset event counts
  const resetCounts = useCallback(() => {
    setEventCounts({
      total: 0,
      byCategory: {},
      pageViews: 0,
      conversions: 0,
      errors: 0,
    });
  }, []);

  // Connect automatically if autoConnect is true
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  // Check connection health
  useEffect(() => {
    if (!isConnected) return;

    // Set up a timer to check for heartbeats
    const heartbeatCheckInterval = setInterval(() => {
      if (!lastHeartbeat) return;

      const lastHeartbeatTime = new Date(lastHeartbeat).getTime();
      const currentTime = new Date().getTime();

      // If no heartbeat for more than 60 seconds, reconnect
      if (currentTime - lastHeartbeatTime > 60000) {
        console.warn('No heartbeat received for 60 seconds, reconnecting...');
        disconnect();
        connect();
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatCheckInterval);
    };
  }, [isConnected, lastHeartbeat, connect, disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,

    // Event data
    recentEvents,
    eventCounts,
    lastHeartbeat,

    // Utility functions
    clearEvents,
    resetCounts,
  };
}
