/**
 * Resend Email Provider Integration
 * https://resend.com/docs/introduction
 *
 * Production-ready implementation for sending emails via Resend
 */

import { Resend } from 'resend';
import type { EmailRecipient, EmailOptions } from '@/types/email-types';

// Default sender email address
export const DEFAULT_FROM_EMAIL: EmailRecipient = {
  email: process.env['EMAIL_FROM'] || 'fernando@ink37tattoos.com',
  name: process.env['EMAIL_FROM_NAME'] || 'Fernando Govea | Ink 37',
};

// Function to create and initialize Resend client
export function createResend(): Resend | null {
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
    return null;
  }
}

// Initialize Resend SDK
const resendClient: Resend | null = createResend();

/**
 * Send an email using Resend
 *
 * @param options Email sending options
 * @returns Promise resolving to send result
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Track the email attempt in analytics
    console.info(`Sending email to ${options.to.email} with subject: ${options.subject}`);

    // Check if API key is configured and client is available
    if (!resendClient) {
      // For development, log the email content instead of sending
      if (process.env['NODE_ENV'] !== 'production') {
        console.info('===== DEVELOPMENT EMAIL =====');
        console.info(`To: ${options.to.name} <${options.to.email}>`);
        console.info(`Subject: ${options.subject}`);
        console.info(
          `Text: ${options.text.substring(0, 300)}${options.text.length > 300 ? '...' : ''}`
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
    const ccAddresses = options.cc?.map(cc => `${cc.name} <${cc.email}>`);
    const bccAddresses = options.bcc?.map(bcc => `${bcc.name} <${bcc.email}>`);

    // Send email via Resend
    const response = await resendClient.emails.send({
      from: `${DEFAULT_FROM_EMAIL.name} <${DEFAULT_FROM_EMAIL.email}>`,
      to: `${options.to.name} <${options.to.email}>`,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo ? `${options.replyTo.name} <${options.replyTo.email}>` : null,
      cc: ccAddresses,
      bcc: bccAddresses,
      attachments: options.attachments?.map(attachment => ({
        filename: attachment.filename,
        content:
          attachment.content instanceof Buffer
            ? attachment.content.toString('base64')
            : Buffer.from(attachment.content).toString('base64'),
        content_type: attachment.contentType,
      })),
    });

    if (response.error) {
      throw new Error(`Resend API error: ${response.error.message}`);
    }

    console.info(`Email sent successfully via Resend, ID: ${response.data?.id}`);

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (error) {
    console.error('Error sending email via Resend:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}