/**
 * Email Types - Contact Forms Only
 * 
 * Simplified types for contact form email functionality.
 * Booking-related email types removed since Cal.com handles those.
 */

/**
 * Email recipient with name and email address
 */
export interface EmailRecipient {
  email: string;
  name: string;
}

/**
 * Basic email options for contact form notifications
 */
export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Contact form email data
 */
export interface ContactFormEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  tattooType?: string;
}

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  data?: unknown;
  error?: Error | string | unknown;
}