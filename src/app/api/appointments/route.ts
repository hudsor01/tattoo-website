/**
 * Appointments API Routes
 * 
 * API endpoints for appointment management
 */

import { NextResponse } from 'next/server';
import {
  getUpcomingAppointments,
  scheduleAppointment,
  checkAppointmentAvailability,
} from '@/lib/db/db-appointments';
import type { AppointmentCreateSchema } from '@/types/booking-types';
import { createClient } from '@/lib/supabase/server';

// Authentication and validation route helpers
const createAuthenticatedRoute = (
  handler: (req: Request, context: { userId: string }) => Promise<Response>
) => {
  return async (req: Request) => {
    // Get the user's session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Call the handler with the user ID
    return handler(req, { userId: session.user.id });
  };
};

const createAuthenticatedValidatedRoute = <T, S extends { parse: (data: unknown) => T }>(
  schema: S, // Using generic S for the Zod schema with parse method
  handler: (req: Request, context: { userId: string; data: T }) => Promise<Response>
) => {
  return async (req: Request) => {
    // Get the user's session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      // Parse and validate the request body
      const body = await req.json();
      const data = schema.parse(body);
      
      // Call the handler with the user ID and validated data
      return handler(req, { userId: session.user.id, data });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
  };
};

/**
 * GET /api/appointments
 * 
 * Get upcoming appointments for a user
 */
export const GET = createAuthenticatedRoute(async (req, { userId }) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const userType = searchParams.get('userType') || 'customer';

  if (userType !== 'customer' && userType !== 'artist') {
    return NextResponse.json(
      { error: 'Invalid user type. Must be "customer" or "artist"' },
      { status: 400 }
    );
  }

  try {
    const appointments = await getUpcomingAppointments(userId, userType as 'customer' | 'artist', limit);
    
    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/appointments
 * 
 * Schedule a new appointment
 */
export const POST = createAuthenticatedValidatedRoute(
  AppointmentCreateSchema,
  async (req, { userId, data }) => {
    try {
      // Check if the appointment time is available
      const availabilityCheck = await checkAppointmentAvailability(
        data.artistId.toString(),
        new Date(data.startDate),
        data.endDate ? new Date(data.endDate) : null
      );

      if (!availabilityCheck.isAvailable) {
        return NextResponse.json(
          { 
            error: 'The requested time slot is not available',
            conflicts: availabilityCheck.conflicts
          },
          { status: 409 }
        );
      }

      // Schedule the appointment
      const result = await scheduleAppointment({
        ...data,
        customerId: userId, // Use the authenticated user's ID
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to schedule appointment' },
          { status: 500 }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to schedule appointment' },
        { status: 500 }
      );
    }
  }
);

/**
 * HEAD /api/appointments
 * 
 * Check if a time slot is available
 */
export const HEAD = createAuthenticatedRoute(async (req) => {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const artistId = searchParams.get('artistId');
  const startDate = searchParams.get('startDate');
  
  if (!artistId || !startDate) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const availability = await checkAppointmentAvailability(
      artistId,
      new Date(startDate),
      searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null
    );

    // For HEAD requests, we only return status codes
    if (availability.isAvailable) {
      return new Response(null, { status: 200 });
    } else {
      return new Response(null, { status: 409 });
    }
  } catch {
    return new Response(null, { status: 500 });
  }
});