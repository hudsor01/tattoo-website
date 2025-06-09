import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma, BookingStatus } from '@prisma/client';

// GET /api/bookings - Get bookings (public access)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status');

    // Build where clause
    const where: Prisma.BookingWhereInput = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase() as BookingStatus;
    }

    // Get bookings with pagination
    const queryOptions: Prisma.BookingFindManyArgs = {
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const bookings = await prisma.booking.findMany(queryOptions);

    // Check if there are more items
    let nextCursor: string | null = null;
    if (bookings.length > limit) {
      const nextItem = bookings.pop();
      nextCursor = nextItem?.id ?? null;
    }

    const totalCount = await prisma.booking.count({ where });

    return NextResponse.json({
      bookings,
      nextCursor,
      totalCount,
    });
  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      tattooType,
      size,
      placement,
      description,
      preferredDate,
      preferredTime,
    } = body;

    // Basic validation
    if (!name || !email || !tattooType || !preferredDate) {
      return NextResponse.json(
        { error: 'Name, email, tattoo type, and preferred date are required' },
        { status: 400 }
      );
    }

    // Check if customer exists, create if not
    let customer = await prisma.customer.findUnique({
      where: { email }
    });

    if (!customer && email) {
      const [firstName, ...lastNameParts] = name.split(' ');
      customer = await prisma.customer.create({
        data: {
          firstName,
          lastName: lastNameParts.join(' ') ?? '',
          email,
          phone: phone ?? null,
        }
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer?.id ?? null,
        firstName: name.split(' ')[0] ?? name,
        lastName: name.split(' ').slice(1).join(' ') ?? '',
        email,
        phone: phone ?? null,
        tattooType,
        size: size ?? null,
        placement: placement ?? null,
        description: description ?? null,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime ?? null,
        status: 'PENDING',
        source: 'website',
      },
      include: {
        customer: true,
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}