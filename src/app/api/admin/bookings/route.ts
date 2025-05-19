import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { cache } from '@/lib/cache';

/**
 * GET endpoint for retrieving all bookings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await (await supabase).auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Optional query parameters for filtering
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit') || '50');
    const page = Number(searchParams.get('page') || '1');
    const status = searchParams.get('status'); // 'paid' or 'pending'

    // Validate parameters
    const validatedLimit = Math.min(100, Math.max(1, limit));
    const validatedPage = Math.max(1, page);
    const skip = (validatedPage - 1) * validatedLimit;

    // Create a cache key based on query parameters
    const cacheKey = `admin:bookings:${status || 'all'}:${validatedPage}:${validatedLimit}`;

    // Try to get data from cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Build filter based on query parameters
    const filter: { depositPaid?: boolean } = {};

    if (status === 'paid') {
      filter.depositPaid = true;
    } else if (status === 'pending') {
      filter.depositPaid = false;
    }

    // Get total count for pagination
    const totalCount = await prisma.booking.count({
      where: filter,
    });

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
      take: validatedLimit,
      skip,
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Format dates and sanitize data for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      tattooType: booking.tattooType,
      size: booking.size,
      placement: booking.placement,
      description: booking.description,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      depositPaid: booking.depositPaid,
      createdAt: booking.createdAt,
      payment: booking.payment,
    }));

    const responseData = {
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / validatedLimit),
        currentPage: validatedPage,
        perPage: validatedLimit,
      },
    };

    // Cache the data for 1 minute (60 seconds)
    cache.set(cacheKey, responseData, 60);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

/**
 * POST endpoint for creating a new booking (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'phone',
      'tattooType',
      'size',
      'placement',
      'description',
      'preferredDate',
      'preferredTime',
      'paymentMethod',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Convert string date to Date object
    const preferredDate = new Date(body.preferredDate);

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        tattooType: body.tattooType,
        size: body.size,
        placement: body.placement,
        description: body.description,
        preferredDate,
        preferredTime: body.preferredTime,
        paymentMethod: body.paymentMethod,
        depositPaid: body.depositPaid || false,
      },
    });

    // Invalidate cache after creating a new booking
    cache.invalidateAll();

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
