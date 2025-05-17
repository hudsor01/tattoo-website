/**
 * Lead magnet email template
 * Provides templates for lead magnet delivery emails
 */

import { DEFAULT_FROM_EMAIL } from './email-resend';
import type { LeadMagnetData } from '@/types/email-types';

/**
 * Generate an email for delivering a lead magnet
 */
export function generateLeadMagnetEmail(data: LeadMagnetData) {
  // Map of lead magnet types to their descriptions and follow-up content
  const leadMagnetInfo = {
    'tattoo-guide': {
      description:
        'This comprehensive guide will walk you through everything you need to know about getting your first tattoo, from choosing the right design and artist to aftercare.',
      followUp:
        'Now that you have the guide, have you started thinking about what design you might want for your first tattoo?',
    },
    'aftercare-checklist': {
      description:
        'This checklist covers everything you need to properly care for your new tattoo during the critical healing process to ensure it looks its best for years to come.',
      followUp:
        "Do you have a new tattoo that you're currently taking care of, or are you preparing for an upcoming appointment?",
    },
    'design-ideas': {
      description:
        'This collection of 101 unique tattoo ideas across various styles will help inspire your next piece of body art.',
      followUp: 'Which tattoo style are you most drawn to from the collection?',
    },
  };

  const info = leadMagnetInfo[data.leadMagnetType];
  const subject = `Your Download: ${data.leadMagnetTitle}`;

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
          color: white !important;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
          text-align: center;
        }
        .follow-up {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          border-left: 4px solid #e53e3e;
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

        <p>Thank you for your interest in ${data.leadMagnetTitle}! Your download is ready.</p>

        <p>${info.description}</p>

        <p style="text-align: center;">
          <a href="${data.downloadUrl}" class="button">DOWNLOAD YOUR ${data.leadMagnetTitle.toUpperCase()}</a>
        </p>

        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${data.downloadUrl}</p>

        <div class="follow-up">
          <p><strong>A quick question for you:</strong></p>
          <p>${info.followUp}</p>
          <p>Feel free to reply to this email – I'd love to hear from you!</p>
        </div>

        <p>If you're considering getting a tattoo or have questions about the process, I'm here to help. As a professional tattoo artist with over 10 years of experience, I specialize in creating custom designs that tell your unique story.</p>

        <p>Best regards,<br>Fernando Govea<br>Ink 37 Tattoo Studio</p>

        <div class="social-links">
          <a href="https://instagram.com/fennyg83">Instagram</a> |
          <a href="https://facebook.com/ink37">Facebook</a>
        </div>
      </div>
      <div class="footer">
        <p>Ink 37 Tattoo Studio | Dallas/Fort Worth, TX | (555) 123-4567</p>
        <p>This email was sent to ${data.email} because you requested this resource.
        If you didn't request this download, please disregard this message.</p>
      </div>
    </body>
    </html>
  `;

  // Build the plain text version
  const text = `
Hello ${data.name},

Thank you for your interest in ${data.leadMagnetTitle}! Your download is ready.

${info.description}

DOWNLOAD YOUR ${data.leadMagnetTitle.toUpperCase()}:
${data.downloadUrl}

A QUICK QUESTION FOR YOU:
${info.followUp}

Feel free to reply to this email – I'd love to hear from you!

If you're considering getting a tattoo or have questions about the process, I'm here to help. As a professional tattoo artist with over 10 years of experience, I specialize in creating custom designs that tell your unique story.

Best regards,
Fernando Govea
Ink 37 Tattoo Studio

Follow us on Instagram: https://instagram.com/{INSTAGRAM}
Like us on Facebook: https://facebook.com/ink37

Ink 37 Tattoo Studio | Dallas/Fort Worth, TX | (555) 123-4567

This email was sent to ${data.email} because you requested this resource. If you didn't request this download, please disregard this message.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}