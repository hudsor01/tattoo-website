/**
 * Cal.com webhook handler
 * 
 * This endpoint receives webhooks from Cal.com when booking events occur.
 * It processes these events and updates our database accordingly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalWebhookSchema } from '@/types/booking-types';
import type { CalWebhookPayload } from '@/types/booking-types';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

/**
 * Verify the webhook signature from Cal.com
 */
function verifySignature(req: NextRequest): boolean {
  const calSignature = req.headers.get('x-cal-signature-256');
  
  if (!calSignature || !process.env['CAL_WEBHOOK_SECRET']) {
    return false;
  }
  
  // In a real implementation, verify the HMAC signature here
  // This would use crypto.createHmac to verify the signature
  // For now, we'll return true if the secret is configured
  
  return Boolean(process.env['CAL_WEBHOOK_SECRET']);
}

/**
 * Process a booking creation event
 */
async function handleBookingCreated(payload: CalWebhookPayload['payload']) {
  try {
    // Check if booking already exists in our system
    const existingBooking = await prisma.booking.findFirst({
      where: {
        calBookingUid: payload.uid,
      },
    });

    if (existingBooking) {
      logger.info(`Booking ${payload.uid} already exists, updating...`);
      
      // Update existing booking
      await prisma.booking.update({
        where: {
          id: existingBooking.id,
        },
        data: {
          calStatus: payload.status,
          updatedAt: new Date(),
        },
      });
      
      return { success: true, action: 'updated' };
    }

    // Create new booking record
    if (payload.attendees && payload.attendees.length > 0) {
      const attendee = payload.attendees[0];
      const customInputs = payload.customInputs || [];
      
      await prisma.booking.create({
        data: {
          name: attendee?.name || 'Unknown',
          email: attendee?.email || 'unknown@example.com',
          phone: '', // Default empty phone
          paymentMethod: 'unspecified', // Default payment method
          calStatus: payload.status,
          calBookingUid: payload.uid,
          calEventTypeId: typeof payload.eventType === 'object' ? payload.eventType.id : payload.eventType,
          tattooType: (customInputs as Array<{label: string, value: string}>).find(i => i.label === 'Tattoo Type')?.value || 'Not specified',
          size: (customInputs as Array<{label: string, value: string}>).find(i => i.label === 'Size')?.value || 'Not specified',
          placement: (customInputs as Array<{label: string, value: string}>).find(i => i.label === 'Placement')?.value || 'Not specified',
          description: payload.description || payload.additionalNotes || 'Cal.com booking',
          preferredDate: payload.startTime,
          preferredTime: new Date(payload.startTime).toLocaleTimeString(),
          source: 'cal.com',
        },
      });
      
      return { success: true, action: 'created' };
    }
    
    return { success: false, error: 'No attendees in payload' };
  } catch (error) {
    logger.error('Error handling booking created event:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Process a booking update event
 */
async function handleBookingUpdated(payload: CalWebhookPayload['payload']) {
  try {
    // Find the booking in our system
    const booking = await prisma.booking.findFirst({
      where: {
        calBookingUid: payload.uid,
      },
    });

    if (!booking) {
      // If booking doesn't exist, create it
      return handleBookingCreated(payload);
    }

    // Update the booking
    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        calStatus: payload.status,
        updatedAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Error handling booking updated event:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Process a booking cancellation event
 */
async function handleBookingCancelled(payload: CalWebhookPayload['payload']) {
  try {
    // Find the booking in our system
    const booking = await prisma.booking.findFirst({
      where: {
        calBookingUid: payload.uid,
      },
    });

    if (!booking) {
      logger.warn(`Booking ${payload.uid} not found for cancellation`);
      return { success: false, error: 'Booking not found' };
    }

    // Update the booking
    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        calStatus: 'cancelled',
        updatedAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Error handling booking cancelled event:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Process a booking reschedule event
 */
async function handleBookingRescheduled(payload: CalWebhookPayload['payload']) {
  try {
    // Find the booking in our system
    const booking = await prisma.booking.findFirst({
      where: {
        calBookingUid: payload.uid,
      },
    });

    if (!booking) {
      logger.warn(`Booking ${payload.uid} not found for rescheduling`);
      return { success: false, error: 'Booking not found' };
    }

    // Update the booking
    await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        preferredDate: payload.startTime,
        preferredTime: new Date(payload.startTime).toLocaleTimeString(),
        calStatus: payload.status,
        updatedAt: new Date(),
      },
    });
    
    return { success: true };
  } catch (error) {
    logger.error('Error handling booking rescheduled event:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET handler for webhook verification
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cal.com webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

/**
 * Main webhook handler
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw request body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Handle Cal.com ping test
    if (body.ping || body.test || body.triggerEvent === 'PING') {
      logger.info('Cal.com webhook ping test received');
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook endpoint is working correctly',
        received: body
      });
    }
    
    // Verify webhook signature for real events
    if (!verifySignature(req)) {
      logger.warn('Invalid Cal.com webhook signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }
    
    // Validate webhook payload for real booking events
    try {
      CalWebhookSchema.parse(body);
    } catch (error) {
      logger.error('Invalid Cal.com webhook payload:', error);
      logger.error('Received body:', JSON.stringify(body, null, 2));
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    
    const { event, payload } = body as CalWebhookPayload;
    
    // Process based on event type
    let result;
    
    switch (event) {
      case 'booking.created':
        result = await handleBookingCreated(payload);
        break;
      case 'booking.updated':
        result = await handleBookingUpdated(payload);
        break;
      case 'booking.cancelled':
        result = await handleBookingCancelled(payload);
        break;
      case 'booking.rescheduled':
        result = await handleBookingRescheduled(payload);
        break;
      default:
        logger.warn(`Unknown Cal.com webhook event: ${event}`);
        return NextResponse.json({ success: false, error: 'Unknown event type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    logger.error('Error processing Cal.com webhook:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}