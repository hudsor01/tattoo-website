import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { CalWebhookPayload, CalWebhookEvent } from '@/types/cal-types';
import crypto from 'crypto';
import { 
  sendCalBookingConfirmation, 
  sendCalBookingCancellation, 
  sendCalBookingReschedule,
  sendArtistNotification 
} from '@/lib/cal/email-integration';

// Webhook validation secret from Cal.com (set in environment variables)
const WEBHOOK_SECRET = process.env.CAL_WEBHOOK_SECRET;

// Schema for webhook payload validation
const CalWebhookSchema = z.object({
  event: z.string() as z.ZodType<CalWebhookEvent>,
  id: z.string(),
  timestamp: z.number(),
  payload: z.object({
    id: z.string(),
    uid: z.string(),
    eventTypeId: z.number(),
    title: z.string(),
    description: z.string().optional(),
    additionalNotes: z.string().optional(),
    customInputs: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number(), z.boolean()]),
      type: z.string(),
    })).optional(),
    startTime: z.string(),
    endTime: z.string(),
    attendees: z.array(z.object({
      email: z.string().email(),
      name: z.string(),
      timeZone: z.string(),
      locale: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    })),
    organizer: z.object({
      email: z.string().email(),
      name: z.string(),
      timeZone: z.string(),
      username: z.string(),
    }),
    status: z.string(),
    location: z.string().optional(),
    meetingUrl: z.string().optional(),
    payment: z.object({
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      paymentMethod: z.string().optional(),
      externalId: z.string().optional(),
    }).optional(),
    metadata: z.record(z.any()).optional(),
    cancellationReason: z.string().optional(),
    previousBookingId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

/**
 * Verify webhook signature from Cal.com
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('Cal.com webhook secret not configured');
    return true; // Allow in development
  }

  const hash = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  return hash === signature;
}

/**
 * Extract custom tattoo booking data from Cal.com payload
 */
function extractTattooData(payload: CalWebhookPayload['payload']) {
  const customData: Record<string, any> = {};
  
  // Extract from custom inputs
  if (payload.customInputs) {
    payload.customInputs.forEach(input => {
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
  if (payload.metadata) {
    Object.assign(customData, payload.metadata);
  }
  
  // Extract from additional notes
  if (payload.additionalNotes) {
    customData.notes = payload.additionalNotes;
  }
  
  return customData;
}

/**
 * Handle different webhook events
 */
async function handleWebhookEvent(event: CalWebhookPayload) {
  const { payload } = event;
  const attendee = payload.attendees[0]; // Primary attendee
  const tattooData = extractTattooData(payload);
  
  // Log the event for monitoring
  console.log(`Cal.com webhook event: ${event.event}`, {
    bookingId: payload.id,
    uid: payload.uid,
    client: attendee.name,
    email: attendee.email,
    startTime: payload.startTime,
    ...tattooData
  });
  
  switch (event.event) {
    case 'booking.created':
      console.log('New booking created:', {
        clientName: attendee.name,
        clientEmail: attendee.email,
        date: new Date(payload.startTime).toLocaleDateString(),
        time: new Date(payload.startTime).toLocaleTimeString(),
        ...tattooData,
      });
      
      try {
        // Send confirmation email to user
        await sendCalBookingConfirmation(payload);
        console.log('Booking confirmation email sent successfully');
        
        // Send notification to artist
        await sendArtistNotification(payload);
        console.log('Artist notification email sent successfully');
      } catch (error) {
        console.error('Error sending booking confirmation emails:', error);
      }
      
      // TODO: Store booking in database once Prisma is configured
      break;
      
    case 'booking.cancelled':
      console.log('Booking cancelled:', {
        bookingId: payload.id,
        reason: payload.cancellationReason || 'No reason provided',
      });
      
      try {
        await sendCalBookingCancellation(payload);
        console.log('Cancellation email sent successfully');
      } catch (error) {
        console.error('Error sending cancellation email:', error);
      }
      
      // TODO: Update booking status in database
      break;
      
    case 'booking.rescheduled':
      console.log('Booking rescheduled:', {
        bookingId: payload.id,
        previousBookingId: payload.previousBookingId,
        newDate: new Date(payload.startTime).toLocaleDateString(),
        newTime: new Date(payload.startTime).toLocaleTimeString(),
      });
      
      try {
        await sendCalBookingReschedule(payload);
        console.log('Reschedule email sent successfully');
      } catch (error) {
        console.error('Error sending reschedule email:', error);
      }
      
      // TODO: Update booking time in database
      break;
      
    case 'booking.updated':
      console.log('Booking updated:', {
        bookingId: payload.id,
        updates: tattooData,
      });
      
      // TODO: Update booking details in database
      break;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('cal-signature') || '';
    
    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      return new Response('Invalid signature', { status: 401 });
    }
    
    // Parse and validate webhook payload
    const payload = JSON.parse(rawBody);
    const validatedData = CalWebhookSchema.parse(payload) as CalWebhookPayload;
    
    // Handle the webhook event
    await handleWebhookEvent(validatedData);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Cal.com webhook error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(`Invalid payload: ${error.message}`, { status: 400 });
    }
    
    return new Response('Internal server error', { status: 500 });
  }
}

// Optionally handle GET requests to verify webhook endpoint
export async function GET() {
  return new Response('Cal.com webhook endpoint is active', { status: 200 });
}