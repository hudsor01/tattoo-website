/**
 * Supabase Realtime Subscription Utilities
 * 
 * Provides utilities for working with Supabase's realtime subscriptions
 * for data synchronization and real-time updates.
 */

import { createClient } from './client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Subscribe to changes on a specific table
 * 
 * @param table The table to subscribe to
 * @param eventTypes The types of events to listen for (INSERT, UPDATE, DELETE)
 * @param callback Function to call when changes occur
 * @param filter Optional filter to apply to the subscription
 */
export function subscribeToChannel<T = any>(
  table: string,
  eventTypes: ('INSERT' | 'UPDATE' | 'DELETE')[],
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
): { unsubscribe: () => void } {
  const supabase = createClient();
  
  // Create channel with the table name
  let channel = supabase.channel(`public:${table}`);
  
  // Set up the subscription
  channel = channel.on(
    'postgres_changes',
    {
      event: eventTypes.length === 3 ? '*' : eventTypes,
      schema: 'public',
      table,
      ...(filter ? { filter } : {})
    },
    callback
  );
  
  // Start the subscription
  channel.subscribe();
  
  // Return an unsubscribe function
  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

/**
 * Shorthand to subscribe to all changes on a table
 */
export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  filter?: string
): { unsubscribe: () => void } {
  return subscribeToChannel<T>(
    table,
    ['INSERT', 'UPDATE', 'DELETE'],
    callback,
    filter
  );
}

/**
 * Subscribe to presence changes (users joining/leaving)
 * 
 * @param channelName The name of the channel to subscribe to
 * @param onJoin Function to call when users join
 * @param onLeave Function to call when users leave
 */
export function onPresenceChange(
  channelName: string,
  onJoin?: (payload: { [key: string]: any }) => void,
  onLeave?: (payload: { [key: string]: any }) => void
): { channel: RealtimeChannel; unsubscribe: () => void } {
  const supabase = createClient();
  
  // Create channel
  const channel = supabase.channel(channelName);
  
  // Set up presence handling
  if (onJoin) {
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      onJoin(newPresences);
    });
  }
  
  if (onLeave) {
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      onLeave(leftPresences);
    });
  }
  
  // Start the subscription
  channel.subscribe();
  
  // Return channel and unsubscribe function
  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

/**
 * Broadcast a message to a channel
 * 
 * @param channelName The name of the channel to broadcast to
 * @param eventName The name of the event to broadcast
 * @param payload The payload to broadcast
 */
export async function broadcastMessage(
  channelName: string,
  eventName: string,
  payload: any
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // Create channel
    const channel = supabase.channel(channelName);
    
    // Subscribe to channel
    channel.subscribe();
    
    // Send the message
    await channel.send({
      type: 'broadcast',
      event: eventName,
      payload
    });
    
    // Clean up
    supabase.removeChannel(channel);
    
    return true;
  } catch (error) {
    console.error('Error broadcasting message:', error);
    return false;
  }
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  const supabase = createClient();
  supabase.removeChannel(channel);
}