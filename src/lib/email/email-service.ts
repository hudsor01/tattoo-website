/**
 * Simple Email Service
 * 
 * Basic email sending functionality using Resend.
 * Used only for contact form notifications.
 * Booking-related emails are handled by Cal.com.
 */

import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Default email configuration
export const DEFAULT_FROM_EMAIL = 'noreply@yourdomain.com';

/**
 * Send email using Resend
 */
export async function sendEmail({
  to,
  from = DEFAULT_FROM_EMAIL,
  subject,
  html,
  text,
}: {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const emailOptions = {
      to,
      from: from ?? process.env.ARTIST_EMAIL ?? 'noreply@tattooartist.com',
      subject,
      ...(html ? { html } : { text: text ?? 'No content provided' }),
    };
    
    const result = await resend.emails.send(emailOptions);

    return { success: true, data: result };
  } catch (error) {
    void console.error('Error sending email:', error);
    return { success: false, error };
  }
}