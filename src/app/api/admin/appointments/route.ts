/**
 * API Routes for Appointments
 * 
 * These routes directly use Cal.com for appointment management
 * instead of maintaining a separate appointments system.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import type { Prisma, AppointmentStatus, Appointment } from '@prisma/client';
// Define types inline since they're not in Prisma
interface CalBookingPaymentInfo {
id?: number;
amount?: number;
currency?: string;
status?: 'COMPLETED' | 'PENDING' | 'FAILED';
success?: boolean;
}

interface CalBookingOrganizer {
id?: number;
name?: string;
email?: string;
username?: string;
}

interface FormattedAppointment {
id: string;
title: string;
customerId: string;
clientName: string | null;
clientEmail: string | null;
clientPhone: string | null;
startDate: Date;
endDate: Date;
status: AppointmentStatus;
description: string | null;
createdAt: Date;
updatedAt: Date;
depositPaid: boolean;
depositAmount: number;
totalPrice: number;
tattooStyle: string;
location: string;
size: string;
customer: {
id: string;
name: string;
email: string | null;
phone: string | null;
};
artist: {
name: string;
};
}

// Import the FormattedAppointment type
import { 
  getCalBookings, 
  updateCalBookingStatus
} from '@/lib/cal/api';
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/appointments
 * Get all appointments with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    // Get bookings from Cal.com
    const calBookings = await getCalBookings({
      limit: 100, // Get more to allow for filtering
    });

    // Filter the bookings based on query parameters
    const filteredBookings = calBookings.filter(booking => {
      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch = booking.title.toLowerCase().includes(searchLower);
        const descMatch = booking.description?.toLowerCase().includes(searchLower) ?? false;
        const attendeeMatch = booking.attendees?.some(a => 
          a.name.toLowerCase().includes(searchLower) || 
          a.email.toLowerCase().includes(searchLower)
        ) ?? false;
        
        if (!(titleMatch || descMatch || attendeeMatch)) {
          return false;
        }
      }
      
      // Filter by status if provided
      if (status && status !== 'all' && booking.status !== status) {
        return false;
      }
      
      // Filter by customer if provided (by email since Cal.com uses email)
      if (customerId && booking.attendees && booking.attendees.length > 0) {
        // This is imperfect since we're matching emails not IDs
        // A proper implementation would get the customer record first and match by email
        // For now, we'll just skip this filter
      }
      
      // Filter by date range if provided
      if (startDate && new Date(booking.startTime) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(booking.startTime) > new Date(endDate)) {
        return false;
      }
      
      return true;
    });
    
    // Sort by start time (newest first)
    const sortedBookings = [...filteredBookings].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    // Handle pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBookings = sortedBookings.slice(start, end);
    
    // Transform to our appointment format
    const formattedAppointments: FormattedAppointment[] = paginatedBookings.map(booking => {
      const attendee = booking.attendees?.[0];
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      
      // Calculate duration in minutes (not used but might be useful for future reference)
      // const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      
      return {
        id: booking.uid,
        title: booking.title,
        customerId: attendee?.email ?? '', // Use email as customerId
        clientName: attendee?.name ?? null,
        clientEmail: attendee?.email ?? null,
        clientPhone: null, // Cal.com might not provide phone
        startDate: startTime,
        endDate: endTime,
        status: booking.status as AppointmentStatus,
        description: booking.description ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        depositPaid: (booking.payment as CalBookingPaymentInfo)?.status === 'COMPLETED',
        depositAmount: (booking.payment as CalBookingPaymentInfo)?.amount ?? 0,
        totalPrice: (booking.payment as CalBookingPaymentInfo)?.amount ?? 0,
        tattooStyle: '',
        location: booking.location ?? '',
        size: '',
        customer: {
          id: attendee?.email ?? '',
          name: attendee?.name ?? '',
          email: attendee?.email ?? null,
          phone: null,
        },
        artist: {
          name: (booking.organizer as CalBookingOrganizer)?.name ?? 'Default Artist'
        }
      };
    });

    return NextResponse.json({
      appointments: formattedAppointments,
      total: filteredBookings.length,
      page,
      limit,
      pageCount: Math.ceil(filteredBookings.length / limit),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void void logger.error('Error fetching appointments from Cal.com:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

/**
 * POST /api/admin/appointments
 * Create a new appointment (not fully implemented)
 */
export async function POST() {
  try {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Direct appointment creation not supported
    return NextResponse.json(
      { error: 'Direct appointment creation is not supported. Please use Cal.com to create appointments.' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void void logger.error('Error creating appointment:', errorMessage);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/appointments
 * Batch update appointments status
 */
export async function PUT(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data: {
      ids: string[];
      status: string;
    } = await request.json();

    if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
      return NextResponse.json({ error: 'Appointment IDs are required' }, { status: 400 });
    }

    if (!data.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Map our status to Cal.com status
    const calStatus = data.status === 'CANCELLED' ? 'cancelled' : 
                     data.status === 'CONFIRMED' ? 'accepted' : 'accepted';

    // Update each booking's status in Cal.com
    const results = await Promise.allSettled(
      data.ids.map(id => updateCalBookingStatus(id, calStatus as 'accepted' | 'rejected' | 'cancelled'))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      message: `${successCount} appointments updated successfully`,
      count: successCount,
      total: data.ids.length,
      failed: data.ids.length - successCount,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void void logger.error('Error updating appointments:', errorMessage);
    return NextResponse.json({ error: 'Failed to update appointments' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/appointments
 * Batch delete (cancel) appointments
 */
export async function DELETE(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = request.nextUrl;
    let ids: string[] = [];

    const idParam = url.searchParams.get('ids');
    if (idParam) {
      ids = idParam.split(',');
    } else {
      const data: { ids: string[] } = await request.json();
      if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
        return NextResponse.json({ error: 'Appointment IDs are required' }, { status: 400 });
      }
      ids = data.ids;
    }

    // Cancel each booking in Cal.com (we can't delete, only cancel)
    const results = await Promise.allSettled(
      ids.map(id => updateCalBookingStatus(id, 'cancelled' as const))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      message: `${successCount} appointments cancelled successfully`,
      count: successCount,
      total: ids.length,
      failed: ids.length - successCount,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void void logger.error('Error cancelling appointments:', errorMessage);
    return NextResponse.json({ error: 'Failed to cancel appointments' }, { status: 500 });
  }
}
