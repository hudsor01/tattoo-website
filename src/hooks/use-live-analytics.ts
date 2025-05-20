'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type AnalyticsStreamEvent, type EventCountsState, AnalyticsStreamEventType, EventCategory } from '@/types/analytics-types';

export function useLiveAnalytics() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<AnalyticsStreamEvent[]>([]);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const [eventCounts, setEventCounts] = useState<EventCountsState>({
    total: 0,
    pageViews: 0,
    conversions: 0,
    errors: 0,
    byCategory: {},
  });

  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      
      // Create a new EventSource connection to the SSE endpoint
      const eventSource = new EventSource('/api/analytics/stream');
      eventSourceRef.current = eventSource;
      
      // Handle connection open
      eventSource.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setLastHeartbeat(new Date());
      };
      
      // Handle connection error
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setConnectionError('Connection error. Please try again.');
        setIsConnected(false);
        setIsConnecting(false);
        eventSource.close();
        eventSourceRef.current = null;
      };
      
      // Handle initial connection event
      eventSource.addEventListener('connection', (event) => {
        try {
          const data = JSON.parse(event.data);
          try {
            if (data.timestamp) {
              setLastHeartbeat(new Date(data.timestamp));
            } else {
              setLastHeartbeat(new Date());
            }
          } catch (dateError) {
            console.error('Invalid timestamp in connection event:', dateError);
            setLastHeartbeat(new Date());
          }
        } catch (error) {
          console.error('Error parsing connection event:', error);
          // Still update the timestamp to show a valid connection
          setLastHeartbeat(new Date());
        }
      });
      
      // Handle heartbeat events
      eventSource.addEventListener('heartbeat', (event) => {
        try {
          const data = JSON.parse(event.data);
          // Safely parse timestamp to ensure it's a valid Date
          if (data.timestamp) {
            try {
              setLastHeartbeat(new Date(data.timestamp));
            } catch (dateError) {
              console.error('Invalid timestamp format:', dateError);
              // Still update the heartbeat timestamp to show connection is alive
              setLastHeartbeat(new Date());
            }
          } else {
            setLastHeartbeat(new Date());
          }
        } catch (error) {
          console.error('Error parsing heartbeat event:', error);
          // Still update the timestamp to show connection is alive
          setLastHeartbeat(new Date());
        }
      });
      
      // Handle analytics events
      eventSource.addEventListener('analytics', (event) => {
        try {
          const analyticsEvent = JSON.parse(event.data) as AnalyticsStreamEvent;
          
          // Add to recent events list
          setRecentEvents(prev => {
            const prevEvents = prev || [];
            return [analyticsEvent, ...prevEvents].slice(0, 100);
          });
          
          // Update event counts
          setEventCounts(prev => {
            const category = analyticsEvent.data.category;
            const isPageView = category === EventCategory.PAGE_VIEW;
            const isConversion = category === EventCategory.CONVERSION;
            const isError = category === EventCategory.ERROR;
            
            return {
              ...prev,
              total: prev.total + 1,
              pageViews: isPageView ? prev.pageViews + 1 : prev.pageViews,
              conversions: isConversion ? prev.conversions + 1 : prev.conversions,
              errors: isError ? prev.errors + 1 : prev.errors,
              byCategory: {
                ...prev.byCategory,
                [category]: (prev.byCategory[category] || 0) + 1,
              },
            };
          });
          
          setLastHeartbeat(new Date());
        } catch (error) {
          console.error('Error parsing analytics event:', error);
        }
      });
      
      // Handle stats updates
      eventSource.addEventListener('stats_update', (event) => {
        try {
          const stats = JSON.parse(event.data);
          
          // Create a stats_update event
          const statsEvent: AnalyticsStreamEvent = {
            type: 'stats_update',
            data: {
              category: EventCategory.ERROR, // Changed from string literal to enum value
              action: 'stats_update',
            },
            timestamp: stats.timestamp || new Date().toISOString(),
          };
          
          // Add to recent events
          setRecentEvents(prev => {
            const prevEvents = prev || [];
            return [statsEvent, ...prevEvents].slice(0, 100);
          });
          
          // Safely update last heartbeat with proper error handling
          try {
            if (stats.timestamp) {
              setLastHeartbeat(new Date(stats.timestamp));
            } else {
              setLastHeartbeat(new Date());
            }
          } catch (dateError) {
            console.error('Invalid timestamp in stats update:', dateError);
            setLastHeartbeat(new Date());
          }
        } catch (error) {
          console.error('Error parsing stats update event:', error);
          // Still update the timestamp
          setLastHeartbeat(new Date());
        }
      });
      
      // Handle error events
      eventSource.addEventListener('error', (event) => {
        try {
          // Cast the event to MessageEvent to access the data property
          const errorData = JSON.parse((event as MessageEvent).data);
          console.error('Error event from server:', errorData);
          
          // Create an error event
          const errorEvent: AnalyticsStreamEvent = {
            type: AnalyticsStreamEventType.ERROR_OCCURRED,
            data: {
              category: EventCategory.ERROR,
              action: 'server_error',
              label: errorData.message,
            },
            timestamp: errorData.timestamp || new Date().toISOString(),
          };
          
          // Add to recent events
          setRecentEvents(prev => {
            const prevEvents = prev || [];
            return [errorEvent, ...prevEvents].slice(0, 100);
          });
          
          // Update event counts
          setEventCounts(prev => ({
            ...prev,
            total: prev.total + 1,
            errors: prev.errors + 1,
            byCategory: {
              ...prev.byCategory,
              [EventCategory.ERROR]: (prev.byCategory[EventCategory.ERROR] || 0) + 1, // Updated to use enum
            },
          }));
        } catch (error) {
          console.error('Error parsing error event:', error);
        }
      });
    } catch (error) {
      console.error('Error connecting to analytics stream:', error);
      setConnectionError('Failed to connect to analytics stream.');
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [isConnected, isConnecting]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setLastHeartbeat(null);
  }, []);

  const clearEvents = useCallback(() => {
    setRecentEvents([]);
    setEventCounts({
      total: 0,
      pageViews: 0,
      conversions: 0,
      errors: 0,
      byCategory: {},
    });
  }, []);

  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    recentEvents,
    eventCounts,
    lastHeartbeat,
    clearEvents,
  };
}