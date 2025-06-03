'use client';

import { useMemo, useCallback, useRef, startTransition, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

import { logger } from "@/lib/logger";
// Real-time update types
export interface RealtimeUpdate {
  type: 'booking' | 'appointment' | 'customer' | 'payment' | 'analytics';
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  data: Record<string, unknown>;
  timestamp: Date;
  id: string;
}

// Promise-based resource for data fetching
function createRealtimeResource(endpoint: string) {
  let promise: Promise<ReadableStream<Uint8Array>> | null = null;
  let stream: ReadableStream<Uint8Array> | null = null;

  return {
    read(): ReadableStream<Uint8Array> {
      if (stream) return stream;
      
      promise ??= fetch(endpoint).then((response) => {
        if (!response.body) {
          throw new Error('No response body for real-time stream');
        }
        stream = response.body;
        return stream;
      });
      
      // Standard Promise pattern for async data loading
      throw promise;
    },
    invalidate() {
      promise = null;
      stream = null;
    },
  };
}

// Real-time streaming hook using error boundaries
export function useRealtimeStream(endpoint: string = '/api/admin/realtime') {
  const resource = useMemo(() => createRealtimeResource(endpoint), [endpoint]);
  
  // Directly call resource.read() which will either return the stream
  // or throw a promise that can be caught by an error boundary
  const stream = resource.read();
  
  const processStream = useCallback(async (
    onUpdate: (update: RealtimeUpdate) => void,
    onError: (error: Error) => void = () => {}
  ) => {
    if (!stream) return;

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              const update: RealtimeUpdate = {
                ...data,
                timestamp: new Date(data.timestamp),
              };
              
              // Use startTransition for non-urgent updates
              startTransition(() => {
                onUpdate(update);
              });
            } catch (error) {
              onError(error instanceof Error ? error : new Error('Parse error'));
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Stream error'));
    } finally {
      reader.releaseLock();
    }
  }, [stream]);

  return {
    processStream,
    invalidate: resource.invalidate,
  };
}

// Dashboard real-time hook using stable patterns
export function useDashboardRealtime() {
  const updateCallbackRef = useRef<((update: RealtimeUpdate) => void) | null>(null);
  
  // Memoized metrics processor
  const processUpdate = useCallback((update: RealtimeUpdate) => {
    // Show real-time notifications
    switch (update.type) {
      case 'booking':
        if (update.action === 'created') {
          toast({
            title: 'New booking received',
            description: `${update.data['clientName'] ?? 'Client'} booked an appointment`,
            variant: 'default',
          });
        }
        break;
        
      case 'payment':
        if (update.action === 'created') {
          toast({
            title: 'Payment received',
            description: `$${update.data['amount'] ?? 0} payment processed`,
            variant: 'default',
          });
        }
        break;
        
      case 'customer':
        if (update.action === 'created') {
          toast({
            title: 'New customer',
            description: `${update.data['name'] ?? 'Customer'} joined`,
            variant: 'default',
          });
        }
        break;
    }
    
    // Call external update handler
    updateCallbackRef.current?.(update);
  }, []);

  // This will suspend until the stream is ready
  const { processStream, invalidate } = useRealtimeStream();

  const connect = useCallback((onUpdate?: (update: RealtimeUpdate) => void) => {
    updateCallbackRef.current = onUpdate ?? null;
    return processStream(processUpdate);
  }, [processStream, processUpdate]);

  return {
    connect,
    disconnect: invalidate,
  };
}

// Lightweight polling alternative using stable patterns
export function usePollingModern<T>(
  fetcher: () => Promise<T>,
  interval: number = 30000,
  enabled: boolean = true
) {
  const resourceRef = useRef<{
    promise: Promise<T> | null;
    data: T | null;
    error: Error | null;
  }>({ promise: null, data: null, error: null });

  const resource = useMemo(() => {
    if (!enabled) return null;

    const poll = async (): Promise<T> => {
      try {
        const data = await fetcher();
        resourceRef.current.data = data;
        resourceRef.current.error = null;
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Polling failed');
        resourceRef.current.error = err;
        throw err;
      }
    };

    // Set up interval polling
    const intervalId = setInterval(() => {
      startTransition(() => {
        resourceRef.current.promise = poll();
      });
    }, interval);

    // Initial fetch
    resourceRef.current.promise = poll();

    return {
      read: () => {
        if (resourceRef.current.error) throw resourceRef.current.error;
        if (resourceRef.current.promise) throw resourceRef.current.promise;
        return resourceRef.current.data;
      },
      cleanup: () => clearInterval(intervalId),
    };
  }, [fetcher, interval, enabled]);

  // Cleanup on unmount or when disabled
  useMemo(() => {
    return () => resource?.cleanup();
  }, [resource]);

  if (!enabled || !resource) {
    return { 
      data: null, 
      refetch: () => Promise.resolve(null as T | null) 
    };
  }

  // Return cached data without suspending
  const data = resourceRef.current.data;

  return {
    data,
    refetch: () => {
      resourceRef.current.promise = fetcher();
      return resourceRef.current.promise;
    },
  };
}

/**
 * Modern real-time hook using stable patterns
 * This combines SSE (Server-Sent Events) with React 19 patterns
 */
export function useRealtimeModern<T = unknown>(
  channel: string,
  options: {
    enabled?: boolean;
    endpoint?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    enabled = true,
    endpoint = '/api/realtime',
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // Store connection state and data
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Subscribe to real-time updates
  const subscribe = useCallback(() => {
    if (!enabled || eventSourceRef.current) return false;

    try {
      // Create EventSource connection with channel
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.append('channel', channel);
      
      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      // Set up event handlers
      eventSource.onopen = () => {
        setIsConnected(true);
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data) as T;
          setData(parsedData);
        } catch (error) {
          void logger.error('Error parsing real-time data:', error);
          onError?.(new Error('Failed to parse real-time data'));
        }
      };

      eventSource.onerror = (error) => {
        void logger.error('Real-time connection error:', error);
        setIsConnected(false);
        onError?.(new Error('Real-time connection error'));
        
        // Close the connection on error
        eventSource.close();
        eventSourceRef.current = null;
      };

      return true;
    } catch (error) {
      void logger.error('Failed to establish real-time connection:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to connect'));
      return false;
    }
  }, [channel, enabled, endpoint, onConnect, onError]);

  // Unsubscribe from real-time updates
  const unsubscribe = useCallback(() => {
    if (!eventSourceRef.current) return false;
    
    eventSourceRef.current.close();
    eventSourceRef.current = null;
    setIsConnected(false);
    onDisconnect?.();
    return true;
  }, [onDisconnect]);

  // Auto-subscribe if enabled
  useEffect(() => {
    if (enabled) {
      subscribe();
    } else {
      unsubscribe();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [enabled, subscribe, unsubscribe]);

  // Manually send data (useful for local testing)
  const sendData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    isConnected,
    data,
    subscribe,
    unsubscribe,
    sendData,
  };
}
