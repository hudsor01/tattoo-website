'use client';

/**
 * Consolidated real-time hooks for dashboard updates
 * 
 * Provides hooks for:
 * - Server-sent events stream management
 * - Dashboard updates and notifications
 * - Data polling with configurable intervals
 * - Real-time data transformation
 */

import { useMemo, useCallback, useRef, startTransition, useState, useEffect } from 'react';
import { logger } from "@/lib/logger";
// Use sonner toast to avoid import issues
import { toast } from 'sonner';

/**
 * Real-time update structure from server events
 */
export interface RealtimeUpdate {
  type: 'booking' | 'appointment' | 'customer' | 'payment' | 'analytics';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  data: Record<string, unknown>;
  timestamp: Date;
  id: string;
}

/**
 * Options for polling hook
 */
export interface PollingOptions<T> {
  interval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
  immediate?: boolean;
}

/**
 * Hook for consuming a server-sent events stream
 */
export function useRealtimeStream(endpoint = '/api/admin/realtime') {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortController = useRef<AbortController | null>(null);
  
  const connect = useCallback(async () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    
    try {
      abortController.current = new AbortController();
      const response = await fetch(endpoint, {
        signal: abortController.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to connect to real-time stream: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader for real-time stream');
      }
      
      setIsConnected(true);
      setError(null);
      
      // Setup decoder for text streaming
      const decoder = new TextDecoder();
      let buffer = '';
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process any complete messages
        const lines = buffer.split('\n');
        const lastLine = lines.pop();
        buffer = lastLine ?? '';
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr);
              
              startTransition(() => {
                setUpdates(prev => [data, ...prev].slice(0, 100)); // Keep last 100 updates
              });
            } catch (e) {
              // Use void logger.error as it's allowed by ESLint configuration
              void logger.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError(e as Error);
        setIsConnected(false);
      }
    }
  }, [endpoint]);
  
  const disconnect = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
      setIsConnected(false);
    }
  }, []);
  
  useEffect(() => {
    // Create an async function to properly await the connect call
    const initConnection = async () => {
      try {
        await connect();
      } catch (error) {
        void logger.error('Failed to initialize connection:', error);
      }
    };
    
    // Call the async function
    void initConnection();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    updates,
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  };
}

/**
 * Dashboard-specific real-time updates with notifications
 */
export function useDashboardRealtime() {
  const { 
    updates, 
    isConnected, 
    error, 
    reconnect, 
    disconnect 
  } = useRealtimeStream('/api/admin/dashboard/realtime');
  
  // Display toast for important updates
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[0];
      
      // Only show toasts for specific update types
      if (latestUpdate.type === 'booking' && latestUpdate.action === 'created') {
        toast({
          title: 'New Booking',
          description: 'A new booking has been created',
        });
      } else if (latestUpdate.type === 'payment' && latestUpdate.action === 'created') {
        toast({
          title: 'New Payment',
          description: `A new payment of $${(latestUpdate.data.amount as number / 100).toFixed(2)} has been received`,
        });
      }
    }
  }, [updates]);
  
  return {
    updates,
    isConnected,
    error,
    reconnect,
    disconnect,
    
    // Filter updates by type
    bookingUpdates: updates.filter(u => u.type === 'booking'),
    appointmentUpdates: updates.filter(u => u.type === 'appointment'),
    customerUpdates: updates.filter(u => u.type === 'customer'),
    paymentUpdates: updates.filter(u => u.type === 'payment'),
    analyticsUpdates: updates.filter(u => u.type === 'analytics'),
    
    // Count updates by type
    counts: {
      bookings: updates.filter(u => u.type === 'booking').length,
      appointments: updates.filter(u => u.type === 'appointment').length,
      customers: updates.filter(u => u.type === 'customer').length,
      payments: updates.filter(u => u.type === 'payment').length,
      analytics: updates.filter(u => u.type === 'analytics').length,
    },
  };
}

/**
 * Generic polling hook for regular data fetching
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions<T> = {}
) {
  const {
    interval = 30000,
    onSuccess,
    onError,
    enabled = true,
    immediate = true,
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchFnRef = useRef(fetchFn);
  
  // Update the ref when the function changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    
    try {
      const result = await fetchFnRef.current();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err as Error);
      
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [enabled, onSuccess, onError]);
  
  const startPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (enabled) {
      // Create a wrapper function that returns void
      const fetchWrapper = () => {
        void fetchData();
      };
      
      // Use the wrapper function in setInterval
      timerRef.current = setInterval(fetchWrapper, interval);
    }
  }, [fetchData, interval, enabled]);
  
  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Reset the timer when the interval changes
  useEffect(() => {
    if (enabled) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, enabled]);
  
  // Initial fetch
  useEffect(() => {
    if (immediate && enabled) {
      void fetchData(); // Already correctly using void operator
    }
  }, [immediate, fetchData, enabled]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    lastUpdated,
    startPolling,
    stopPolling,
  };
}

/**
 * Hook for transforming real-time updates into typed data
 */
export function useRealtimeData<T>(
  initialData: T,
  selector: (update: RealtimeUpdate) => T | null
) {
  const { updates } = useRealtimeStream();
  const [data, setData] = useState<T>(initialData);
  
  useEffect(() => {
    if (updates.length > 0) {
      const latestUpdate = updates[0];
      const newData = selector(latestUpdate);
      
      if (newData !== null) {
        setData(newData);
      }
    }
  }, [updates, selector]);
  
  return data;
}

/**
 * Hook for tracking counts of specific update types
 */
export function useRealtimeCount(type: RealtimeUpdate['type']) {
  const { updates } = useRealtimeStream();
  const count = useMemo(() => {
    return updates.filter(u => u.type === type).length;
  }, [updates, type]);
  
  return count;
}
