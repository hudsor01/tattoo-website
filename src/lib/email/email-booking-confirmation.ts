/**
 * Booking confirmation email template
 * Provides templates for booking confirmation emails
 */

import { DEFAULT_FROM_EMAIL } from './email-resend';
import { BookingConfirmationData } from '@/types/email-types';

// Expanded booking data types
interface PaymentMethod {
  name: string;
  account: string;
  color: string;
  instructions: string;
}


// PaymentMethod display information
const PAYMENT_METHODS = {
  cashapp: {
    name: 'Cash App',
    account: '$Fernando-Govea',
    color: '#00D632',
    instructions:
      'Send your deposit to $Fernando-Govea via Cash App and include your name in the note.',
  },
  venmo: {
    name: 'Venmo',
    account: '@Fernando-Govea',
    color: '#3D95CE',
    instructions:
      'Send your deposit to @Fernando-Govea via Venmo and include your name in the note.',
  },
  paypal: {
    name: 'PayPal',
    account: 'fennyg83@gmail.com',
    color: '#0079C1',
    instructions:
      'Send your deposit to fennyg83@gmail.com via PayPal and include your name in the note.',
  },
};

/**
 * Generate a booking confirmation email
 */
export function generateBookingConfirmationEmail(data: BookingConfirmationData) {
  // Format date for display
  const date = new Date(data.preferredDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build the subject line
  const subject = data.depositConfirmed
    ? 'Your Tattoo Consultation is Confirmed!'
    : 'Your Tattoo Consultation Request';

  // Build the HTML content
  let html = `
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
        .details-row {
          display: block;
          margin-bottom: 10px;
        }
        .details-label {
          font-weight: bold;
        }
        .payment-method {
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          border: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Ink 37</div>
      </div>
      <div class="content">
        <h2>Hello ${data.name},</h2>
  `;

  // Content varies based on whether the deposit is confirmed
  if (data.depositConfirmed) {
    html += `
        <p>Great news! Your tattoo consultation has been confirmed for <strong>${formattedDate}</strong> during the <strong>${data.preferredTime}</strong> time slot.</p>

        <p>I've received your $50 deposit via ${PAYMENT_METHODS[data.paymentMethod].name} and have reserved your spot. This deposit will be applied to your final tattoo cost.</p>

        <div class="details">
          <h3>Your Consultation Details:</h3>
          <span class="details-row"><span class="details-label">Date:</span> ${formattedDate}</span>
          <span class="details-row"><span class="details-label">Time:</span> ${data.preferredTime}</span>
          <span class="details-row"><span class="details-label">Tattoo Type:</span> ${data.tattooType}</span>
          <span class="details-row"><span class="details-label">Size:</span> ${data.size}</span>
          <span class="details-row"><span class="details-label">Placement:</span> ${data.placement}</span>
          <span class="details-row"><span class="details-label">Description:</span> ${data.description}</span>
          <span class="details-row"><span class="details-label">Booking Reference:</span> #${data.bookingId || '---'}</span>
        </div>

        <h3>What to Bring:</h3>
        <ul>
          <li>A valid ID</li>
          <li>Any reference images or inspiration for your tattoo</li>
          <li>Comfortable clothing appropriate for your tattoo placement</li>
        </ul>

        <p>If you need to reschedule, please contact me at least 48 hours before your appointment. Cancellations with less than 48 hours notice may forfeit the deposit.</p>

        <p>I'm looking forward to meeting you and creating something amazing!</p>
    `;
  } else {
    html += `
        <p>Thank you for requesting a tattoo consultation at Ink 37. I've received your request for <strong>${formattedDate}</strong> during the <strong>${data.preferredTime}</strong> time slot.</p>

        <p>To secure your consultation, a <strong>$50 non-refundable deposit</strong> is required. This deposit will be applied toward your final tattoo cost.</p>

        <div class="payment-method">
          <h3>How to Pay Your Deposit:</h3>
          <p>Please send $50 via ${PAYMENT_METHODS[data.paymentMethod].name} to:</p>
          <p style="font-size: 18px; font-weight: bold; color: ${PAYMENT_METHODS[data.paymentMethod].color};">
            ${PAYMENT_METHODS[data.paymentMethod].account}
          </p>
          <p><strong>Important:</strong> Include your name in the payment note so I can match it to your booking.</p>
          <p>After sending the deposit, please reply to this email to confirm your payment.</p>
        </div>

        <div class="details">
          <h3>Your Consultation Request:</h3>
          <span class="details-row"><span class="details-label">Date:</span> ${formattedDate}</span>
          <span class="details-row"><span class="details-label">Time:</span> ${data.preferredTime}</span>
          <span class="details-row"><span class="details-label">Tattoo Type:</span> ${data.tattooType}</span>
          <span class="details-row"><span class="details-label">Size:</span> ${data.size}</span>
          <span class="details-row"><span class="details-label">Placement:</span> ${data.placement}</span>
          <span class="details-row"><span class="details-label">Description:</span> ${data.description}</span>
          <span class="details-row"><span class="details-label">Booking Reference:</span> #${data.bookingId || '---'}</span>
        </div>

        <p>Once I receive your deposit, I'll send a confirmation email with additional details for your consultation.</p>

        <p>If you have any questions, feel free to reply to this email or call/text me at (555) 123-4567.</p>
    `;
  }

  // Common footer for both email versions
  html += `
        <p>Thanks for choosing Ink 37!</p>
        <p>Best regards,<br>Fernando Govea<br>Ink 37</p>
      </div>
      <div class="footer">
        <p>Ink 37 | Dallas/Fort Worth, TX | (555) 123-4567</p>
        <p>This email was sent to ${data.email}. If you have any questions, please contact fennyg83@gmail.com</p>
      </div>
    </body>
    </html>
  `;

  // Build the plain text version
  let text = `Hello ${data.name},\n\n`;

  if (data.depositConfirmed) {
    text += `Great news! Your tattoo consultation has been confirmed for ${formattedDate} during the ${data.preferredTime} time slot.\n\n`;
    text += `I've received your $50 deposit via ${PAYMENT_METHODS[data.paymentMethod].name} and have reserved your spot. This deposit will be applied to your final tattoo cost.\n\n`;
    text += `YOUR CONSULTATION DETAILS:\n`;
    text += `Date: ${formattedDate}\n`;
    text += `Time: ${data.preferredTime}\n`;
    text += `Tattoo Type: ${data.tattooType}\n`;
    text += `Size: ${data.size}\n`;
    text += `Placement: ${data.placement}\n`;
    text += `Description: ${data.description}\n`;
    text += `Booking Reference: #${data.bookingId || '---'}\n\n`;
    text += `WHAT TO BRING:\n`;
    text += `- A valid ID\n`;
    text += `- Any reference images or inspiration for your tattoo\n`;
    text += `- Comfortable clothing appropriate for your tattoo placement\n\n`;
    text += `If you need to reschedule, please contact me at least 48 hours before your appointment. Cancellations with less than 48 hours notice may forfeit the deposit.\n\n`;
    text += `I'm looking forward to meeting you and creating something amazing!\n\n`;
  } else {
    text += `Thank you for requesting a tattoo consultation at Ink 37. I've received your request for ${formattedDate} during the ${data.preferredTime} time slot.\n\n`;
    text += `To secure your consultation, a $50 non-refundable deposit is required. This deposit will be applied toward your final tattoo cost.\n\n`;
    text += `HOW TO PAY YOUR DEPOSIT:\n`;
    text += `Please send $50 via ${PAYMENT_METHODS[data.paymentMethod].name} to: ${PAYMENT_METHODS[data.paymentMethod].account}\n\n`;
    text += `IMPORTANT: Include your name in the payment note so I can match it to your booking.\n`;
    text += `After sending the deposit, please reply to this email to confirm your payment.\n\n`;
    text += `YOUR CONSULTATION REQUEST:\n`;
    text += `Date: ${formattedDate}\n`;
    text += `Time: ${data.preferredTime}\n`;
    text += `Tattoo Type: ${data.tattooType}\n`;
    text += `Size: ${data.size}\n`;
    text += `Placement: ${data.placement}\n`;
    text += `Description: ${data.description}\n`;
    text += `Booking Reference: #${data.bookingId || '---'}\n\n`;
    text += `Once I receive your deposit, I'll send a confirmation email with additional details for your consultation.\n\n`;
    text += `If you have any questions, feel free to reply to this email or call/text me at (555) 123-4567.\n\n`;
  }

  text += `Thanks for choosing Ink 37!\n\n`;
  text += `Best regards,\nFernando Govea\nInk 37\n\n`;
  text += `Ink 37 | Dallas/Fort Worth, TX | (555) 123-4567\n`;
  text += `This email was sent to ${data.email}. If you have any questions, please contact fennyg83@gmail.com`;

  return {
    subject,
    html,
    text,
  };
}