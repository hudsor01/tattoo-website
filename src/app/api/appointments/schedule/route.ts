import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/db/functions';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/appointments/schedule
 *
 * Create a new appointment
 * Uses Supabase for authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session from Supabase
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Check for authentication
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { customer_id, start_time, end_time, service_id } = body;

    if (!customer_id || !start_time || !end_time || !service_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the appointment
    const result = await createAppointment({
      customer_id,
      start_time,
      end_time,
      service_id,
      artist_id: body.artist_id,
      notes: body.notes,
      status: body.status || 'scheduled',
    });

    // Check for scheduling success
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 } // Conflict
      );
    }

    // Return success response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in appointment scheduling:', error);

    return NextResponse.json({ error: 'Failed to schedule appointment' }, { status: 500 });
  }
}