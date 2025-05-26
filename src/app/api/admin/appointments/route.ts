import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import { Prisma } from '@prisma/client';
import type {
  AppointmentStatus,
  AppointmentWithCustomer,
  FormattedAppointment,
} from '@/types/booking-types';
import { prisma } from '@/lib/db/prisma';
import { randomUUID } from 'node:crypto';

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
    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { Customer: { is: { firstName: { contains: search, mode: 'insensitive' } } } },
        { Customer: { is: { lastName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status as AppointmentStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

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

    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: {
          startDate: 'asc',
        },
        skip,
        take: limit,
        include: {
          Customer: {
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
      prisma.appointment.count({ where }),
    ]);

    const formattedAppointments: FormattedAppointment[] = (
      appointments as AppointmentWithCustomer[]
    ).map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      customerId: appointment.customerId,
      clientName: appointment.Customer
        ? `${appointment.Customer.firstName ?? ''} ${appointment.Customer.lastName ?? ''}`.trim()
        : null,
      clientEmail: appointment.Customer?.email ?? null,
      clientPhone: appointment.Customer?.phone ?? null,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      status: appointment.status,
      description: appointment.description,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }));

    return NextResponse.json({
      appointments: formattedAppointments,
      total: totalCount,
      page,
      limit,
      pageCount: Math.ceil(totalCount / limit),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void console.error('Error fetching appointments:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

/**
 * POST /api/admin/appointments
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data: {
      id?: string;
      title: string;
      customerId: string;
      startTime: string;
      endTime: string;
      status?: string;
      depositAmount?: number;
      price?: number;
      description?: string;
      designNotes?: string;
      artistId?: string;
    } = await request.json();

    if (!data.title || !data.customerId || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { error: 'Title, client, start time, and end time are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: data.customerId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 400 });
    }

    const appointmentData: {
      id: string;
      title: string;
      customerId: string;
      startDate: Date;
      endDate: Date;
      status: string;
      deposit: number | null;
      totalPrice: number | null;
      description: string | null;
      designNotes?: string | null;
      artistId: string;
    } = {
      id: data.id ?? randomUUID(),
      title: String(data.title),
      customerId: String(data.customerId),
      startDate: new Date(data.startTime),
      endDate: new Date(data.endTime),
      status: String(data.status ?? 'scheduled'),
      deposit: data.depositAmount ? Number(data.depositAmount) : null,
      totalPrice: data.price ? Number(data.price) : null,
      description: data.description ? String(data.description) : null,
      artistId: data.artistId ?? '00000000-0000-0000-0000-000000000000',
      designNotes: data.designNotes ?? null,
    };

    const appointment = await prisma.appointment.create({
      data: appointmentData,
      include: {
        Customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    await prisma.customer.update({
      where: {
        id: data.customerId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    const customerData = (appointment as AppointmentWithCustomer).Customer;

    const formattedAppointment: FormattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      customerId: appointment.customerId,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      status: appointment.status,
      description: appointment.description,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      clientName: customerData
        ? `${customerData.firstName ?? ''} ${customerData.lastName ?? ''}`.trim()
        : null,
      clientEmail: customerData?.email ?? null,
      clientPhone: customerData?.phone ?? null,
      artist: null,
    };

    return NextResponse.json(formattedAppointment, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void console.error('Error creating appointment:', errorMessage);
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void console.error('Error updating appointments:', errorMessage);
    return NextResponse.json({ error: 'Failed to update appointments' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/appointments
 * Batch delete appointments
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void console.error('Error deleting appointments:', errorMessage);
    return NextResponse.json({ error: 'Failed to delete appointments' }, { status: 500 });
  }
}
