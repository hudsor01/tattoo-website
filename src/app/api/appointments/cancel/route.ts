import { NextRequest, NextResponse } from 'next/server';
import { cancelAppointment } from '@/lib/db-functions';
import { serverClient } from '@/lib/supabase/server-client';

/**
 * POST /api/appointments/cancel
 *
 * Cancel an appointment and apply the appropriate cancellation policy
 * Uses Supabase for authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session from Supabase
    const supabase = serverClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Check for authentication
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing required field: appointmentId' }, { status: 400 });
    }

    // Cancel the appointment
    const result = await cancelAppointment(appointmentId);

    // Check for cancellation success
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Return cancellation details
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cancelling appointment:', error);

    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}