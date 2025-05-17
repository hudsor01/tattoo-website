/**
 * Contact form email templates
 * Provides templates for contact form confirmation and admin notifications
 */

import { DEFAULT_FROM_EMAIL } from './email-resend';

import type { ContactFormData } from '@/types/forms-types';

/**
 * Generate an email for admin notification of a new contact form submission
 */
export function generateAdminContactEmail(data: ContactFormData) {
  const subject = `New Website Contact: ${data.subject}`;

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

        ${data.contactId ? `<a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://ink37.com'}/admin?section=contacts&id=${data.contactId}" class="button">View in Admin Dashboard</a>` : ''}
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
${data.contactId ? `\nView in Admin Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://ink37.com'}/admin?section=contacts&id=${data.contactId}` : ''}

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

        <p>Thank you for reaching out to Ink 37 Tattoo Studio. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.</p>

        <p>For your reference, here's a copy of your message:</p>

        <div class="message">
          <strong>Subject:</strong> ${data.subject}<br><br>
          ${data.message.replace(/\n/g, '<br>')}
        </div>

        <p>If you have any further questions or information to add, feel free to reply to this email.</p>

        <p>Looking forward to connecting with you!</p>

        <p>Best regards,<br>Fernando Govea<br>Ink 37 Tattoo Studio</p>

        <div class="social-links">
          <a href="https://instagram.com/fennyg83">Instagram</a> |
          <a href="https://facebook.com/ink37">Facebook</a>
        </div>
      </div>
      <div class="footer">
        <p>Ink 37 Tattoo Studio | Dallas/Fort Worth, TX | (555) 123-4567</p>
        <p>This email was sent to ${data.email}. If you did not submit this contact form, please disregard this message.</p>
      </div>
    </body>
    </html>
  `;

  // Build the plain text version
  const text = `
Hello ${data.name},

Thank you for reaching out to Ink 37 Tattoo Studio. I've received your message and will get back to you as soon as possible, usually within 24-48 hours.

For your reference, here's a copy of your message:

Subject: ${data.subject}

${data.message}

If you have any further questions or information to add, feel free to reply to this email.

Looking forward to connecting with you!

Best regards,
Fernando Govea
Ink 37 Tattoo Studio

Follow us on Instagram: https://instagram.com/fennyg83
Like us on Facebook: https://facebook.com/ink37

Ink 37 Tattoo Studio | Dallas/Fort Worth, TX | (555) 123-4567

This email was sent to ${data.email}. If you did not submit this contact form, please disregard this message.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}