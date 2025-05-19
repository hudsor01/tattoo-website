/**
 * Email Service - Centralized email sending functionality
 *
 * This service handles all email sending operations including:
 * - Email template rendering
 * - Sending emails via Resend
 * - Logging email activity to the database
 * - Processing email notification queue
 */

import { sendEmail as resendSendEmail } from './email-resend';
import type { EmailRecipient } from '@/types/email-types';
import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/db/db';

// Import type definitions
import {
  EmailStatus,
  EmailType,
  EmailParams,
  EmailResult,
  EmailQueueResult,
  AppointmentEmailParams,
  AppointmentReminderParams,
  WelcomeEmailParams,
  CancellationNoticeParams,
  DepositReminderParams,
} from '@/types/email-types';

// Using the singleton PrismaClient instance from '@/lib/database/prisma'

/**
 * Log email activity to the database
 */
async function logEmailActivity(
  recipientId: string,
  recipientEmail: string,
  emailType: EmailType,
  subject: string,
  status: EmailStatus,
  errorMessage?: string,
) {
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
        errorMessage,
      },
    });
  } catch (error) {
    console.error('Failed to log email activity:', error);
    Sentry.captureException(error);
  }
}

/**
 * Send an email with error handling and logging
 */
async function sendEmail({
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
      return { success: true, messageId: result.id };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    Sentry.captureException(error);

    // Log the failure
    await logEmailActivity(
      recipientId,
      to,
      emailType,
      subject,
      'failed',
      error instanceof Error ? error.message : String(error),
    );

    return { success: false, error };
  }
}

/**
 * Send an appointment confirmation email
 */
export async function sendAppointmentConfirmation(appointmentId: string) {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        artist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment || !appointment.customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Dynamically import the email template and render function
    const [{ default: AppointmentConfirmation }, { render }] = await Promise.all([
      import('@/emails/AppointmentConfirmation'),
      import('@react-email/render')
    ]);
    
    // Render email from React component
    const emailHtml = await render(
      AppointmentConfirmation({
        customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        appointmentDate: appointment.startDate,
        appointmentTime: appointment.startDate.toLocaleTimeString(),
        artistName: appointment.artist.user.name || 'Your Tattoo Artist',
        appointmentType: appointment.title,
        studioName: process.env.STUDIO_NAME || 'Our Tattoo Studio',
        studioAddress: process.env.STUDIO_ADDRESS || 'Studio Address',
        studioPhone: process.env.STUDIO_PHONE || '(555) 123-4567',
        depositAmount: appointment.deposit || 0,
        appointmentId: appointment.id,
      }),
    );

    // Send email
    return await sendEmail({
      to: appointment.customer.email,
      subject: 'Your Tattoo Appointment Confirmation',
      html: emailHtml,
      recipientId: appointment.customer.id,
      emailType: 'appointment_confirmation',
    });
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    Sentry.captureException(error);
    return { success: false, error };
  }
}

/**
 * Send an appointment reminder email
 */
export async function sendAppointmentReminder(appointmentId: string) {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        artist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment || !appointment.customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Dynamically import the email template and render function
    const [{ default: AppointmentReminder }, { render }] = await Promise.all([
      import('@/emails/AppointmentReminder'),
      import('@react-email/render')
    ]);
    
    // Render email from React component
    const emailHtml = await render(
      AppointmentReminder({
        customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        appointmentDate: appointment.startDate,
        appointmentTime: appointment.startDate.toLocaleTimeString(),
        artistName: appointment.artist.user.name || 'Your Tattoo Artist',
        appointmentType: appointment.title,
        studioName: process.env.STUDIO_NAME || 'Our Tattoo Studio',
        studioAddress: process.env.STUDIO_ADDRESS || 'Studio Address',
        studioPhone: process.env.STUDIO_PHONE || '(555) 123-4567',
        appointmentId: appointment.id,
        preparationTips: [
          'Eat a good meal before your appointment',
          'Stay hydrated',
          'Wear comfortable clothing',
          'Bring headphones if you like',
        ],
      }),
    );

    // Send email
    return await sendEmail({
      to: appointment.customer.email,
      subject: 'Reminder: Your Upcoming Tattoo Appointment',
      html: emailHtml,
      recipientId: appointment.customer.id,
      emailType: 'appointment_reminder',
    });
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    Sentry.captureException(error);
    return { success: false, error };
  }
}

/**
 * Send a welcome email to a new customer
 */
