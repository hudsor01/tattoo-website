/**
 * Cal.com Email Integration
 * 
 * Handles email notifications for Cal.com booking events
 */

import { sendEmail } from '@/lib/email/email-resend';
import { render } from '@react-email/render';
import type { CalBookingPayload } from '@/types/cal-types';
import type { EmailRecipient } from '@/types/email-types';

// Import email templates
import AppointmentConfirmation from '@/emails/AppointmentConfirmation';
import AppointmentReminder from '@/emails/AppointmentReminder';
import CancellationNotice from '@/emails/CancellationNotice';

/**
 * Send booking confirmation email
 */
export async function sendCalBookingConfirmation(booking: CalBookingPayload) {
  const attendee = booking.attendees[0];
  const tattooData = extractTattooData(booking);
  
  try {
    // Render the email template
    const emailHtml = await render(
      AppointmentConfirmation({
        customerName: attendee.name,
        appointmentDate: new Date(booking.startTime),
        appointmentTime: new Date(booking.startTime).toLocaleTimeString(),
        artistName: booking.organizer.name,
        appointmentType: booking.title,
        studioName: process.env.STUDIO_NAME || 'Fernando Govea Tattoo',
        studioAddress: process.env.STUDIO_ADDRESS || 'Dallas/Fort Worth, TX',
        studioPhone: process.env.STUDIO_PHONE || '(555) 123-4567',
        depositAmount: booking.payment?.amount ? booking.payment.amount / 100 : 0,
        appointmentId: booking.id,
      }),
    );

    const emailRecipient: EmailRecipient = {
      email: attendee.email,
      name: attendee.name,
    };

    // Send the email
    return await sendEmail({
      to: emailRecipient,
      subject: `Appointment Confirmed: ${booking.title}`,
      html: emailHtml,
      text: getPlainTextVersion(booking, 'confirmation'),
    });
  } catch (error) {
    console.error('Error sending Cal.com booking confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send booking cancellation email
 */
export async function sendCalBookingCancellation(booking: CalBookingPayload) {
  const attendee = booking.attendees[0];
  
  try {
    // Render the email template
    const emailHtml = await render(
      CancellationNotice({
        customerName: attendee.name,
        appointmentDate: new Date(booking.startTime),
        appointmentTime: new Date(booking.startTime).toLocaleTimeString(),
        appointmentType: booking.title,
        studioName: process.env.STUDIO_NAME || 'Fernando Govea Tattoo',
        studioPhone: process.env.STUDIO_PHONE || '(555) 123-4567',
        reason: booking.cancellationReason || 'No reason provided',
        depositAmount: booking.payment?.amount ? booking.payment.amount / 100 : 0,
        isRefundable: booking.payment?.status === 'refunded',
      }),
    );

    const emailRecipient: EmailRecipient = {
      email: attendee.email,
      name: attendee.name,
    };

    // Send the email
    return await sendEmail({
      to: emailRecipient,
      subject: `Appointment Cancelled: ${booking.title}`,
      html: emailHtml,
      text: getPlainTextVersion(booking, 'cancellation'),
    });
  } catch (error) {
    console.error('Error sending Cal.com booking cancellation:', error);
    return { success: false, error };
  }
}

/**
 * Send booking reschedule email
 */
export async function sendCalBookingReschedule(
  booking: CalBookingPayload, 
  previousStartTime?: string
) {
  const attendee = booking.attendees[0];
  
  try {
    // Render a custom reschedule email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Rescheduled</h2>
        <p>Hello ${attendee.name},</p>
        <p>Your appointment has been rescheduled.</p>
        
        <h3>New Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()}</li>
          <li><strong>Service:</strong> ${booking.title}</li>
          <li><strong>Artist:</strong> ${booking.organizer.name}</li>
        </ul>
        
        ${previousStartTime ? `
        <p><strong>Previous time:</strong> ${new Date(previousStartTime).toLocaleString()}</p>
        ` : ''}
        
        ${booking.location ? `
        <p><strong>Location:</strong> ${booking.location}</p>
        ` : ''}
        
        ${booking.meetingUrl ? `
        <p><strong>Virtual meeting link:</strong> <a href="${booking.meetingUrl}">${booking.meetingUrl}</a></p>
        ` : ''}
        
        <p>If you have any questions, please contact us at ${process.env.STUDIO_PHONE || '(555) 123-4567'}.</p>
        
        <p>Thank you,<br>
        ${process.env.STUDIO_NAME || 'Fernando Govea Tattoo'}</p>
      </div>
    `;

    const emailRecipient: EmailRecipient = {
      email: attendee.email,
      name: attendee.name,
    };

    // Send the email
    return await sendEmail({
      to: emailRecipient,
      subject: `Appointment Rescheduled: ${booking.title}`,
      html: emailHtml,
      text: getPlainTextVersion(booking, 'reschedule'),
    });
  } catch (error) {
    console.error('Error sending Cal.com booking reschedule:', error);
    return { success: false, error };
  }
}

/**
 * Send artist notification for new booking
 */
export async function sendArtistNotification(booking: CalBookingPayload) {
  const attendee = booking.attendees[0];
  const tattooData = extractTattooData(booking);
  
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking: ${booking.title}</h2>
        
        <h3>Client Information:</h3>
        <ul>
          <li><strong>Name:</strong> ${attendee.name}</li>
          <li><strong>Email:</strong> ${attendee.email}</li>
          <li><strong>Phone:</strong> ${attendee.metadata?.phone || 'Not provided'}</li>
        </ul>
        
        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()}</li>
          <li><strong>Duration:</strong> ${getDuration(booking.startTime, booking.endTime)}</li>
        </ul>
        
        <h3>Tattoo Details:</h3>
        <ul>
          <li><strong>Type:</strong> ${tattooData.tattooType || 'Not specified'}</li>
          <li><strong>Size:</strong> ${tattooData.size || 'Not specified'}</li>
          <li><strong>Placement:</strong> ${tattooData.placement || 'Not specified'}</li>
          <li><strong>Description:</strong> ${tattooData.description || 'Not provided'}</li>
          ${tattooData.budget ? `<li><strong>Budget:</strong> ${tattooData.budget}</li>` : ''}
        </ul>
        
        ${booking.payment ? `
        <h3>Payment Information:</h3>
        <ul>
          <li><strong>Amount:</strong> $${booking.payment.amount / 100} ${booking.payment.currency}</li>
          <li><strong>Status:</strong> ${booking.payment.status}</li>
        </ul>
        ` : ''}
        
        ${booking.additionalNotes ? `
        <h3>Additional Notes:</h3>
        <p>${booking.additionalNotes}</p>
        ` : ''}
        
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin-dashboard/cal-bookings">View in Dashboard</a></p>
      </div>
    `;

    const artistEmail: EmailRecipient = {
      email: booking.organizer.email,
      name: booking.organizer.name,
    };

    // Send the email
    return await sendEmail({
      to: artistEmail,
      subject: `New Booking: ${attendee.name} - ${booking.title}`,
      html: emailHtml,
      text: getPlainTextVersion(booking, 'artist-notification'),
    });
  } catch (error) {
    console.error('Error sending artist notification:', error);
    return { success: false, error };
  }
}

/**
 * Extract tattoo-specific data from Cal.com booking
 */
function extractTattooData(booking: CalBookingPayload) {
  const customData: Record<string, any> = {};
  
  // Extract from custom inputs
  if (booking.customInputs) {
    booking.customInputs.forEach(input => {
      switch (input.label.toLowerCase()) {
        case 'tattoo type':
        case 'tattoo style':
          customData.tattooType = input.value;
          break;
        case 'size':
          customData.size = input.value;
          break;
        case 'placement':
        case 'body placement':
          customData.placement = input.value;
          break;
        case 'description':
        case 'design description':
          customData.description = input.value;
          break;
        case 'reference images':
        case 'reference urls':
          customData.referenceImages = input.value;
          break;
        case 'budget':
        case 'estimated budget':
          customData.budget = input.value;
          break;
      }
    });
  }
  
  // Extract from metadata
  if (booking.metadata) {
    Object.assign(customData, booking.metadata);
  }
  
  // Extract from additional notes
  if (booking.additionalNotes) {
    customData.notes = booking.additionalNotes;
  }
  
  return customData;
}

/**
 * Calculate duration between two times
 */
function getDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const minutes = Math.floor(durationMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
  }
  return `${minutes} minutes`;
}

/**
 * Generate plain text version of email
 */
function getPlainTextVersion(booking: CalBookingPayload, type: string): string {
  const attendee = booking.attendees[0];
  
  switch (type) {
    case 'confirmation':
      return `
        Appointment Confirmed
        
        Hello ${attendee.name},
        
        Your appointment has been confirmed for:
        Date: ${new Date(booking.startTime).toLocaleDateString()}
        Time: ${new Date(booking.startTime).toLocaleTimeString()}
        Service: ${booking.title}
        Artist: ${booking.organizer.name}
        
        Thank you,
        ${process.env.STUDIO_NAME || 'Fernando Govea Tattoo'}
      `;
      
    case 'cancellation':
      return `
        Appointment Cancelled
        
        Hello ${attendee.name},
        
        Your appointment has been cancelled:
        Date: ${new Date(booking.startTime).toLocaleDateString()}
        Time: ${new Date(booking.startTime).toLocaleTimeString()}
        Service: ${booking.title}
        
        Reason: ${booking.cancellationReason || 'No reason provided'}
        
        If you have questions, please contact us at ${process.env.STUDIO_PHONE || '(555) 123-4567'}.
        
        Thank you,
        ${process.env.STUDIO_NAME || 'Fernando Govea Tattoo'}
      `;
      
    case 'reschedule':
      return `
        Appointment Rescheduled
        
        Hello ${attendee.name},
        
        Your appointment has been rescheduled to:
        Date: ${new Date(booking.startTime).toLocaleDateString()}
        Time: ${new Date(booking.startTime).toLocaleTimeString()}
        Service: ${booking.title}
        Artist: ${booking.organizer.name}
        
        Thank you,
        ${process.env.STUDIO_NAME || 'Fernando Govea Tattoo'}
      `;
      
    case 'artist-notification':
      const tattooData = extractTattooData(booking);
      return `
        New Booking: ${booking.title}
        
        Client: ${attendee.name}
        Email: ${attendee.email}
        
        Date: ${new Date(booking.startTime).toLocaleDateString()}
        Time: ${new Date(booking.startTime).toLocaleTimeString()}
        
        Tattoo Details:
        - Type: ${tattooData.tattooType || 'Not specified'}
        - Size: ${tattooData.size || 'Not specified'}
        - Placement: ${tattooData.placement || 'Not specified'}
        - Description: ${tattooData.description || 'Not provided'}
        
        View in dashboard: ${process.env.NEXT_PUBLIC_SITE_URL}/admin-dashboard/cal-bookings
      `;
      
    default:
      return `${booking.title} - ${new Date(booking.startTime).toLocaleString()}`;
  }
}