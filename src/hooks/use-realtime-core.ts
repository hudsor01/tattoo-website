'use client';

import { useMemo, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Configuration options for the realtime subscription
 */
export interface RealtimeOptions {
  // The table to subscribe to
  table: string;

  // The schema where the table is located (default: 'public')
  schema?: string;

  // Specify which events to listen for (default: all)
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';

  // Filter events by row values (in Postgres filter syntax)
  filter?: string;

  // Additional filter using column values
  columnFilter?: {
    column: string;
    value: string | number | boolean;
  };
}

/**
 * Hook to sync React Query cache with Supabase Realtime changes
 *
 * This hook subscribes to Supabase Realtime events for a table and
 * automatically updates the React Query cache when data changes.
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   // Regular query
 *   const { data: tasks } = trpc.tasks.getAll.useQuery()
 *
 *   // Add realtime updates to the query
 *   useRealtimeQueryData({
 *     queryKey: ['tasks', 'getAll'],
 *     realtimeOpts: { table: 'tasks' },
 *   })
 *
 *   return (
 *     <div>
 *       {tasks?.map(task => <TaskItem key={task.id} task={task} />)}
 *     </div>
 *   )
 * }
 * ```
 */
// Define a generic record type with id for database items
export interface DatabaseRecord {
  id: string | number;
  [key: string]: unknown;
}

export function useRealtimeQueryData<TData extends DatabaseRecord[]>({
  queryKey,
  realtimeOpts,
  updateTransform,
}: {
  // The query key to update
  queryKey: readonly unknown[];

  // Realtime subscription options
  realtimeOpts: RealtimeOptions;

  // Optional function to transform the data before updating the cache
  updateTransform?: {
    onInsert?: (newItem: DatabaseRecord, oldData: TData | undefined) => TData;
    onUpdate?: (updatedItem: DatabaseRecord, oldData: TData | undefined) => TData;
    onDelete?: (deletedItem: DatabaseRecord, oldData: TData | undefined) => TData;
  };
}) {
  const queryClient = useQueryClient();

  // Default transform functions if not provided
  const transforms = useMemo(
    () => ({
      onInsert: (newItem: DatabaseRecord, oldData: TData | undefined) =>
        oldData
          ? [...oldData, newItem as unknown as TData[number]]
          : [newItem as unknown as TData[number]],
      onUpdate: (updatedItem: DatabaseRecord, oldData: TData | undefined) =>
        oldData
          ? oldData.map(item => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
          : [updatedItem as unknown as TData[number]],
      onDelete: (deletedItem: DatabaseRecord, oldData: TData | undefined) =>
        oldData ? oldData.filter(item => item.id !== deletedItem.id) : [],
      ...updateTransform,
    }),
    [updateTransform],
  );

  // Set up Supabase realtime subscription
  useEffect(() => {
    // Get Supabase client
    const supabase = createClient();
    const { table, schema = 'public', event = '*', filter, columnFilter } = realtimeOpts;

    // Initialize channel
    const channel: RealtimeChannel = supabase
      .channel(`query-${table}-${event}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        payload => {
          // Apply columnFilter if specified
          if (columnFilter) {
            const { column, value } = columnFilter;
            if (payload.new && payload.new[column] !== value) return;
            if (payload.old && payload.old[column] !== value) return;
          }

          // Update the cache based on the event type
          if (payload.eventType === 'INSERT') {
            queryClient.setQueryData<TData>(queryKey, old => transforms.onInsert(payload.new, old));
          } else if (payload.eventType === 'UPDATE') {
            queryClient.setQueryData<TData>(queryKey, old => transforms.onUpdate(payload.new, old));
          } else if (payload.eventType === 'DELETE') {
            queryClient.setQueryData<TData>(queryKey, old => transforms.onDelete(payload.old, old));
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, realtimeOpts, queryKey, transforms]);

  // This hook doesn't return anything - it just sets up the subscription
  return null;
}

/**
 * Hook to sync tRPC Query cache with Supabase Realtime changes
 *
 * This is a specialized version of useRealtimeQueryData that works
 * specifically with tRPC queries.
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   // Regular tRPC query
 *   const { data: tasks } = trpc.tasks.getAll.useQuery()
 *
 *   // Add realtime updates to the query
 *   useRealtimeTRPCQuery({
 *     router: 'tasks',
 *     procedure: 'getAll',
 *     realtimeOpts: { table: 'tasks' },
 *   })
 *
 *   return (
 *     <div>
 *       {tasks?.map(task => <TaskItem key={task.id} task={task} />)}
 *     </div>
 *   )
 * }
 * ```
 */
export function useRealtimeTRPCQuery<TData extends DatabaseRecord[]>({
  router,
  procedure,
  realtimeOpts,
  input,
  updateTransform,
}: {
  // The tRPC router name
  router: string;

  // The tRPC procedure name
  procedure: string;

  // Realtime subscription options
  realtimeOpts: RealtimeOptions;

  // Optional input for the tRPC query
  input?: unknown;

  // Optional transform functions
  updateTransform?: {
    onInsert?: (newItem: DatabaseRecord, oldData: TData | undefined) => TData;
    onUpdate?: (updatedItem: DatabaseRecord, oldData: TData | undefined) => TData;
    onDelete?: (deletedItem: DatabaseRecord, oldData: TData | undefined) => TData;
  };
}) {
  // Convert tRPC router/procedure to a query key
  const queryKey = useMemo(() => {
    const key = [router, procedure];
    if (input !== undefined) {
      key.push(input);
    }
    return key;
  }, [router, procedure, input]);

  // Use the base hook
  return useRealtimeQueryData<TData>({
    queryKey,
    realtimeOpts,
    updateTransform,
  });
}