export async function sendWelcomeEmail(customerId: string) {
  try {
    // Get customer details
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer || !customer.email) {
      throw new Error(`Invalid customer or missing email: ${customerId}`);
    }

    // Dynamically import the email template and render function
    const [{ default: WelcomeEmail }, { render }] = await Promise.all([
      import('@/emails/WelcomeEmail'),
      import('@react-email/render')
    ]);
    
    // Render email from React component
    const emailHtml = await render(
      WelcomeEmail({
        firstName: customer.firstName,
        studioName: process.env.STUDIO_NAME || 'Our Tattoo Studio',
        studioWebsite: process.env.STUDIO_WEBSITE || 'https://example.com',
        instagramHandle: process.env.INSTAGRAM_HANDLE || '@tattoo_studio',
      }),
    );

    // Send email
    return await sendEmail({
      to: customer.email,
      subject: 'Welcome to Our Tattoo Studio',
      html: emailHtml,
      recipientId: customer.id,
      emailType: 'welcome_email',
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    Sentry.captureException(error);
    return { success: false, error };
  }
}

/**
 * Send a cancellation notice for an appointment
 */
export async function sendCancellationNotice(
  appointmentId: string,
  reason: string,
  refundable: boolean,
) {
  try {
    // Get appointment details with customer and artist info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
      },
    });

    if (!appointment || !appointment.customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Dynamically import the email template and render function
    const [{ default: CancellationNotice }, { render }] = await Promise.all([
      import('@/emails/CancellationNotice'),
      import('@react-email/render')
    ]);
    
    // Render email from React component
    const emailHtml = await render(
      CancellationNotice({
        customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        appointmentDate: appointment.startDate,
        appointmentTime: appointment.startDate.toLocaleTimeString(),
        appointmentType: appointment.title,
        studioName: process.env.STUDIO_NAME || 'Our Tattoo Studio',
        studioPhone: process.env.STUDIO_PHONE || '(555) 123-4567',
        reason,
        depositAmount: appointment.deposit || 0,
        isRefundable: refundable,
      }),
    );

    // Send email
    return await sendEmail({
      to: appointment.customer.email,
      subject: 'Your Tattoo Appointment Has Been Cancelled',
      html: emailHtml,
      recipientId: appointment.customer.id,
      emailType: 'cancellation_notice',
    });
  } catch (error) {
    console.error('Error sending cancellation notice:', error);
    Sentry.captureException(error);
    return { success: false, error };
  }
}

/**
 * Send a deposit reminder email
 */
export async function sendDepositReminder(appointmentId: string) {
  try {
    // Get appointment details with customer info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
      },
    });

    if (!appointment || !appointment.customer.email) {
      throw new Error(`Invalid appointment or missing customer email: ${appointmentId}`);
    }

    // Calculate due date (7 days before appointment or today if that's already passed)
    const calculatedDueDate = new Date(appointment.startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    const dueDate = calculatedDueDate < currentDate ? currentDate : calculatedDueDate;

    // Dynamically import the email template and render function
    const [{ default: DepositReminder }, { render }] = await Promise.all([
      import('@/emails/DepositReminder'),
      import('@react-email/render')
    ]);
    
    // Render email from React component
    const emailHtml = await render(
      DepositReminder({
        customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
        appointmentDate: appointment.startDate,
        appointmentTime: appointment.startDate.toLocaleTimeString(),
        appointmentType: appointment.title,
        studioName: process.env.STUDIO_NAME || 'Our Tattoo Studio',
        depositAmount: appointment.deposit || 0,
        paymentLink: `${process.env['WEBSITE_URL']}/payment/${appointment.id}`,
        dueDate,
      }),
    );

    // Send email
    return await sendEmail({
      to: appointment.customer.email,
      subject: 'Deposit Reminder for Your Tattoo Appointment',
      html: emailHtml,
      recipientId: appointment.customer.id,
      emailType: 'deposit_reminder',
    });
  } catch (error) {
    console.error('Error sending deposit reminder:', error);
    Sentry.captureException(error);
    return { success: false, error };
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
              case 'appointment_reminder': {
                // Extract appointment ID from action URL
                const appointmentId = notification.actionUrl?.split('/').pop();
                if (appointmentId) {
                  await sendAppointmentReminder(appointmentId);
                }
                break;
              }
              case 'welcome': {
                await sendWelcomeEmail(customer.id);
                break;
              }
              case 'deposit_reminder': {
                // Extract appointment ID from action URL
                const depositAppointmentId = notification.actionUrl?.split('/').pop();
                if (depositAppointmentId) {
                  await sendDepositReminder(depositAppointmentId);
                }
                break;
              }
              default:
                // Generic email for other types
                if (!notification.title || !notification.message) {
                  console.warn(
                    `Cannot send generic email: Missing title or message for notification ID: ${notification.id}`,
                  );
                  continue;
                }

                // For generic emails, we can just use a simple HTML string without React templates
                await sendEmail({
                  to: customer.email,
                  subject: notification.title,
                  html: `<div><p>Hello ${customer.firstName},</p><p>${notification.message}</p></div>`,
                  recipientId: customer.id,
                  emailType: notification.notificationType,
                });
            }
          }
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
          Sentry.captureException(error);

          // Update notification with error
          await prisma.notificationQueue.update({
            where: { id: notification.id },
            data: {
              isProcessed: true,
              processedAt: new Date(),
              errorMessage: error instanceof Error ? error.message : String(error),
            },
          });
        }
      }
    }

    return { success: true, processed: totalProcessed };
  } catch (error) {
    console.error('Error processing email queue:', error);
    Sentry.captureException(error);
    return { success: false, error };
  }
}

// Export all email service functions
export default {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendWelcomeEmail,
  sendCancellationNotice,
  sendDepositReminder,
  processEmailQueue,
};
