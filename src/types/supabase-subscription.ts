/**
 * Type definitions for Supabase real-time subscriptions
 */

/**
 * Options for configuring a Supabase real-time subscription
 */
export interface SupabaseSubscriptionOptions {
  /**
   * The table to subscribe to
   */
  table: string;
  
  /**
   * The schema containing the table (defaults to 'public')
   */
  schema?: string;
  
  /**
   * Filter string in the format "column:operator:value"
   */
  filter?: string;
  
  /**
   * Ordering options
   */
  order?: {
    /**
     * Column to order by
     */
    column: string;
    
    /**
     * Whether to sort in ascending order (true) or descending (false)
     */
    ascending?: boolean;
  };
  
  /**
   * Maximum number of records to return
   */
  limit?: number;
  
  /**
   * Column to filter by (alternative to filter string)
   */
  filterColumn?: string;
  
  /**
   * Value to filter by (used with filterColumn)
   */
  filterValue?: string | number | boolean;
  
  /**
   * Event type to listen for
   */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

/**
 * Configuration for a Supabase real-time channel
 */
export interface SubscriptionConfig {
  /**
   * Channel name (must be unique)
   */
  channelName: string;
  
  /**
   * Table to subscribe to
   */
  table: string;
  
  /**
   * Schema containing the table
   */
  schema?: string;
  
  /**
   * Events to subscribe to
   */
  event?: ('INSERT' | 'UPDATE' | 'DELETE')[];
  
  /**
   * Filter condition in PostgreSQL format
   */
  filter?: string;
}

/**
 * Subscription object returned by real-time subscription functions
 */
export interface RealtimeSubscription {
  /**
   * Function to call to unsubscribe from the subscription
   */
  unsubscribe: () => void;
}

/**
 * Payload received from a Supabase real-time subscription
 * 
 * @template T The type of the record in the subscription, defaults to unknown
 */
export interface SubscriptionPayload<T = unknown> {
  /**
   * Type of event (INSERT, UPDATE, DELETE)
   */
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  
  /**
   * New state of the record (for INSERT and UPDATE events)
   */
  new: T;
  
  /**
   * Previous state of the record (for UPDATE and DELETE events)
   */
  old: T;
}