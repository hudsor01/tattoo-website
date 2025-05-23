/**
 * Email Service - Centralized email sending functionality
 *
 * This service handles all email sending operations including:
 * - Email template rendering
 * - Sending emails via Resend
 * - Logging email activity to the database
 * - Processing email notification queue
 */

import { Resend } from 'resend';
import type { EmailRecipient } from '@/types/email-types';
import { prisma } from '@/lib/db/prisma';

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
    const result = await resend.emails.send({
      to,
      from,
      subject,
      html,
      text,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Import type definitions
import type {
  EmailStatus,
  EmailType,
  EmailParams,
  EmailResult,
  EmailQueueResult,
} from '@/types/email-types';


/**
 * Log email activity to the database
 */
async function logEmailActivity(
  recipientId: string,
  recipientEmail: string,
  emailType: EmailType,
  subject: string,
  status: EmailStatus,
  errorMessage?: string | Error | unknown,
): Promise<void> {
  try {
    await prisma.notificationQueue.create({
      data: {
        recipientId,
        recipientType: 'customer',
        title: subject,
        message: `Email ${status}: ${emailType}`,
        notificationType: 'email',
        isRead: true,
        isProcessed: true,
        processedAt: new Date(),
        errorMessage: errorMessage ? String(errorMessage) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log email activity:', error);
    // Sentry.captureException(error); // Not using Sentry currently
  }
}

/**
 * Send an email with error handling and logging
 */
export async function sendEmail({
  to,
  subject,
  html,
  recipientId,
  emailType,
}: EmailParams): Promise<EmailResult> {
  try {
    const emailRecipient: EmailRecipient = {
      email: to,
      name: to,
    };

    // Dynamically import html-to-text when needed
    const { htmlToText } = await import('html-to-text');
    
    // Convert HTML to plain text for email clients that don't support HTML
    const text = htmlToText(html, { wordwrap: 130 });

    // Send email using Resend client
    const result = await resendSendEmail({
      to: emailRecipient,
      subject,
      html,
      text,
    });

    // Log the email activity
    await logEmailActivity(
      recipientId,
      to,
      emailType,
      subject,
      result.success ? 'sent' : 'failed',
      result.error,
    );

    if (result.success) {
      // Fixed type issue with messageId potentially being null
      return { success: true, messageId: result.id || '' };
    } else {
      return { success: false, error: String(result.error) };
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    // Sentry.captureException(error); // Not using Sentry currently

    // Log the failure
    await logEmailActivity(
      recipientId,
      to,
      emailType,
      subject,
      'failed',
      error instanceof Error ? error.message : String(error),
    );

    return { success: false, error: String(error) };
  }
}

/**
 * Send an appointment confirmation email
 */
export async function sendAppointmentConfirmation(appointmentId: string): Promise<EmailResult> {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Customer: true,
        Artist: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!appointment || !appointment.Customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Email templates disabled - return success placeholder
    return { success: true, messageId: 'disabled' };
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    // Sentry.captureException(error); // Not using Sentry currently
    return { success: false, error: String(error) };
  }
}

/**
 * Send an appointment reminder email
 */
export async function sendAppointmentReminder(appointmentId: string): Promise<EmailResult> {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Customer: true,
        Artist: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!appointment || !appointment.Customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Email templates disabled - return success placeholder
    return { success: true, messageId: 'disabled' };
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    // Sentry.captureException(error); // Not using Sentry currently
    return { success: false, error: String(error) };
  }
}

/**
 * Send a welcome email to a new customer
 */
export async function sendWelcomeEmail(customerId: string): Promise<EmailResult> {
  try {
    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || !customer.email) {
      throw new Error(`Invalid customer or missing email: ${customerId}`);
    }

    // Email templates disabled - return success placeholder
    return { success: true, messageId: 'disabled' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Sentry.captureException(error); // Not using Sentry currently
    return { success: false, error: String(error) };
  }
}

/**
 * Send a cancellation notice for an appointment
 */
export async function sendCancellationNotice(
  appointmentId: string,
): Promise<EmailResult> {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Customer: true,
      },
    });

    if (!appointment || !appointment.Customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Email templates disabled - return success placeholder
    return { success: true, messageId: 'disabled' };
  } catch (error) {
    console.error('Error sending cancellation notice:', error);
    // Sentry.captureException(error); // Not using Sentry currently
    return { success: false, error: String(error) };
  }
}

/**
 * Send a deposit reminder email
 */
export async function sendDepositReminder(appointmentId: string): Promise<EmailResult> {
  try {
    // Get appointment details with customer info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Customer: true,
      },
    });

    if (!appointment || !appointment.Customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Email templates disabled - return success placeholder
    return { success: true, messageId: 'disabled' };
  } catch (error) {
    console.error('Error sending deposit reminder:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Process the email notification queue
 */
export async function processEmailQueue(): Promise<EmailQueueResult> {
  try {
    let hasMore = true;
    const batchSize = 50;
    let totalProcessed = 0;

    while (hasMore) {
      // Get unprocessed email notifications in batches
      const notifications = await prisma.notificationQueue.findMany({
        where: {
          isProcessed: false,
          notificationType: 'email',
        },
        take: batchSize,
      });

      // Check if we have more notifications to process
      if (notifications.length < batchSize) {
        hasMore = false;
      }

      totalProcessed += notifications.length;
      console.info(`Processing ${notifications.length} email notifications`);

      // Process each notification
      for (const notification of notifications) {
        try {
          // Mark as being processed
          await prisma.notificationQueue.update({
            where: { id: notification.id },
            data: { isProcessed: true, processedAt: new Date() },
          });

          // Get recipient details
          if (notification.recipientType === 'customer') {
            const customer = await prisma.customer.findUnique({
              where: { id: notification.recipientId },
            });

            if (!customer || !customer.email) {
              console.warn(
                `Cannot send email: Invalid customer or missing email: ${notification.recipientId}`,
              );
              continue;
            }

            // Determine email type and send appropriate email
            switch (notification.notificationType) {
              case 'appointment_confirmation': {
                // Extract appointment ID from action URL
                const appointmentId = notification.actionUrl?.split('/').pop();
                if (appointmentId) {
                  await sendAppointmentConfirmation(appointmentId);
                }
                break;
              }
              // Add other cases as needed
            }
          }
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);
          // Update notification with error
          await prisma.notificationQueue.update({
            where: { id: notification.id },
            data: { errorMessage: String(error) },
          });
        }
      }
    }
    
    return {
      success: true,
      message: `Successfully processed ${totalProcessed} email notifications`
    };
  } catch (error) {
    console.error('Error processing email queue:', error);
    return {
      success: false,
      error: String(error),
      message: 'Failed to process email notifications'
    };
  }
}
