/**
 * Email Templates
 * 
 * Defines all email templates used in the application
 */

import { 
  AppointmentEmailParams,
  AppointmentReminderParams,
  WelcomeEmailParams,
  BookingConfirmationData,
  CancellationNoticeParams,
  DepositReminderParams
} from '@/types/email-types';

/**
 * Generate appointment confirmation email content
 */
export function generateAppointmentConfirmationEmail(params: AppointmentEmailParams) {
  const { 
    customerName, 
    appointmentDate, 
    appointmentTime, 
    artistName, 
    appointmentType,
    // studioName is used in the template subject construction
    studioAddress,
    studioPhone,
    depositAmount 
  } = params;
  
  const subject = `Appointment Confirmation: ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}`;
  
  const html = `
    <html>
      <body>
        <h1>Appointment Confirmation</h1>
        <p>Hello ${customerName},</p>
        <p>Your appointment has been confirmed for ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} with ${artistName}.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Service: ${appointmentType}</li>
          <li>Location: ${studioAddress}</li>
          <li>Phone: ${studioPhone}</li>
          ${depositAmount ? `<li>Deposit: $${depositAmount}</li>` : ''}
        </ul>
        <p><strong>Preparation Instructions:</strong></p>
        <ul>
          <li>Get plenty of rest the night before</li>
          <li>Stay hydrated</li>
          <li>Eat a meal before your appointment</li>
          <li>Wear comfortable clothing</li>
        </ul>
        <p>If you need to reschedule, please give at least 48 hours notice.</p>
        <p>We look forward to seeing you!</p>
      </body>
    </html>
  `;
  
  const text = `
    Appointment Confirmation
    
    Hello ${customerName},
    
    Your appointment has been confirmed for ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} with ${artistName}.
    
    Details:
    - Service: ${appointmentType}
    - Location: ${studioAddress}
    - Phone: ${studioPhone}
    ${depositAmount ? `- Deposit: $${depositAmount}` : ''}
    
    Preparation Instructions:
    - Get plenty of rest the night before
    - Stay hydrated
    - Eat a meal before your appointment
    - Wear comfortable clothing
    
    If you need to reschedule, please give at least 48 hours notice.
    
    We look forward to seeing you!
  `;
  
  return { html, text, subject };
}

/**
 * Generate appointment reminder email content
 */
export function generateAppointmentReminderEmail(params: AppointmentReminderParams) {
  const { 
    customerName, 
    appointmentDate, 
    appointmentTime, 
    artistName, 
    appointmentType,
    preparationTips 
  } = params;
  
  const subject = `Reminder: Your Appointment on ${new Date(appointmentDate).toLocaleDateString()}`;
  
  const tipsHtml = preparationTips?.map(tip => `<li>${tip}</li>`).join('') || '';
  
  const html = `
    <html>
      <body>
        <h1>Appointment Reminder</h1>
        <p>Hello ${customerName},</p>
        <p>This is a friendly reminder of your upcoming appointment:</p>
        <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Artist:</strong> ${artistName}</p>
        <p><strong>Service:</strong> ${appointmentType}</p>
        
        ${preparationTips?.length ? `
        <p><strong>Preparation Tips:</strong></p>
        <ul>
          ${tipsHtml}
        </ul>
        ` : ''}
        
        <p>Please arrive 10-15 minutes before your appointment time. If you need to reschedule, please contact us as soon as possible.</p>
        <p>We look forward to seeing you!</p>
      </body>
    </html>
  `;
  
  const tipsText = preparationTips?.map(tip => `- ${tip}`).join('\n') || '';
  
  const text = `
    Appointment Reminder
    
    Hello ${customerName},
    
    This is a friendly reminder of your upcoming appointment:
    
    Date: ${new Date(appointmentDate).toLocaleDateString()}
    Time: ${appointmentTime}
    Artist: ${artistName}
    Service: ${appointmentType}
    
    ${preparationTips?.length ? `Preparation Tips:\n${tipsText}\n` : ''}
    
    Please arrive 10-15 minutes before your appointment time. If you need to reschedule, please contact us as soon as possible.
    
    We look forward to seeing you!
  `;
  
  return { html, text, subject };
}

/**
 * Generate welcome email content
 */
export function generateWelcomeEmail(params: WelcomeEmailParams) {
  const { firstName, studioName, studioWebsite, instagramHandle } = params;
  
  const subject = `Welcome to ${studioName}`;
  
  const html = `
    <html>
      <body>
        <h1>Welcome to ${studioName}!</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for creating an account with us. We're excited to have you join our community of tattoo enthusiasts.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Book appointments online</li>
          <li>View your upcoming and past appointments</li>
          <li>Browse our artist portfolios</li>
          <li>Get updates on special events and flash sales</li>
        </ul>
        <p>Stay connected with us:</p>
        <ul>
          <li>Website: <a href="${studioWebsite}">${studioWebsite}</a></li>
          <li>Instagram: <a href="https://instagram.com/${instagramHandle}">@${instagramHandle}</a></li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        <p>We look forward to creating art with you!</p>
      </body>
    </html>
  `;
  
  const text = `
    Welcome to ${studioName}!
    
    Hello ${firstName},
    
    Thank you for creating an account with us. We're excited to have you join our community of tattoo enthusiasts.
    
    With your account, you can:
    - Book appointments online
    - View your upcoming and past appointments
    - Browse our artist portfolios
    - Get updates on special events and flash sales
    
    Stay connected with us:
    - Website: ${studioWebsite}
    - Instagram: @${instagramHandle}
    
    If you have any questions or need assistance, please don't hesitate to contact us.
    
    We look forward to creating art with you!
  `;
  
  return { html, text, subject };
}

/**
 * Generate booking confirmation email content
 */
