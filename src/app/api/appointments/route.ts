/**
 * Appointments API Routes
 * 
 * API endpoints for appointment management
 */

import { NextRequest, NextResponse } from 'next/server';
import * as z from 'zod';
import {
  createAuthenticatedValidatedRoute,
  createAuthenticatedRoute,
} from '../route-creator';
import {
  getUpcomingAppointments,
  scheduleAppointment,
  checkAppointmentAvailability,
} from '@/lib/db/db-appointments';
import { AppointmentCreateSchema } from '@/types/booking-types';

/**
 * GET /api/appointments
 * 
 * Get upcoming appointments for a user
 */
export const GET = createAuthenticatedRoute(async (req, { userId }) => {
  const searchParams = req.nextUrl.searchParams;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
  const userType = searchParams.get('userType') || 'customer';

  if (userType !== 'customer' && userType !== 'artist') {
    return NextResponse.json(
      { error: 'Invalid user type. Must be "customer" or "artist"' },
      { status: 400 }
    );
  }

  try {
    const appointments = await getUpcomingAppointments(userId!, userType as 'customer' | 'artist', limit);
    
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
        customerId: userId!, // Use the authenticated user's ID
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
  const searchParams = req.nextUrl.searchParams;
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
  } catch (error) {
    return new Response(null, { status: 500 });
  }
});