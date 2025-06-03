/**
 * Booking Completed Analytics Endpoint
 * 
 * Purpose: Track successful booking completions for analytics
 * Assumptions: Cal.com Atoms integration, analytics service available
 * Dependencies: Analytics service, real-time publisher
 * 
 * Trade-offs:
 * - Real-time tracking vs batch processing: Immediate insights vs performance
 * - Detailed tracking vs privacy: Analytics depth vs user privacy
 * - Synchronous vs asynchronous: Response speed vs processing completeness
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

import { logger } from "@/lib/logger";
// Validation schema
const bookingCompletedSchema = z.object({
  sessionId: z.string(),
  eventTypeId: z.number().optional(),
  serviceName: z.string().optional(),
  bookingData: z.object({
    id: z.union([z.string(), z.number()]),
    uid: z.string().optional(),
    title: z.string().optional(),
    attendees: z.array(z.object({
      name: z.string(),
      email: z.string().email(),
    })).optional(),
    startTime: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
  }),
  timestamp: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingCompletedSchema.parse(body);

    // Track the booking completion event
    await db.calAnalyticsEvent.create({
      data: {
        sessionId: data.sessionId,
        eventType: 'booking',
        eventName: 'booking_completed',
        properties: {
          eventTypeId: data.eventTypeId,
          serviceName: data.serviceName,
          bookingId: data.bookingData.id,
          bookingUid: data.bookingData.uid,
          attendeeCount: data.bookingData.attendees?.length ?? 1,
          amount: data.bookingData.amount,
          currency: data.bookingData.currency,
        },
        metadata: {
          source: 'cal_atoms',
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') ?? 
                    request.headers.get('x-real-ip') ?? 
                    'unknown',
        },
        timestamp: new Date(data.timestamp),
      },
    });

    // Publish real-time notification if we have attendee info
    if (data.bookingData.attendees?.length) {
      await realTimePublisher.publishNewBooking({
        id: data.bookingData.uid ?? String(data.bookingData.id),
        title: data.bookingData.title ?? data.serviceName ?? 'New Booking',
        attendee: {
          name: data.bookingData.attendees[0].name,
          email: data.bookingData.attendees[0].email,
        },
        startTime: data.bookingData.startTime ?? new Date().toISOString(),
        eventType: data.serviceName ?? 'Unknown Service',
        status: 'confirmed',
      });
    }

    // Update funnel analytics
    await db.calBookingFunnel.create({
      data: {
        sessionId: data.sessionId,
        step: 'booking_completed',
        stepOrder: 5,
        completed: true,
        serviceId: data.eventTypeId?.toString(),
        timestamp: new Date(data.timestamp),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking completion tracked successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    void logger.error('Error tracking booking completion:', error);
    
    // Log error for monitoring
    try {
      await db.calErrorLog.create({
        data: {
          errorType: 'analytics_tracking',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          stackTrace: error instanceof Error ? error.stack : undefined,
          url: '/api/analytics/booking-completed',
          userAgent: request.headers.get('user-agent'),
          severity: 'medium',
          timestamp: new Date(),
        },
      });
    } catch (logError) {
      void logger.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to track booking completion',
        error: process.env.NODE_ENV === 'development' ? 
               (error instanceof Error ? error.message : 'Unknown error') : 
               'Internal server error',
      },
      { status: 500 }
    );
  }
}
