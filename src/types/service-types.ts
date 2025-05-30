/**
 * Type definitions for various service integrations like Google Calendar,
 * email services, and other external APIs.
 */

/**
 * Appointment data for Google Calendar events
 */
export interface CalendarAppointment {
  id: string;
  title: string;
  description?: string;
  start_time: string | Date;
  end_time: string | Date;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed' | 'no_show';
  client_id?: string;
  client_name?: string;
  deposit_paid?: boolean;
  location?: string;
}

/**
 * Calendar event sync action type
 */
export type CalendarSyncAction = 'create' | 'update' | 'delete';

/**
 * Calendar Timezone Config
 */
export interface CalendarTimezoneConfig {
  timezone: string;
  defaultTimezone: string;
}

/**
 * Calendar Event Response
 */
export interface CalendarEventResponse {
  eventId: string;
  success: boolean;
  error?: string;
}

/**
 * Calendar API Configuration
 */
export interface CalendarApiConfig {
  clientEmail: string;
  privateKey: string;
  calendarId: string;
}

/**
 * Email Service Types
 */

/**
 * Email Template Variables
 */
export interface EmailTemplateVars {
  [key: string]: string | number | boolean | null | null;
}

/**
 * Email Sending Options
 */
export interface EmailSendOptions {
  to: string | { email: string; name?: string };
  subject: string;
  templateId?: string;
  templateVars?: EmailTemplateVars;
  text?: string;
  html?: string;
  from?: string | { email: string; name?: string };
  cc?: string[] | Array<{ email: string; name?: string }>;
  bcc?: string[] | Array<{ email: string; name?: string }>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Payment Service Types (Cal.com focused)
 */

/**
 * Payment Webhook Event Types
 */
export type PaymentWebhookEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'booking.completed'
  | 'booking.paid'
  | 'booking.cancelled';

/**
 * Payment API Configuration
 */
export interface PaymentApiConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  currency: string;
}

/**
 * Payment Processing Result
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  amount?: number;
  status?: string;
  error?: string;
}
