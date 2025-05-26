/**
 * Production Cal.com webhook handler
 *
 * Handles real-time booking events from Cal.com with proper security,
 * data validation, and database synchronization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db/prisma';
import { CalBookingStatus } from '@/types/enum-types';

interface CalWebhookPayload {
  triggerEvent: string;
  event?: string;
  payload?: {
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    attendees: Array<{
      email: string;
      name: string;
      phone?: string;
    }>;
    organizer: {
      email: string;
      name: string;
    };
    status: string;
    eventType: {
      id: number;
      title: string;
      slug: string;
    };
    metadata?: Record<string, string | number | boolean | null>;
    rescheduleUid?: string;
    cancelReason?: string;
  };
}

/**
 * Verify the webhook signature from Cal.com using HMAC-SHA256
 */
function verifySignature(req: NextRequest, body: string): boolean {
  const calSignature = req.headers.get('x-cal-signature-256');
  const webhookSecret = process.env.CAL_WEBHOOK_SECRET;

  if (!calSignature || !webhookSecret) {
    void logger.warn('Missing Cal.com webhook signature or secret');
    return false;
  }

  try {
    // Remove 'sha256=' prefix if present
    const signature = calSignature.replace('sha256=', '');

    // Create HMAC hash
    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body, 'utf8')
      .digest('hex');

    // Compare signatures securely
    return signature === expectedSignature;
  } catch (error) {
    void logger.error('Error verifying Cal.com webhook signature:', error);
    return false;
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cal.com webhook endpoint is active',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}

/**
 * Production webhook handler for Cal.com events
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify webhook signature for security
    if (!verifySignature(req, rawBody)) {
      void logger.warn('Invalid Cal.com webhook signature');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload: CalWebhookPayload = JSON.parse(rawBody);

    // Handle Cal.com ping test
    if (payload.triggerEvent === 'PING' || payload.event === 'ping') {
      void logger.info('Cal.com webhook ping test received');
      return NextResponse.json({
        success: true,
        message: 'Webhook endpoint is working',
      });
    }

    // Process booking events
    if (payload.payload && payload.triggerEvent) {
      await processBookingEvent(payload);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: payload.triggerEvent,
      uid: payload.payload?.uid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    void logger.error('Error processing Cal.com webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process booking events and sync with database
 */
async function processBookingEvent(payload: CalWebhookPayload) {
  if (!payload.payload) return;

  const { payload: booking } = payload;
  const eventType = payload.triggerEvent;

  try {
    // Find or create customer
    const attendee = booking.attendees[0];
    if (!attendee) {
      void logger.warn('No attendee found in booking payload');
      return;
    }

    const customer = await prisma.customer.upsert({
      where: { email: attendee.email },
      update: {
        firstName: attendee.name.split(' ')[0] ?? attendee.name,
        lastName: attendee.name.split(' ').slice(1).join(' ') ?? '',
        phone: attendee.phone ?? null,
        updatedAt: new Date(),
      },
      create: {
        firstName: attendee.name.split(' ')[0] ?? attendee.name,
        lastName: attendee.name.split(' ').slice(1).join(' ') ?? '',
        email: attendee.email,
        phone: attendee.phone ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Map Cal.com status to our enum
    const status = mapCalStatusToEnum(booking.status);

    // Handle different event types
    switch (eventType) {
      case 'BOOKING_CREATED':
        await createBooking(booking, customer.id, status);
        break;

      case 'BOOKING_RESCHEDULED':
        await rescheduleBooking(booking, status);
        break;

      case 'BOOKING_CANCELLED':
        await cancelBooking(booking, booking.cancelReason);
        break;

      case 'BOOKING_CONFIRMED':
        await confirmBooking(booking);
        break;

      default:
        void logger.info(`Unhandled Cal.com event: ${eventType}`);
    }

    void logger.info(`Successfully processed ${eventType} for booking ${booking.uid}`);
  } catch (error) {
    void logger.error(`Error processing booking event ${eventType}:`, error);
    throw error;
  }
}

/**
 * Create a new booking in the database
 */
async function createBooking(
  booking: CalWebhookPayload['payload'],
  customerId: string,
  status: CalBookingStatus
) {
  if (!booking) return;

  await prisma.booking.create({
    data: {
      calBookingUid: booking.uid,
      customerId,
      name: booking.attendees?.[0]?.name ?? 'Unknown',
      email: booking.attendees?.[0]?.email ?? 'unknown@example.com',
      phone: '', // No phone number provided
      tattooType: 'Consultation', // Default for Cal.com bookings
      size: 'Medium',
      placement: 'TBD',
      description: booking.title ?? 'Cal.com booking',
      preferredDate: new Date(booking.startTime),
      preferredTime: new Date(booking.startTime).toLocaleTimeString(),
      paymentMethod: 'Unspecified',
      calStatus: status,
      calEventTypeId: booking.eventType?.id,
      calMetadata: booking.metadata ?? {},
      updatedAt: new Date(),
    },
  });
}

/**
 * Reschedule an existing booking
 */
async function rescheduleBooking(booking: CalWebhookPayload['payload'], status: CalBookingStatus) {
  if (!booking) return;

  await prisma.booking.updateMany({
    where: { calBookingUid: booking.rescheduleUid ?? booking.uid },
    data: {
      preferredDate: new Date(booking.startTime),
      preferredTime: new Date(booking.startTime).toLocaleTimeString(),
      calStatus: status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Cancel a booking
 */
async function cancelBooking(booking: CalWebhookPayload['payload'], cancelReason?: string) {
  if (!booking) return;

  await prisma.booking.updateMany({
    where: { calBookingUid: booking.uid },
    data: {
      calStatus: CalBookingStatus.CANCELLED,
      ...(cancelReason && { notes: cancelReason }),
      updatedAt: new Date(),
    },
  });
}

/**
 * Confirm a booking
 */
async function confirmBooking(booking: CalWebhookPayload['payload']) {
  if (!booking) return;

  await prisma.booking.updateMany({
    where: { calBookingUid: booking.uid },
    data: {
      calStatus: CalBookingStatus.CONFIRMED,
      updatedAt: new Date(),
    },
  });
}

/**
 * Map Cal.com booking status to our enum
 */
function mapCalStatusToEnum(calStatus: string): CalBookingStatus {
  switch (calStatus.toLowerCase()) {
    case 'accepted':
    case 'confirmed':
      return CalBookingStatus.CONFIRMED;
    case 'pending':
      return CalBookingStatus.PENDING;
    case 'cancelled':
      return CalBookingStatus.CANCELLED;
    case 'rejected':
      return CalBookingStatus.CANCELLED;
    default:
      return CalBookingStatus.PENDING;
  }
}
