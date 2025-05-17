import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import type { AppointmentStatus, FormattedAppointment } from '@/types/appointments-types';

/**
 * GET /api/admin/appointments
 * Get all appointments with optional filtering
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
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.AppointmentWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { is: { client: { name: { contains: search, mode: 'insensitive' } } } } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status as AppointmentStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    // Date filtering
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.startDate = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.startDate = {
        lte: new Date(endDate),
      };
    }

    // Get appointments with count
    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: {
          startTime: 'asc',
        },
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    // Format response

    const formattedAppointments: FormattedAppointment[] = appointments.map(
      (appointment: {
        id: string;
        title: string;
        customerId: string;
        customer?: {
          name?: string | null;
          email?: string | null;
          phone?: string | null;
        } | null;
        startDate: Date;
        endDate: Date;
        status: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        id: appointment.id,
        title: appointment.title,
        customerId: appointment.customerId,
        clientName: appointment.customer?.name ?? null,
        clientEmail: appointment.customer?.email ?? null,
        clientPhone: appointment.customer?.phone ?? null,
        startTime: appointment.startDate,
        endTime: appointment.endDate,
        status: appointment.status,
        description: appointment.description,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      }),
    );

    return NextResponse.json({
      appointments: formattedAppointments,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
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

    // Get request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.customerId || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { error: 'Title, client, start time, and end time are required' },
        { status: 400 },
      );
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: {
        id: data.customerId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 400 });
    }

    // Create new appointment
    const appointment = await prisma.appointment.create({
      data: {
        title: data.title,
        customerId: data.customerId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.status || 'scheduled',
        depositPaid: data.depositPaid || false,
        depositAmount: data.depositAmount || 0,
        price: data.price || 0,
        tattooStyle: data.tattooStyle || '',
        description: data.description || '',
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Update client's lastContact field
    await prisma.client.update({
      where: {
        id: data.customerId,
      },
      data: {
        lastContact: new Date(),
      },
    });

    // Format response
    const formattedAppointment = {
      ...appointment,
      clientName: appointment.client.name,
      clientEmail: appointment.client.email,
      clientPhone: appointment.client.phone,
      client: undefined, // Don't include full client in response
    };

    return NextResponse.json(formattedAppointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/appointments
 * Batch update appointments status
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get request body
    const data = await request.json();

    if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
      return NextResponse.json({ error: 'Appointment IDs are required' }, { status: 400 });
    }

    if (!data.status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Update appointments
    const updateCount = await prisma.appointment.updateMany({
      where: {
        id: {
          in: data.ids,
        },
      },
      data: {
        status: data.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `${updateCount.count} appointments updated successfully`,
      count: updateCount.count,
    });
  } catch (error) {
    console.error('Error updating appointments:', error);
    return NextResponse.json({ error: 'Failed to update appointments' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/appointments
 * Batch delete appointments
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get query parameters or request body depending on how IDs are sent
    const url = request.nextUrl;
    let ids: string[] = [];

    // Check if IDs are in query parameters
    const idParam = url.searchParams.get('ids');
    if (idParam) {
      ids = idParam.split(',');
    } else {
      // Check if IDs are in request body
      const data = await request.json();
      if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
        return NextResponse.json({ error: 'Appointment IDs are required' }, { status: 400 });
      }
      ids = data.ids;
    }

    // Delete appointments
    const deleteCount = await prisma.appointment.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      message: `${deleteCount.count} appointments deleted successfully`,
      count: deleteCount.count,
    });
  } catch (error) {
    console.error('Error deleting appointments:', error);
    return NextResponse.json({ error: 'Failed to delete appointments' }, { status: 500 });
  }
}
