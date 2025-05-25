/**
 * Cal.com Email Integration
 * This module handles sending automated emails for Cal.com booking events
 * 
 * Email templates are currently disabled
 */

import type { CalBookingPayload } from '@/types/booking-types';

/**
 * Send appointment confirmation email
 * Currently disabled - email templates removed
 */
export async function sendAppointmentConfirmationEmail(booking: CalBookingPayload): Promise<void> {
  console.info('Email templates disabled - would send confirmation for booking:', booking.id);
  
}

/**
 * Send appointment cancellation email
 * Currently disabled - email templates removed
 */
export async function sendAppointmentCancellationEmail(booking: CalBookingPayload): Promise<void> {
  console.info('Email templates disabled - would send cancellation for booking:', booking.id);
  
}

/**
 * Send booking notification to studio
 * Currently disabled - email templates removed
 */
export async function sendBookingNotificationToStudio(booking: CalBookingPayload): Promise<string> {
  console.info('Email templates disabled - would send studio notification for booking:', booking.id);
  return 'Email templates disabled';
}