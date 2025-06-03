/**
 * Cal.com Webhook Handler
 * 
 * Purpose: Process Cal.com webhook events and trigger real-time dashboard updates
 * Assumptions: Webhook signature verification, database available
 * Dependencies: Cal.com API client, analytics service, real-time publisher
 * 
 * Trade-offs:
 * - Immediate processing vs queued processing: Responsiveness vs reliability
 * - Comprehensive error handling vs performance: Robust handling vs speed
 * - Real-time updates vs batch processing: User experience vs efficiency
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature } from '@/lib/cal/api';
import { calAnalyticsService } from '@/lib/analytics/cal-analytics-service';
import { db } from '@/lib/db';
import { z } from 'zod';
import { logger } from "@/lib/logger";

const webhookEventSchema = z.object({
  triggerEvent: z.enum([
    'BOOKING_CREATED',
    'BOOKING_CONFIRMED', 
    'BOOKING_CANCELLED',
    'BOOKING_RESCHEDULED',
    'BOOKING_REJECTED',
    'PAYMENT_COMPLETED',
    'MEETING_ENDED'
  ]),
  createdAt: z.string(),
  payload: z.object({
    id: z.number(),
    uid: z.string(),
    title: z.string(),
    description: z.string().optional(),
    start: z.string(),
    end: z.string(),
    status: z.string(),
    attendees: z.array(z.object({
      id: z.number(),
      email: z.string(),
      name: z.string(),
      timeZone: z.string().optional(),
    })),
    eventType: z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      length: z.number(),
      price: z.number().optional(),
      currency: z.string().optional(),
    }),
    payment: z.array(z.object({
      id: z.number(),
      success: z.boolean(),
      amount: z.number().optional(),
      currency: z.string().optional(),
    })).optional(),
    cancellationReason: z.string().optional(),
    rescheduledFromUid: z.string().optional(),
  }),
});

type WebhookEvent = z.infer<typeof webhookEventSchema>;

// Webhook Response Helper
function webhookResponse(status: number, message: string, data?: unknown) {
  return NextResponse.json(
    { success: status < 400, message, data },
    { status }
  );
}

// Main Webhook Handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get request body and headers
    const body = await request.text();
    const headersList = headers();
    const signature = (await headersList).get('cal-webhook-signature');
    const userAgent = (await headersList).get('user-agent');
    const ipAddress = (await headersList).get('x-forwarded-for') ?? 
                     (await headersList).get('x-real-ip') ?? 
                     'unknown';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      void logger.warn('Invalid webhook signature received', {
        signature,
        ipAddress,
        userAgent,
      });
      
      return webhookResponse(401, 'Invalid webhook signature');
    }

    // Parse and validate webhook event
    let event: WebhookEvent;
    try {
      const rawEvent = JSON.parse(body);
      event = webhookEventSchema.parse(rawEvent);
    } catch (error) {
      void logger.error('Invalid webhook payload:', error);
      return webhookResponse(400, 'Invalid webhook payload');
    }

    // Log webhook receipt
    void logger.info('Webhook received:', {
      triggerEvent: event.triggerEvent,
      bookingId: event.payload.id,
      bookingUid: event.payload.uid,
      timestamp: event.createdAt,
    });

    // Store webhook event for processing
    const webhookRecord = await db.calWebhookEvent.create({
      data: {
        triggerEvent: event.triggerEvent,
        calBookingId: event.payload.id,
        calBookingUid: event.payload.uid,
        payload: event.payload as unknown,
        signature,
        ipAddress,
        userAgent,
        receivedAt: new Date(),
      },
    });

    // Process webhook event
    try {
      await processWebhookEvent(event);
      
      // Mark as processed
      await db.calWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

    } catch (processingError) {
      void logger.error('Error processing webhook:', processingError);
      
      // Update webhook record with error
      await db.calWebhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processingError: processingError instanceof Error ? processingError.message : 'Unknown error',
          retryCount: { increment: 1 },
        },
      });

      // Don't return error to Cal.com to avoid retries for our internal issues
      // Instead, we'll handle retries asynchronously
    }

    const processingTime = Date.now() - startTime;
    void logger.info(`Webhook processed in ${processingTime}ms`);

    return webhookResponse(200, 'Webhook processed successfully');

  } catch (error) {
    void logger.error('Webhook handler error:', error);
    return webhookResponse(500, 'Internal server error');
  }
}

// Process Webhook Event
async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  const { triggerEvent, payload } = event;

  switch (triggerEvent) {
    case 'BOOKING_CREATED':
      await handleBookingCreated(payload);
      break;
      
    case 'BOOKING_CONFIRMED':
      await handleBookingConfirmed(payload);
      break;
      
    case 'BOOKING_CANCELLED':
      await handleBookingCancelled(payload);
      break;
      
    case 'BOOKING_RESCHEDULED':
      await handleBookingRescheduled(payload);
      break;
      
    case 'BOOKING_REJECTED':
      await handleBookingRejected(payload);
      break;
      
    case 'PAYMENT_COMPLETED':
      await handlePaymentCompleted(payload);
      break;
      
    case 'MEETING_ENDED':
      await handleMeetingEnded(payload);
      break;
      
    default:
      void logger.warn('Unhandled webhook event type:', triggerEvent);
  }
}

// Event Handlers
async function handleBookingCreated(payload: WebhookEvent['payload']): Promise<void> {
  // Sync booking data
  await calAnalyticsService.syncCalBookings({ 
    forceFullSync: false, 
    batchSize: 100, 
    maxRetries: 3 
  });
  
  // Publish real-time update
  await realTimePublisher.publishNewBooking({
    id: payload.uid,
    title: payload.title,
    attendee: {
      name: payload.attendees[0]?.name ?? '',
      email: payload.attendees[0]?.email ?? '',
    },
    startTime: payload.start,
    eventType: payload.eventType.title,
    status: payload.status,
  });

  // Update today's metrics
  await calAnalyticsService.publishMetricsUpdate();

  // Send notifications (if configured)
  await sendNewBookingNotifications(payload);
}

async function handleBookingConfirmed(payload: WebhookEvent['payload']): Promise<void> {
  // Update booking status in database
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  // Publish real-time update
  await realTimePublisher.publishBookingUpdate({
    type: 'booking-confirmed',
    booking: {
      id: payload.uid,
      title: payload.title,
      attendee: {
        name: payload.attendees[0]?.name ?? '',
        email: payload.attendees[0]?.email ?? '',
      },
      startTime: payload.start,
      eventType: payload.eventType.title,
      status: 'confirmed',
    },
    timestamp: new Date().toISOString(),
  });

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

async function handleBookingCancelled(payload: WebhookEvent['payload']): Promise<void> {
  // Update booking status in database
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      internalNotes: payload.cancellationReason ? `Cancelled: ${payload.cancellationReason}` : undefined,
    },
  });

  // Publish real-time update
  await realTimePublisher.publishBookingUpdate({
    type: 'booking-cancelled',
    booking: {
      id: payload.uid,
      title: payload.title,
      attendee: {
        name: payload.attendees[0]?.name ?? '',
        email: payload.attendees[0]?.email ?? '',
      },
      startTime: payload.start,
      eventType: payload.eventType.title,
      status: 'cancelled',
    },
    timestamp: new Date().toISOString(),
  });

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

async function handleBookingRescheduled(payload: WebhookEvent['payload']): Promise<void> {
  // Update booking in database
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      startTime: new Date(payload.start),
      endTime: new Date(payload.end),
      rescheduledAt: new Date(),
      internalNotes: payload.rescheduledFromUid ? 
        `Rescheduled from booking ${payload.rescheduledFromUid}` : 
        'Rescheduled',
    },
  });

  // Publish real-time update
  await realTimePublisher.publishBookingUpdate({
    type: 'booking-rescheduled',
    booking: {
      id: payload.uid,
      title: payload.title,
      attendee: {
        name: payload.attendees[0]?.name ?? '',
        email: payload.attendees[0]?.email ?? '',
      },
      startTime: payload.start,
      eventType: payload.eventType.title,
      status: payload.status,
    },
    timestamp: new Date().toISOString(),
  });

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

async function handleBookingRejected(payload: WebhookEvent['payload']): Promise<void> {
  // Update booking status in database
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      status: 'REJECTED',
    },
  });

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

async function handlePaymentCompleted(payload: WebhookEvent['payload']): Promise<void> {
  // Update payment status in database
  const paymentInfo = payload.payment?.[0];
  
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      isPaid: true,
      paymentStatus: 'COMPLETED',
      paymentAmount: paymentInfo?.amount,
      paymentCurrency: paymentInfo?.currency,
      paymentId: paymentInfo?.id.toString(),
    },
  });

  // Publish revenue update
  if (paymentInfo?.amount) {
    await realTimePublisher.publishRevenueUpdate({
      type: 'revenue-update',
      amount: paymentInfo.amount,
      currency: paymentInfo.currency ?? 'USD',
      totalToday: 0, // Will be calculated in the analytics service
      timestamp: new Date().toISOString(),
    });
  }

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

async function handleMeetingEnded(payload: WebhookEvent['payload']): Promise<void> {
  // Update booking status in database
  await db.calBooking.updateMany({
    where: { calBookingUid: payload.uid },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Update metrics
  await calAnalyticsService.publishMetricsUpdate();
}

// Notification Helper
async function sendNewBookingNotifications(payload: WebhookEvent['payload']): Promise<void> {
  try {
    // Send email notification to admin (if configured)
    if (process.env['ADMIN_EMAIL']) {
      await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env['ADMIN_EMAIL'],
          type: 'new_booking',
          data: {
            customerName: payload.attendees[0]?.name,
            customerEmail: payload.attendees[0]?.email,
            serviceName: payload.eventType.title,
            startTime: payload.start,
            bookingUid: payload.uid,
          },
        }),
      });
    }

    // Send SMS notification (if configured)
    if (process.env['ADMIN_PHONE']) {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env['ADMIN_PHONE'],
          message: `New booking: ${payload.attendees[0]?.name} for ${payload.eventType.title} on ${new Date(payload.start).toLocaleDateString()}`,
        }),
      });
    }
  } catch (error) {
    void logger.error('Error sending notifications:', error);
    // Don't throw - notifications are non-critical
  }
}

// Health Check Endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    webhookEndpoint: '/api/webhooks/cal',
  });
}
