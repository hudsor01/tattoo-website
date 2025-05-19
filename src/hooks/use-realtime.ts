'use client';

/**
 * Unified hook for Supabase realtime subscriptions
 * Provides a consistent pattern for realtime data subscriptions
 */

import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { 
  RealtimeSubscriptionOptions,
  PostgresChangesConfig,
  UseRealtimeResult
} from '@/types/utility-types';

/**
 * Hook for subscribing to Supabase realtime changes
 *
 * @example
 * // Basic subscription to all changes
 * const { data, error, loading } = useRealtime({
 *   table: 'bookings'
 * });
 *
 * @example
 * // Filtered subscription
 * const { data, error, loading } = useRealtime({
 *   table: 'appointments',
 *   event: ['INSERT', 'UPDATE'],
 *   filter: { column: 'status', operator: 'eq', value: 'confirmed' }
 * });
 */
export function useRealtime<T = Record<string, unknown>>(
  options: RealtimeSubscriptionOptions
): UseRealtimeResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Function to fetch initial data and set up subscription
  const initializeAndSubscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Fetch initial data
      let query = supabase.from(options.table).select('*');

      // Apply filters to initial query if provided
      if (options.filter) {
        const filters = Array.isArray(options.filter) ? options.filter : [options.filter];

        for (const filter of filters) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'in':
              query = query.in(filter.column, filter.value as (string | number | boolean)[]);
              break;
          }
        }
      }

      const { data: initialData, error: initialError } = await query;

      if (initialError) {
        throw initialError;
      }

      setData(initialData || []);

      // Set up realtime subscription
      let newChannel = supabase.channel(`${options.table}-changes`);

      // Determine which events to listen for
      const events = Array.isArray(options.event) ? options.event : [options.event || '*'];

      // Subscribe to each event
      for (const event of events) {
        // Create the event configuration
        const eventConfig: PostgresChangesConfig = {
          event,
          schema: options.schema || 'public',
          table: options.table,
        };

        // Add filters if provided
        if (options.filter) {
          const filters = Array.isArray(options.filter) ? options.filter : [options.filter];

          eventConfig.filter = filters
            .map(filter => `${filter.column}:${filter.operator}.${filter.value}`)
            .join(',');
        }

        // Handle throttling if specified
        let lastUpdate = 0;

        newChannel = newChannel.on(
          'postgres_changes',
          eventConfig,
          async (payload: RealtimePostgresChangesPayload<T>) => {
            // Log the payload for debugging or analytics purposes
            if (process.env.NODE_ENV === 'development') {
              console.info(`Realtime ${payload.eventType} event received for ${options.table}`);
            }
            
            // Apply throttling if configured
            if (options.throttle) {
              const now = Date.now();
              if (now - lastUpdate < options.throttle) {
                return;
              }
              lastUpdate = now;
            }

            // Refresh data on changes
            try {
              const { data: refreshedData, error: refreshError } = await query;

              if (refreshError) {
                throw refreshError;
              }

              setData(refreshedData || []);
            } catch (error) {
              console.error('Error refreshing data:', error);
              setError(error as Error);
            }
          }
        );
      }

      // Subscribe to the channel
      newChannel.subscribe();
      setChannel(newChannel);
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Set up subscription on mount and cleanup on unmount
  useEffect(() => {
    initializeAndSubscribe();

    // Cleanup function
    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [initializeAndSubscribe, channel]);

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Fetch data
      let query = supabase.from(options.table).select('*');

      // Apply filters if provided
      if (options.filter) {
        const filters = Array.isArray(options.filter) ? options.filter : [options.filter];

        for (const filter of filters) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.column, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.column, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.column, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.column, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.column, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.column, filter.value);
              break;
            case 'in':
              query = query.in(filter.column, filter.value as (string | number | boolean)[]);
              break;
          }
        }
      }

      const { data: refreshedData, error: refreshError } = await query;

      if (refreshError) {
        throw refreshError;
      }

      setData(refreshedData || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { data, error, loading, refresh };
}
