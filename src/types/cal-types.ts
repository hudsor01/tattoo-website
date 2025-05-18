/**
 * cal-types.ts
 * 
 * Type definitions for Cal.com integration
 */

/**
 * Cal.com event types available on their platform
 */
export type CalEventType = 
  | 'tattoo-consultation'
  | 'deposit-payment'
  | 'follow-up'
  | 'touch-up'
  | 'design-review';

/**
 * Cal.com booking status
 */
export type CalBookingStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'rescheduled';

/**
 * Cal.com webhook event types
 */
export type CalWebhookEvent = 
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.rescheduled';

/**
 * Cal.com webhook payload structure
 */
export interface CalWebhookPayload {
  /** Type of the webhook event */
  event: CalWebhookEvent;
  /** Unique identifier for the webhook call */
  id: string;
  /** Timestamp when the event occurred */
  timestamp: number;
  /** The actual booking data */
  payload: CalBookingPayload;
}

/**
 * Cal.com booking payload data
 */
export interface CalBookingPayload {
  /** Unique booking ID from Cal.com */
  id: string;
  /** The UID of the booking */
  uid: string;
  /** Event type that was booked */
  eventTypeId: number;
  /** The title of the event type */
  title: string;
  /** Description of the booking */
  description?: string;
  /** Additional notes from the customer */
  additionalNotes?: string;
  /** Custom questions and answers */
  customInputs?: CalCustomInput[];
  /** Start time of the appointment */
  startTime: string;
  /** End time of the appointment */
  endTime: string;
  /** Person who created the booking */
  attendees: CalAttendee[];
  /** The organizer/tattoo artist */
  organizer: CalOrganizer;
  /** Current booking status */
  status: CalBookingStatus;
  /** Location of the appointment */
  location?: string;
  /** Meeting URL if virtual */
  meetingUrl?: string;
  /** Payment information if applicable */
  payment?: CalPayment;
  /** Metadata attached to the booking */
  metadata?: Record<string, any>;
  /** Cancellation or rescheduling reason */
  cancellationReason?: string;
  /** If this is a rescheduled booking, the ID of the original */
  previousBookingId?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Attendee information from Cal.com
 */
export interface CalAttendee {
  /** Email of the attendee */
  email: string;
  /** Name of the attendee */
  name: string;
  /** Timezone of the attendee */
  timeZone: string;
  /** Locale/language preference */
  locale?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Organizer/host information from Cal.com
 */
export interface CalOrganizer {
  /** Email of the organizer */
  email: string;
  /** Name of the organizer */
  name: string;
  /** Timezone of the organizer */
  timeZone: string;
  /** Username in Cal.com */
  username: string;
}

/**
 * Custom form inputs from Cal.com booking
 */
export interface CalCustomInput {
  /** Label of the custom field */
  label: string;
  /** Value entered by the user */
  value: string | number | boolean;
  /** Type of the input field */
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
}

/**
 * Payment information from Cal.com
 */
export interface CalPayment {
  /** Payment amount in cents */
  amount: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Payment status */
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  /** Payment method used */
  paymentMethod?: string;
  /** External payment ID (e.g., Stripe) */
  externalId?: string;
}

/**
 * Cal.com API configuration
 */
export interface CalApiConfig {
  /** Cal.com username or organization */
  username: string;
  /** Event type slug */
  eventType: string;
  /** Theme configuration */
  theme?: 'light' | 'dark';
  /** Custom branding color */
  brandColor?: string;
  /** Hide event type details */
  hideEventTypeDetails?: boolean;
  /** Calendar layout */
  layout?: 'month_view' | 'week_view';
  /** Default metadata to include */
  metadata?: Record<string, any>;
  /** Success redirect URL */
  successUrl?: string;
  /** Cancellation redirect URL */
  cancelUrl?: string;
}

/**
 * Cal.com SDK event names
 */
export type CalEvent = 
  | 'bookingSuccess'
  | 'bookingCancelled'
  | 'bookingRescheduled'
  | 'eventReady'
  | 'eventError';

/**
 * Cal.com SDK event callback
 */
export interface CalEventCallback {
  /** Event name */
  event: CalEvent;
  /** Event payload data */
  payload: any;
}

/**
 * Integration configuration for Cal.com
 */
export interface CalIntegrationConfig {
  /** Namespace for Cal.com embed */
  namespace: string;
  /** Cal.com username */
  username: string;
  /** Available event types */
  eventTypes: CalEventType[];
  /** Webhook secret for verification */
  webhookSecret?: string;
  /** Custom branding options */
  branding?: {
    color: string;
    textColor: string;
    backgroundColor: string;
  };
  /** Custom fields configuration */
  customFields?: {
    tattooType: boolean;
    size: boolean;
    placement: boolean;
    description: boolean;
    referenceImages: boolean;
    budget: boolean;
  };
}