'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsStreamEvents, AnalyticsStreamEvent } from '@/types/analytics-stream-types';
import { EventCountsState } from '@/types/analytics-types';

export function useLiveAnalytics() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<AnalyticsStreamEvent[]>([]);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  const [eventCounts, setEventCounts] = useState<EventCountsState>({
    total: 0,
    pageViews: 0,
    conversions: 0,
    errors: 0,
    byCategory: {},
  });

  const connect = useCallback(() => {
    setIsConnecting(true);
    setConnectionError(null);
    
    // For now, just simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setLastHeartbeat(new Date());
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
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

  // Simulate incoming events (in production, this would be a WebSocket or SSE)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      // Generate a mock event
      const mockEvent: AnalyticsStreamEvent = {
        type: AnalyticsStreamEvents.NEW_EVENT,
        data: {
          category: Math.random() > 0.5 ? 'page_view' : 'interaction',
          action: 'view',
          path: '/',
          deviceType: 'desktop',
        },
        timestamp: new Date().toISOString(),
      };

      // Initialize as empty array if undefined
      setRecentEvents(prev => {
        const prevEvents = prev || [];
        return [mockEvent, ...prevEvents].slice(0, 100);
      });
      
      setEventCounts(prev => ({
        ...prev,
        total: prev.total + 1,
        pageViews: mockEvent.data.category === 'page_view' ? prev.pageViews + 1 : prev.pageViews,
        byCategory: {
          ...prev.byCategory,
          [mockEvent.data.category]: (prev.byCategory[mockEvent.data.category] || 0) + 1,
        },
      }));

      setLastHeartbeat(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

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