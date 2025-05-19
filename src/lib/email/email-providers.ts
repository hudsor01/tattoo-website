/**
 * Email Service Providers
 *
 * This file defines the email service providers and their interfaces.
 * Currently supports Resend as the primary provider.
 */

import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';

// Types for email sending
export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface EmailOptions {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
}

// Result of sending an email
export interface EmailSendResult {
  success: boolean;
  id: string | undefined;
  error?: string;
}

// Default sender email address
export const DEFAULT_FROM_EMAIL: EmailRecipient = {
  email: process.env['EMAIL_FROM'] || 'fernando@ink37tattoos.com',
  name: process.env['EMAIL_FROM_NAME'] || 'Fernando Govea | Ink 37',
};

/**
 * Email Provider Interface
 * All email providers must implement this interface
 */
export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<EmailSendResult>;
}

/**
 * Resend Email Provider
 * Implementation of EmailProvider using Resend
 */
export class ResendEmailProvider implements EmailProvider {
  private client: Resend | null;

  constructor() {
    this.client = this.initialize();
  }

  /**
   * Initialize the Resend client
   */
  private initialize(): Resend | null {
    try {
      if (process.env['RESEND_API_KEY']) {
        const client = new Resend(process.env['RESEND_API_KEY']);
        console.info('Resend client initialized successfully');
        return client;
      } else {
        console.warn('RESEND_API_KEY not configured, email sending will use fallback mode');
        return null;
      }
    } catch (error) {
      console.error('Failed to initialize Resend client:', error);
      Sentry.captureException(error);
      return null;
    }
  }

  /**
   * Send an email using Resend
   * @param options Email sending options
   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      // Track the email attempt in analytics
      console.info(`Sending email to ${options.to.email} with subject: ${options.subject}`);

      // Check if API key is configured and client is available
      if (!this.client) {
        // For development, log the email content instead of sending
        if (process.env.NODE_ENV !== 'production') {
          console.info('===== DEVELOPMENT EMAIL =====');
          console.info(`To: ${options.to.name} <${options.to.email}>`);
          console.info(`Subject: ${options.subject}`);
          console.info(
            `Text: ${options.text.substring(0, 300)}${options.text.length > 300 ? '...' : ''}`,
          );
          console.info('==============================');

          return { success: true, id: `dev-mode-email-${Date.now()}` };
        }

        // Log email details in production as a fallback
        console.info('===== PRODUCTION EMAIL FALLBACK =====');
        console.info(`To: ${options.to.name} <${options.to.email}>`);
        console.info(`Subject: ${options.subject}`);
        console.info('====================================');

        return { success: true, id: `fallback-email-${Date.now()}` };
      }

      // Format recipients
      const ccAddresses = options.cc?.map(cc => `${cc.name || cc.email} <${cc.email}>`);
      const bccAddresses = options.bcc?.map(bcc => `${bcc.name || bcc.email} <${bcc.email}>`);

      // Send email via Resend
      const response = await this.client.emails.send({
        from: `${DEFAULT_FROM_EMAIL.name} <${DEFAULT_FROM_EMAIL.email}>`,
        to: `${options.to.name || options.to.email} <${options.to.email}>`,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo
          ? `${options.replyTo.name || options.replyTo.email} <${options.replyTo.email}>`
          : undefined,
        cc: ccAddresses ?? undefined,
        bcc: bccAddresses ?? undefined,
        attachments: options.attachments
          ? options.attachments.map(attachment => ({
              filename: attachment.filename,
              content:
                attachment.content instanceof Buffer
                  ? attachment.content.toString('base64')
                  : Buffer.from(attachment.content).toString('base64'),
              content_type: attachment.contentType,
            }))
          : undefined,
        react: undefined,
      });

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`);
      }
      return {
        success: true,
        id: response.data?.id ?? undefined,
      };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      Sentry.captureException(error);

      return {
        success: false,
        id: undefined,
        error: error instanceof Error ? error.message : 'Unknown error sending email',
      };
    }
  }
}

/**
 * Create and return the default email provider
 */
export function createEmailProvider(): EmailProvider {
  return new ResendEmailProvider();
}

// Create a singleton instance of the email provider
let emailProviderInstance: EmailProvider | null = null;

/**
 * Get the email provider instance
 * Returns a singleton instance of the email provider
 */
export function getEmailProvider(): EmailProvider {
  if (!emailProviderInstance) {
    emailProviderInstance = createEmailProvider();
  }
  return emailProviderInstance;
}