export function generateBookingConfirmationEmail(data: BookingConfirmationData) {
  const {
    name,
    // email is used in a different part of the application
    bookingId,
    tattooType,
    size,
    placement,
    preferredDate,
    preferredTime,
    depositPaid,
    paymentMethod
  } = data;
  
  const subject = `Booking Confirmation #${bookingId}`;
  
  const html = `
    <html>
      <body>
        <h1>Booking Confirmation</h1>
        <p>Hello ${name},</p>
        <p>Thank you for booking with us. Here are your booking details:</p>
        <p><strong>Booking ID:</strong> #${bookingId}</p>
        <p><strong>Tattoo Type:</strong> ${tattooType}</p>
        <p><strong>Size:</strong> ${size}</p>
        <p><strong>Placement:</strong> ${placement}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime}</p>
        <p><strong>Deposit Status:</strong> ${depositPaid ? 'Paid' : 'Not Paid'}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        
        <p>We will review your booking details and contact you shortly to confirm your appointment.</p>
        <p>If you have any questions, please reply to this email or contact our studio.</p>
        <p>Thank you for choosing us for your tattoo journey!</p>
      </body>
    </html>
  `;
  
  const text = `
    Booking Confirmation
    
    Hello ${name},
    
    Thank you for booking with us. Here are your booking details:
    
    Booking ID: #${bookingId}
    Tattoo Type: ${tattooType}
    Size: ${size}
    Placement: ${placement}
    Preferred Date: ${preferredDate}
    Preferred Time: ${preferredTime}
    Deposit Status: ${depositPaid ? 'Paid' : 'Not Paid'}
    Payment Method: ${paymentMethod}
    
    We will review your booking details and contact you shortly to confirm your appointment.
    
    If you have any questions, please reply to this email or contact our studio.
    
    Thank you for choosing us for your tattoo journey!
  `;
  
  return { html, text, subject };
}

/**
 * Generate appointment cancellation email content
 */
export function generateCancellationEmail(params: CancellationNoticeParams) {
  const {
    customerName,
    appointmentDate,
    appointmentTime,
    // appointmentType is used in the email content logic
    studioName,
    studioPhone,
    reason,
    depositAmount,
    isRefundable
  } = params;
  
  const subject = `Appointment Cancellation: ${new Date(appointmentDate).toLocaleDateString()}`;
  
  const html = `
    <html>
      <body>
        <h1>Appointment Cancellation</h1>
        <p>Hello ${customerName},</p>
        <p>Your appointment on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} has been cancelled.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        ${depositAmount ? (isRefundable ? 
          `<p>A refund of $${depositAmount} has been processed and will be returned to your original payment method within 3-5 business days.</p>` 
          : 
          `<p>Please note that according to our cancellation policy, your deposit of $${depositAmount} is non-refundable.</p>`
        ) : ''}
        
        <p>If you would like to reschedule, please contact us at ${studioPhone} or visit our website.</p>
        <p>Thank you for your understanding.</p>
        <p>Sincerely,<br>${studioName}</p>
      </body>
    </html>
  `;
  
  const text = `
    Appointment Cancellation
    
    Hello ${customerName},
    
    Your appointment on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} has been cancelled.
    
    ${reason ? `Reason: ${reason}` : ''}
    
    ${depositAmount ? (isRefundable ? 
      `A refund of $${depositAmount} has been processed and will be returned to your original payment method within 3-5 business days.` 
      : 
      `Please note that according to our cancellation policy, your deposit of $${depositAmount} is non-refundable.`
    ) : ''}
    
    If you would like to reschedule, please contact us at ${studioPhone} or visit our website.
    
    Thank you for your understanding.
    
    Sincerely,
    ${studioName}
  `;
  
  return { html, text, subject };
}

/**
 * Generate deposit reminder email content
 */
export function generateDepositReminderEmail(params: DepositReminderParams) {
  const {
    customerName,
    appointmentDate,
    appointmentTime,
    appointmentType,
    studioName,
    depositAmount,
    paymentLink,
    dueDate
  } = params;
  
  const subject = `Deposit Reminder for Your Appointment`;
  
  const html = `
    <html>
      <body>
        <h1>Deposit Reminder</h1>
        <p>Hello ${customerName},</p>
        <p>This is a friendly reminder that a deposit of $${depositAmount} is required to secure your appointment on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.</p>
        <p><strong>Appointment Details:</strong></p>
        <ul>
          <li>Date: ${new Date(appointmentDate).toLocaleDateString()}</li>
          <li>Time: ${appointmentTime}</li>
          <li>Service: ${appointmentType}</li>
          <li>Deposit Amount: $${depositAmount}</li>
          <li>Due Date: ${new Date(dueDate).toLocaleDateString()}</li>
        </ul>
        <p>To pay your deposit, please click the link below:</p>
        <p><a href="${paymentLink}">Pay Deposit Now</a></p>
        <p>If you have any questions or need assistance, please let us know.</p>
        <p>Thank you for choosing ${studioName}. We look forward to your appointment!</p>
      </body>
    </html>
  `;
  
  const text = `
    Deposit Reminder
    
    Hello ${customerName},
    
    This is a friendly reminder that a deposit of $${depositAmount} is required to secure your appointment on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime}.
    
    Appointment Details:
    - Date: ${new Date(appointmentDate).toLocaleDateString()}
    - Time: ${appointmentTime}
    - Service: ${appointmentType}
    - Deposit Amount: $${depositAmount}
    - Due Date: ${new Date(dueDate).toLocaleDateString()}
    
    To pay your deposit, please visit:
    ${paymentLink}
    
    If you have any questions or need assistance, please let us know.
    
    Thank you for choosing ${studioName}. We look forward to your appointment!
  `;
  
  return { html, text, subject };
}