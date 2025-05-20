/**
 * analytics-stream-types.ts
 *
 * Client-safe types for analytics stream events, 
 * separated from server-only implementation.
 */

/**
 * Analytics stream event types enum
 */
export enum AnalyticsStreamEvents {
  NEW_EVENT = 'new_event',
  PAGE_VIEW = 'page_view',
  USER_INTERACTION = 'user_interaction',
  BOOKING_CREATED = 'booking_created',
  PAYMENT_PROCESSED = 'payment_processed',
  CONTACT_SUBMITTED = 'contact_submitted',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * Analytics stream event base interface
 */
export interface AnalyticsStreamEvent {
  type: string;
  data: {
    category: string;
    action: string;
    label?: string;
    value?: number;
    path?: string;
    referrer?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: number | string;
}