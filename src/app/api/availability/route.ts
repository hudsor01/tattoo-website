import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots } from '@/lib/supabase/database-functions';
import { createClient } from '@/lib/supabase/server-client';
import type { AvailabilityParams, AvailabilityResult, CreateAppointmentParams, CreateAppointmentResult } from '@/types/availability-types';

/**
 * GET endpoint for fetching available appointment slots
 * Uses the database function get_available_slots for optimized performance
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const durationMinutes = searchParams.get('duration');

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Missing required query parameter: date' },
        { status: 400 }
      );
    }

    // Parse duration minutes (default to 60 if not provided)
    const duration = durationMinutes ? parseInt(durationMinutes, 10) : 60;

    // Check if user is authenticated (optional)
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const isAuthenticated = !!data.user;

    // Get available slots using the database function
    const result = await getAvailableSlots(date, duration);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Return the available slots
    return NextResponse.json({
      date,
      duration_minutes: duration,
      is_authenticated: isAuthenticated,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch available slots',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for checking availability and creating appointment
 * Uses the database function create_appointment with built-in validation
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the request body
    const body = await request.json();

    // Check if user is authenticated
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to book an appointment.' },
        { status: 401 }
      );
    }

    // Validate required fields
    const requiredFields = ['start_date', 'end_date', 'service_type', 'customer_id'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Use database function to create appointment with validation
    const { createAppointment } = await import('@/lib/supabase/database-functions');

    const result = await createAppointment({
      customer_id: body.customer_id,
      start_date: body.start_date,
      end_date: body.end_date,
      service_type: body.service_type,
      details: body.details,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        appointment_id: result.appointment_id,
        message: 'Appointment created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);

    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
