/**
 * Cal.com test connection endpoint
 * 
 * This endpoint is used to test the Cal.com API connection.
 * It verifies that the necessary environment variables are set and 
 * that API calls can be made successfully.
 */

import { NextResponse } from 'next/server';
import { isCalConfigured } from '@/lib/cal/config';
import { getCalEventTypes } from '@/lib/cal/api';

export async function GET() {
  try {
    // Check if Cal.com is configured
    const configured = isCalConfigured();
    
    if (!configured) {
      return NextResponse.json({
        success: false,
        message: 'Cal.com API is not properly configured',
        status: 'not_configured',
        details: {
          apiKey: Boolean(process.env['CAL_API_KEY']),
          username: Boolean(process.env['NEXT_PUBLIC_CAL_USERNAME']),
          webhookSecret: Boolean(process.env['CAL_WEBHOOK_SECRET']),
        },
      });
    }
    
    // Try to call the Cal.com API
    try {
      // Attempt to fetch event types as a test
      const eventTypes = await getCalEventTypes();
      
      return NextResponse.json({
        success: true,
        message: 'Cal.com API connection successful',
        status: 'connected',
        details: {
          eventTypeCount: eventTypes.length,
          username: process.env['NEXT_PUBLIC_CAL_USERNAME'],
          hasWebhookSecret: Boolean(process.env['CAL_WEBHOOK_SECRET']),
        },
      });
    } catch (apiError: any) {
      // API call failed
      return NextResponse.json({
        success: false,
        message: `Cal.com API connection failed: ${apiError.message}`,
        status: 'api_error',
        details: {
          error: apiError.message,
        },
      }, { status: 500 });
    }
  } catch (error: any) {
    // Something else went wrong
    return NextResponse.json({
      success: false,
      message: `Error testing Cal.com connection: ${error.message}`,
      status: 'error',
      details: {
        error: error.message,
      },
    }, { status: 500 });
  }
}