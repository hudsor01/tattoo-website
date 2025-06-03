/**
 * Cal.com Health Check API Endpoint
 * 
 * Purpose: Verify Cal.com API connectivity and service health
 * Assumptions: Cal.com API key configured
 * Dependencies: Cal.com API client
 * 
 * Trade-offs:
 * - Public vs authenticated endpoint: Accessibility vs security
 * - Detailed vs basic health info: Debugging vs information disclosure
 * - Caching vs real-time: Performance vs accuracy
 */

import { NextResponse } from 'next/server';
import { calApi } from '@/lib/cal/api';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test Cal.com API connectivity
    const healthCheck = await calApi.healthCheck();
    const responseTime = Date.now() - startTime;
    
    // Test basic API functionality
    let eventTypesAccessible = false;
    try {
      await calApi.getEventTypes();
      eventTypesAccessible = true;
    } catch {
      eventTypesAccessible = false;
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        calApi: {
          status: healthCheck.status,
          responseTime,
        },
        eventTypes: {
          status: eventTypesAccessible ? 'ok' : 'error',
        },
        webhook: {
          status: 'ok',
          endpoint: '/api/webhooks/cal',
        },
      },
      environment: {
        hasApiKey: !!process.env.CAL_API_KEY,
        hasClientId: !!process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID,
        hasWebhookSecret: !!process.env.CAL_WEBHOOK_SECRET,
        apiUrl: process.env.CAL_API_URL ?? 'https://api.cal.com/v2',
      },
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          calApi: {
            status: 'error',
            responseTime,
          },
          eventTypes: {
            status: 'error',
          },
          webhook: {
            status: 'unknown',
            endpoint: '/api/webhooks/cal',
          },
        },
        environment: {
          hasApiKey: !!process.env.CAL_API_KEY,
          hasClientId: !!process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID,
          hasWebhookSecret: !!process.env.CAL_WEBHOOK_SECRET,
          apiUrl: process.env.CAL_API_URL ?? 'https://api.cal.com/v2',
        },
      },
      { status: 503 }
    );
  }
}