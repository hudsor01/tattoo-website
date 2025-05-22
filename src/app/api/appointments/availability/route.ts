import { NextRequest, NextResponse } from 'next/server';
import { checkAppointmentAvailability, calculateAppointmentDuration } from '@/lib/db/functions';

/**
 * GET /api/appointments/availability
 *
 * Check if an artist is available for a specified time slot
 * Uses the PostgreSQL check_appointment_availability function
 */
export async function GET(request: NextRequest) {
  try {
    // Parse URL parameters
    const searchParams = request.nextUrl.searchParams;
    const artistId = searchParams.get('artistId');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const appointmentId = searchParams.get('appointmentId');
    const size = searchParams.get('size');
    const complexity = searchParams.get('complexity');

    // Validate required parameters
    if (!artistId || !startTime) {
      return NextResponse.json(
        { error: 'Missing required parameters: artistId and startTime are required' },
        { status: 400 }
      );
    }

    let parsedEndTime: Date | null;

    // If endTime is not provided but size is, calculate endTime based on tattoo parameters
    if (!endTime && size) {
      // Convert startTime to Date
      const parsedStartTime = new Date(startTime);

      // Get appointment duration based on tattoo size and complexity
      const complexityValue = complexity ? parseInt(complexity) : 3;
      const duration = await calculateAppointmentDuration(size, complexityValue);

      // Calculate end time by adding duration to start time
      // Note: duration is returned as PostgreSQL interval, we need to parse it
      const durationMinutes = parseInt(duration.replace(/\D/g, ''));
      parsedEndTime = new Date(parsedStartTime.getTime() + durationMinutes * 60 * 1000);
    } else if (endTime) {
      parsedEndTime = new Date(endTime);
    } else {
      // If neither endTime nor size provided, return error
      return NextResponse.json(
        { error: 'Either endTime or size parameter is required' },
        { status: 400 }
      );
    }

    // Check availability
    const availability = await checkAppointmentAvailability(
      artistId,
      new Date(startTime),
      parsedEndTime,
      appointmentId || null
    );

    // Return availability information
    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error checking availability:', error);

    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
