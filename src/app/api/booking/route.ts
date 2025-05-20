import { NextRequest, NextResponse } from 'next/server';
import { createBooking, processCalBooking } from '@/lib/services/booking';
import { apiRoute, handleApiError } from '@/lib/validations/validation-api-utils';
import { bookingBaseSchema } from '@/types/booking-types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Extended booking schema for API validation
const apiBookingSchema = bookingBaseSchema.extend({
  // Add API-specific validation requirements
  paymentMethod: z.enum(['cashapp', 'venmo', 'paypal', 'card', 'unspecified']).optional(),
  referenceImages: z.array(z.string()).optional(),
  calBookingUid: z.string().optional(),
  calEventId: z.string().optional(),
  source: z.string().optional().default('website'),
});

/**
 * Booking API route handler
 */
export const POST = apiRoute({
  POST: {
    bodySchema: apiBookingSchema,
    handler: async (body) => {
      try {
        // Determine booking source
        const isCalBooking = !!body.calBookingUid;
        const source = isCalBooking ? 'cal' : 'website';
        
        // Prepare booking data
        const bookingData = {
          name: body.name,
          email: body.email,
          phone: body.phone,
          tattooType: body.tattooType,
          size: body.size,
          placement: body.placement,
          description: body.description,
          referenceImages: body.referenceImages || [],
          preferredDate: body.preferredDate,
          preferredTime: body.preferredTime,
          depositPaid: false,
          status: 'pending',
          source,
          // Cal.com integration fields, if available
          calBookingUid: body.calBookingUid,
          calEventId: body.calEventId,
          depositAmount: 0,
          totalPrice: 0, // Will be determined by artist later
        };
        
        // Create booking using the service
        const booking = await createBooking(bookingData);
        
        // Return success response
        return NextResponse.json(
          {
            success: true,
            message: 'Booking request received successfully',
            bookingId: booking.id,
          },
          { status: 201 }
        );
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
});

/**
 * GET endpoint to retrieve booking information
 * For client-side usage (no sensitive information)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const calTest = url.searchParams.get('calTest') === 'true';
    
    // If calTest is true, test the Cal.com configuration
    if (calTest) {
      const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME;
      const calApiKey = process.env.CAL_API_KEY;
      
      return NextResponse.json({
        calConfigured: !!calUsername && !!calApiKey,
        calUsername: calUsername || null,
        message: !calUsername 
          ? 'Cal.com username not configured' 
          : !calApiKey 
            ? 'Cal.com API key not configured' 
            : 'Cal.com appears to be properly configured',
      });
    }
    
    // If no ID provided, return booking page settings
    if (!id) {
      return NextResponse.json({
        calUsername: process.env.NEXT_PUBLIC_CAL_USERNAME,
        tattooServices: ['Traditional', 'Japanese', 'Realism', 'Blackwork', 'Cover-ups'],
        depositAmount: 50,
        contactEmail: 'ink37tattoos@gmail.com',
        bookingEnabled: true,
      });
    }
    
    // For specific booking info (client-side safe data only)
    // Note: Full booking details should be retrieved from a protected admin route
    return NextResponse.json({
      message: 'Use the admin API to retrieve full booking details',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handle Cal.com webhook
 */
export async function PUT(request: NextRequest) {
  try {
    const calWebhookSecret = process.env.CAL_WEBHOOK_SECRET;
    const signature = request.headers.get('X-Cal-Signature-256');
    
    // Validate webhook signature if secret is configured
    if (calWebhookSecret && !signature) {
      return NextResponse.json(
        { error: 'Missing Cal.com webhook signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook payload
    const payload = await request.json();
    
    if (!payload || !payload.event || !payload.payload) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }
    
    // Process the booking data from Cal.com
    const result = await processCalBooking(payload.payload);
    
    return NextResponse.json({
      success: true,
      message: 'Cal.com booking processed successfully',
      bookingId: result.id,
    });
  } catch (error) {
    console.error('Error processing Cal.com webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process Cal.com webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}