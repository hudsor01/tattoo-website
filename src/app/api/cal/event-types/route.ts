import { NextResponse } from 'next/server';
import { getCalEventTypes } from '@/lib/cal/api';

/**
 * GET /api/cal/event-types
 * Fetch all event types from Cal.com to find IDs
 */
export async function GET() {
  try {
    const eventTypes = await getCalEventTypes();

    return NextResponse.json({
      success: true,
      eventTypes,
      message: 'Event types retrieved successfully',
    });
  } catch (error) {
    void console.error('Error fetching Cal.com event types:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch event types. Check your CAL_API_KEY.',
      },
      { status: 500 }
    );
  }
}
