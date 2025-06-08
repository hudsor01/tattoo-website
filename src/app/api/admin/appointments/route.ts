/**
 * API Routes for Appointments (using Booking model)
 * 
 * These routes provide appointment management functionality
 * using the unified Booking model with Cal.com integration.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import { prisma } from '@/lib/db/prisma';
import type { Prisma, BookingStatus } from '@prisma/client';
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/appointments
 * Get appointments with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.BookingWhereInput = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase() as BookingStatus;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get appointments with customer data
    const [appointments, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: {
          preferredDate: 'desc',
        },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.booking.count({
        where,
      }),
    ]);

    // Transform appointments to match expected interface
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      email: appointment.email,
      phone: appointment.phone ?? null,
      tattooType: appointment.tattooType,
      size: appointment.size ?? null,
      placement: appointment.placement ?? null,
      description: appointment.description ?? null,
      preferredDate: appointment.preferredDate,
      preferredTime: appointment.preferredTime ?? null,
      status: appointment.status,
      notes: appointment.notes ?? null,
      totalAmount: appointment.totalAmount ?? null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      customer: appointment.customer,
      // Additional fields for compatibility
      clientName: `${appointment.firstName} ${appointment.lastName}`,
      clientEmail: appointment.email,
      startDate: appointment.preferredDate,
      endDate: appointment.preferredDate, // Same as start date for now
      totalPrice: appointment.totalAmount ?? 0,
    }));

    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      appointments: transformedAppointments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore,
      },
    });

  } catch (error) {
    void logger.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Create new appointment using Booking model
    const appointment = await prisma.booking.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        tattooType: body.tattooType,
        size: body.size,
        placement: body.placement,
        description: body.description,
        preferredDate: new Date(body.preferredDate),
        preferredTime: body.preferredTime,
        status: body.status ?? 'PENDING',
        notes: body.notes,
        totalAmount: body.totalAmount,
        customerId: body.customerId, // Optional link to existing customer
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    void logger.info('Created new appointment:', { appointmentId: appointment.id });

    return NextResponse.json(appointment, { status: 201 });

  } catch (error) {
    void logger.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
