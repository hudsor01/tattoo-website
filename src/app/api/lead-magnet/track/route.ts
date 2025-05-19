import { NextRequest, NextResponse } from 'next/server';
import { apiRoute, trackingSchema } from '@/lib/validations/validation-api-utils';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Track lead magnet engagement
 */
export const POST = apiRoute({
  POST: {
    bodySchema: trackingSchema,
    handler: async (body, request) => {
      try {
        const { leadId, event, data } = body;

        // Verify lead exists
        const lead = await prisma.lead.findUnique({
          where: { id: leadId },
        });

        if (!lead) {
          return NextResponse.json(
            {
              success: false,
              message: 'Lead not found',
            },
            { status: 404 }
          );
        }

        // Record tracking event
        const trackingEvent = await prisma.leadEvent.create({
          data: {
            leadId,
            eventType: event,
            eventData: data || {},
          },
        });

        // Update lead status if needed
        if (event === 'download_completed') {
          await prisma.lead.update({
            where: { id: leadId },
            data: {
              status: 'engaged',
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Event tracked successfully',
        });
      } catch (error) {
        console.error('Error tracking lead event:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to track event',
          },
          { status: 500 }
        );
      }
    },
  },
});
