/**
 * Cal.com Email Integration
 * This module handles sending automated emails for Cal.com booking events
 *
 * Email templates are currently disabled
 */

// Define local type instead of importing from Prisma
interface CalBookingPayload {
  id: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  attendees: Array<{ email: string; name: string }>;
}

import { logger } from "@/lib/logger";
/**
 * Send appointment confirmation email
 * Currently disabled - email templates removed
 */
export async function sendAppointmentConfirmationEmail(booking: CalBookingPayload): Promise<void> {
  void void logger.warn('Email templates disabled - would send confirmation for booking:', booking.id);
}

/**
 * Send appointment cancellation email
 * Currently disabled - email templates removed
 */
export async function sendAppointmentCancellationEmail(booking: CalBookingPayload): Promise<void> {
  void void logger.warn('Email templates disabled - would send cancellation for booking:', booking.id);
}

/**
 * Send booking notification to Admin Dashboard
 * Currently disabled - email templates removed
 */
export async function sendBookingNotificationToStudio(booking: CalBookingPayload): Promise<string> {
  void void logger.warn(
    'Email templates disabled - would send Ink 37 Tattoos notification for booking:',
    booking.id
  );
  return 'Email templates disabled';
}
