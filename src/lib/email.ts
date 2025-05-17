/**
 * Email Service
 * 
 * This module provides functions for sending emails of various types.
 */

/**
 * Email template types
 */
export type EmailTemplate = 
  | 'booking-confirmation'
  | 'appointment-reminder'
  | 'payment-receipt'
  | 'password-reset'
  | 'welcome'
  | 'contact-form'
  | 'marketing-campaign'
  | 'aftercare-instructions';

/**
 * Email sender configuration
 */
export interface EmailSender {
  email: string;
  name: string;
}

/**
 * Email recipient
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Base email options
 */
export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  from?: EmailSender;
  replyTo?: EmailSender;
  subject: string;
  templateId?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: any[];
}

/**
 * Interface for email service response
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using the configured email provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    // In a real implementation, this would send the email
    // using a service like Resend, SendGrid, etc.
    console.log('Sending email:', options);

    // Return mock success response
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    };
  }
}

/**
 * Send a template email
 */
export async function sendTemplateEmail(
  template: EmailTemplate,
  options: Omit<EmailOptions, 'html' | 'text'> & { data: Record<string, any> }
): Promise<EmailResponse> {
  try {
    // In a real implementation, this would get the template
    // and send the email with the template and data
    console.log(`Sending template email (${template}):`, options);

    // Return mock success response
    return {
      success: true,
      messageId: `template-${template}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
  } catch (error) {
    console.error(`Error sending template email (${template}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Unknown error sending ${template} email`,
    };
  }
}

/**
 * Send a marketing email to multiple recipients
 */
export async function sendMarketingEmail(
  options: EmailOptions & { campaignId: string }
): Promise<EmailResponse> {
  try {
    // In a real implementation, this would send a marketing email
    // possibly using a different service optimized for marketing
    console.log(`Sending marketing email (campaign: ${options.campaignId}):`, options);

    // Return mock success response
    return {
      success: true,
      messageId: `marketing-${options.campaignId}-${Date.now()}`,
    };
  } catch (error) {
    console.error(`Error sending marketing email (campaign: ${options.campaignId}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending marketing email',
    };
  }
}

/**
 * Send a transactional email
 */
export async function sendTransactionalEmail(
  type: string,
  to: EmailRecipient,
  data: Record<string, any>
): Promise<EmailResponse> {
  try {
    // Determine the appropriate subject based on the email type
    let subject = 'Tattoo Studio Notification';
    if (type === 'booking-confirmation') subject = 'Your Booking Confirmation';
    if (type === 'appointment-reminder') subject = 'Upcoming Appointment Reminder';
    if (type === 'payment-receipt') subject = 'Payment Receipt';
    if (type === 'welcome') subject = 'Welcome to Our Tattoo Studio';
    if (type === 'aftercare-instructions') subject = 'Tattoo Aftercare Instructions';

    // Send the email
    return await sendTemplateEmail(type as EmailTemplate, {
      to,
      subject,
      data,
    });
  } catch (error) {
    console.error(`Error sending ${type} email:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Unknown error sending ${type} email`,
    };
  }
}

/**
 * Generate a booking confirmation email
 * This function generates the content for a booking confirmation email.
 */
export function generateBookingConfirmationEmail(
  booking: {
    id: string;
    name: string;
    email: string;
    preferredDate?: string | Date;
    preferredTime?: string;
    tattooType?: string;
    size?: string;
    placement?: string;
    depositPaid?: boolean;
  }
): { subject: string; html: string; text: string } {
  const formattedDate = booking.preferredDate 
    ? new Date(booking.preferredDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'To be determined';
    
  const formattedTime = booking.preferredTime || 'To be determined';
  
  const subject = `Booking Confirmation - Tattoo Appointment Request #${booking.id}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Booking Confirmation</h1>
      <p>Hello ${booking.name},</p>
      <p>Thank you for booking with us! We've received your tattoo appointment request.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h2 style="color: #444; margin-top: 0;">Booking Details</h2>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>Preferred Date:</strong> ${formattedDate}</p>
        <p><strong>Preferred Time:</strong> ${formattedTime}</p>
        ${booking.tattooType ? `<p><strong>Tattoo Type:</strong> ${booking.tattooType}</p>` : ''}
        ${booking.size ? `<p><strong>Size:</strong> ${booking.size}</p>` : ''}
        ${booking.placement ? `<p><strong>Placement:</strong> ${booking.placement}</p>` : ''}
        <p><strong>Deposit Status:</strong> ${booking.depositPaid ? 'Paid' : 'Pending'}</p>
      </div>
      
      <p>We'll contact you shortly to confirm your appointment details. If you have any questions, please reply to this email.</p>
      
      <p>Thanks,<br>The Tattoo Studio Team</p>
    </div>
  `;
  
  const text = `
    Booking Confirmation
    
    Hello ${booking.name},
    
    Thank you for booking with us! We've received your tattoo appointment request.
    
    Booking Details:
    Booking ID: ${booking.id}
    Preferred Date: ${formattedDate}
    Preferred Time: ${formattedTime}
    ${booking.tattooType ? `Tattoo Type: ${booking.tattooType}` : ''}
    ${booking.size ? `Size: ${booking.size}` : ''}
    ${booking.placement ? `Placement: ${booking.placement}` : ''}
    Deposit Status: ${booking.depositPaid ? 'Paid' : 'Pending'}
    
    We'll contact you shortly to confirm your appointment details. If you have any questions, please reply to this email.
    
    Thanks,
    The Tattoo Studio Team
  `;
  
  return { subject, html, text };
}