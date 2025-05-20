/**
 * email-types.ts
 * 
 * Types for email service functionality, including email parameters, templates, and service integration.
 */

/**
 * Email recipient with name and email address
 */
export interface EmailRecipient {
  email: string;
  name: string;
}

/**
 * Options for sending emails via email provider
 */
export interface EmailOptions {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Status types for email sending
 */
export type EmailStatus = 'sent' | 'failed';

/**
 * Types of emails that can be sent
 */
export type EmailType = 
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'welcome_email'
  | 'cancellation_notice'
  | 'deposit_reminder'
  | 'generic_notification'
  | string;

/**
 * Parameters for sending an email
 */
export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  recipientId: string;
  emailType: EmailType;
}

/**
 * Result of an email sending operation
 */
export interface EmailResult {
  success: boolean;
  messageId?: string; // Make messageId optional
  error?: unknown;
}

/**
 * Parameters for appointment confirmation email
 */
export interface AppointmentEmailParams {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  artistName: string;
  appointmentType: string;
  studioName: string;
  studioAddress: string;
  studioPhone: string;
  depositAmount?: number;
  appointmentId: string;
}

/**
 * Parameters for appointment reminder email
 */
export interface AppointmentReminderParams extends AppointmentEmailParams {
  preparationTips: string[];
}

/**
 * Parameters for welcome email
 */
export interface WelcomeEmailParams {
  firstName: string;
  studioName: string;
  studioWebsite: string;
  instagramHandle: string;
}

/**
 * Parameters for cancellation notice email
 */
export interface CancellationNoticeParams {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  studioName: string;
  studioPhone: string;
  reason: string;
  depositAmount: number;
  isRefundable: boolean;
}

/**
 * Parameters for deposit reminder email
 */
export interface DepositReminderParams {
  customerName: string;
  appointmentDate: Date;
  appointmentTime: string;
  appointmentType: string;
  studioName: string;
  depositAmount: number;
  paymentLink: string;
  dueDate: Date;
}

/**
 * Result of email queue processing
 */
export interface EmailQueueResult {
  success: boolean;
  processed?: number;
  error?: unknown;
}

/**
 * Parameters for booking confirmation email
 */
export interface BookingConfirmationData {
  name: string;
  email: string;
  bookingId: string | number;
  tattooType: string;
  size: string;
  placement: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  depositPaid: boolean;
  depositConfirmed?: boolean;
  paymentMethod: string;
  referenceImages?: string[];
}

/**
 * Parameters for lead magnet delivery email
 */
export interface LeadMagnetData {
  name: string;
  email: string;
  leadMagnetType: string;
  leadMagnetTitle: string;
  downloadUrl: string;
}

export interface BulkEmailOptions extends Omit<EmailOptions, 'to'> {
  to: EmailRecipient[];
  useBcc?: boolean;
  batchSize?: number;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface TemplateData {
  [key: string]: unknown;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendTemplate(
    templateId: string,
    data: TemplateData,
    options: Omit<EmailOptions, 'html' | 'text'>
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBulk(
    options: BulkEmailOptions
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string }>>;
}