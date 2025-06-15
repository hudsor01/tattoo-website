/**
 * Consolidated Email Service
 *
 * Comprehensive email service for the application.
 * Includes core sending functionality and templates.
 * Booking-related emails are handled by Cal.com.
 */

import { Resend } from 'resend';
import { ENV, getEnvSafe } from '@/lib/utils/env';
// Define local type instead of importing from Prisma
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
  contactId?: string;
}

import { logger } from "@/lib/logger";
// Lazy initialize Resend only when needed
function getResendClient() {
  const apiKey = getEnvSafe('RESEND_API_KEY');
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is required');
  }
  return new Resend(apiKey as string);
}

// Default email configuration
export const DEFAULT_FROM_EMAIL = 'noreply@ink37tattoos.com';

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
      from: from ?? getEnvSafe('ARTIST_EMAIL', 'noreply@tattooartist.com'),
      subject,
      ...(html ? { html } : { text: text ?? 'No content provided' }),
    };

    const resend = getResendClient();
    const result = await resend.emails.send(emailOptions);

    return { success: true, data: result };
  } catch (error) {
    void void logger.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Generate an email for admin notification of a new contact form submission
 */
export function generateAdminContactEmail(data: ContactFormData) {
  const subject = `New Website Contact: ${data.subject ?? 'Website Inquiry'}`;

  // Build the HTML content
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 20px;
          text-align: center;
        }
        .logo {
          font-family: 'Arial Black', sans-serif;
          font-size: 24px;
          font-weight: bold;
          color: #e53e3e;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #e53e3e;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .message {
          border-left: 4px solid #e53e3e;
          padding-left: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">INK 37</div>
      </div>
      <div class="content">
        <h2>New Website Contact Form Submission</h2>

        <div class="details">
          <p><strong>From:</strong> ${data.name} (${data.email})</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          ${data.contactId ? `<p><strong>Contact ID:</strong> #${data.contactId}</p>` : ''}
        </div>

        <h3>Message:</h3>
        <div class="message">
          ${data.message.replace(/\n/g, '<br>')}
        </div>

        <p>You can reply directly to this email to respond to ${data.name}.</p>

        ${data.contactId ? `<a href="${ENV['NEXT_PUBLIC_APP_URL'] ?? 'https://ink37tattoos.com'}/admin?section=contacts&id=${data.contactId}" class="button">View in Admin Dashboard</a>` : ''}
      </div>
      <div class="footer">
        <p>This is an automated notification from your Ink 37 website contact form.</p>
      </div>
    </body>
    </html>
  `;

  // Build the plain text version
  const text = `
NEW WEBSITE CONTACT FORM SUBMISSION

From: ${data.name} (${data.email})
Subject: ${data.subject}
Date: ${new Date().toLocaleString()}
${data.contactId ? `Contact ID: #${data.contactId}` : ''}

MESSAGE:
${data.message}

You can reply directly to this email to respond to ${data.name}.
${data.contactId ? `\nView in Admin Dashboard: ${ENV['NEXT_PUBLIC_APP_URL'] ?? 'https://ink37tattoos.com'}/admin?section=contacts&id=${data.contactId}` : ''}

This is an automated notification from your Ink 37 website contact form.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

/**
 * Generate a confirmation email for the customer after contact form submission
 */
export function generateCustomerContactConfirmation(data: ContactFormData) {
  const subject = `Thank you for contacting Ink 37`;

  // Build the HTML content
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #000;
          color: #fff;
          padding: 20px;
          text-align: center;
        }
        .logo {
          font-family: 'Arial Black', sans-serif;
          font-size: 24px;
          font-weight: bold;
          color: #e53e3e;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f4f4f4;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .message {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          font-style: italic;
        }
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        .social-links a {
          margin: 0 10px;
          text-decoration: none;
          color: #e53e3e;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">INK 37</div>
      </div>
      <div class="content">
        <h2>Hello ${data.name},</h2>

        <p>Thank you for reaching out to Ink 37 Tattoos. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>

        <p>For your reference, here's a copy of your message:</p>

        <div class="message">
          <strong>Subject:</strong> ${data.subject}<br><br>
          ${data.message.replace(/\n/g, '<br>')}
        </div>

        <p>If you have any further questions or information to add, feel free to reply to this email.</p>

        <p>Looking forward to connecting with you!</p>

        <p>Best regards,<br>Ink 37 Tattoos Team</p>

        <div class="social-links">
          <a href="https://instagram.com/fennyg83">Instagram</a> |
          <a href="https://facebook.com/ink37tattoos">Facebook</a>
        </div>
      </div>
      <div class="footer">
        <p>Ink 37 Tattoos | Dallas/Fort Worth, TX</p>
        <p>This email was sent to ${data.email}. If you did not submit this contact form, please disregard this message.</p>
      </div>
    </body>
    </html>
  `;

  // Build the plain text version
  const text = `
Hello ${data.name},

Thank you for reaching out to Ink 37 Tattoos. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.

For your reference, here's a copy of your message:

Subject: ${data.subject}

${data.message}

If you have any further questions or information to add, feel free to reply to this email.

Looking forward to connecting with you!

Best regards,
Ink 37 Tattoos
Ink 37 Tattoos

Follow us on Instagram: https://instagram.com/fennyg83
Like us on Facebook: https://facebook.com/ink37tattoos

Ink 37 Tattoos | Dallas/Fort Worth, TX

This email was sent to ${data.email}. If you did not submit this contact form, please disregard this message.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

/**
 * Generate a simple contact email for admin notifications
 * Used by API routes and server actions
 */
export function generateSimpleAdminContactEmail(data: {
  name: string;
  email: string;
  phone?: string | undefined;
  subject: string;
  service?: string | undefined;
  message: string;
  submissionId?: string | number | undefined;
  attachments?: number | undefined;
}) {
  const subject = `New Contact Form Submission: ${data.subject || 'Website Inquiry'}`;
  
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Phone:</strong> ${data.phone ?? 'Not provided'}</p>
    <p><strong>Subject:</strong> ${data.subject ?? 'Website Contact Form'}</p>
    <p><strong>Service:</strong> ${data.service ?? 'Not specified'}</p>
    <p><strong>Message:</strong> ${data.message}</p>
    ${data.submissionId ? `<p><strong>Submission ID:</strong> ${data.submissionId}</p>` : ''}
    ${data.attachments !== undefined ? `<p><strong>Attachments:</strong> ${data.attachments > 0 ? data.attachments : 'None'}</p>` : ''}
  `;
  
  const text = `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone ?? 'Not provided'}\nSubject: ${data.subject ?? 'Website Contact Form'}\nService: ${data.service ?? 'Not specified'}\nMessage: ${data.message}\n${data.submissionId ? `Submission ID: ${data.submissionId}\n` : ''}${data.attachments !== undefined ? `Attachments: ${data.attachments > 0 ? data.attachments : 'None'}` : ''}`;
  
  return { subject, html, text };
}

/**
 * Generate a simple customer confirmation email
 * Used by API routes and server actions
 */
export function generateSimpleCustomerConfirmation(data: {
  name: string;
  email: string;
  message: string;
}) {
  const subject = 'Thank you for contacting Ink 37 Tattoos';
  
  const html = `
    <h2>Thank you for contacting Ink 37 Tattoos</h2>
    <p>Hi ${data.name},</p>
    <p>Thank you for reaching out about your tattoo. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>
    <p><strong>Your message:</strong></p>
    <p>${data.message}</p>
    <p>Best regards,<br>Fernando<br>Ink 37 Tattoos</p>
  `;
  
  const text = `Thank you for contacting Ink 37 Tattoos\n\nHi ${data.name},\n\nThank you for reaching out about your tattoo. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.\n\nYour message: ${data.message}\n\nBest regards,\nFernando\nInk 37 Tattoos`;
  
  return { subject, html, text };
}
