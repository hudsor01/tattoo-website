import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils';
import {
  createBooking,
  updateBookingDepositStatus,
  getBookingById,
  getBookings,
} from '@/lib/services/booking';
import {
  createBookingSchema,
  depositUpdateSchema,
  getBookingQuerySchema,
  apiRoute,
  handleApiError,
} from '@/lib/validations/api';

export const dynamic = 'force-dynamic';

/**
 * Check admin access middleware
 */
async function requireAdmin(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess();

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return null;
  } catch (error) {
    return handleApiError(error, 401);
  }
}

/**
 * Booking API route handler
 * Uses the apiRoute utility for validation and error handling
 */
export const GET = apiRoute({
  GET: {
    querySchema: getBookingQuerySchema,
    handler: async (query, request) => {
      try {
        // Check admin access
        const accessError = await requireAdmin(request);
        if (accessError) return accessError;

        // Check if we're looking up a specific booking
        if (query.id) {
          const id = parseInt(query.id, 10);
          const booking = await getBookingById(id);

          if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
          }

          return NextResponse.json(booking);
        }

        // Get a list of bookings with validated params
        const bookings = await getBookings({
          limit: query.limit,
          page: query.page,
          status: query.status === 'paid' ? 'paid' : query.status === 'pending' ? 'pending' : null,
          startDate: query.startDate ? new Date(query.startDate) : undefined,
          endDate: query.endDate ? new Date(query.endDate) : undefined,
        });

        return NextResponse.json(bookings);
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
  POST: {
    bodySchema: createBookingSchema,
    handler: async (body, request) => {
      try {
        // Create booking using service with validated data
        const booking = await createBooking(body);

        return NextResponse.json(
          {
            success: true,
            message: 'Booking request received successfully',
            bookingId: booking.id,
          },
          { status: 201 }
        );
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
  PATCH: {
    bodySchema: depositUpdateSchema,
    handler: async (body, request) => {
      try {
        // Update booking deposit status with validated data
        await updateBookingDepositStatus(body);

        return NextResponse.json({
          success: true,
          message: 'Deposit status updated successfully',
          depositPaid: true,
        });
      } catch (error) {
        return handleApiError(error);
      }
    },
  },
});
