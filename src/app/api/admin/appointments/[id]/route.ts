import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';

/**
 * GET /api/admin/appointments/[id]
 * Get a specific appointment by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get appointment with customer data
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
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
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Format response
    const formattedAppointment = {
      id: appointment.id,
      title: appointment.title,
      customerId: appointment.customerId,
      customerName: appointment.customer?.name,
      customerEmail: appointment.customer?.email,
      customerPhone: appointment.customer?.phone,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      depositPaid: appointment.depositPaid,
      depositAmount: appointment.depositAmount,
      price: appointment.price,
      tattooStyle: appointment.tattooStyle,
      description: appointment.description,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      customer: appointment.customer
        ? {
            id: appointment.customer.id,
            name: appointment.customer.name,
            email: appointment.customer.email,
            phone: appointment.customer.phone,
          }
        : null,
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error(`Error fetching appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/appointments/[id]
 * Update a specific appointment
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;
    const data = await request.json();

    // Check if appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
    });

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If changing customer, verify new customer exists
    if (data.customerId && data.customerId !== existingAppointment.customerId) {
      const customer = await prisma.customer.findUnique({
        where: {
          id: data.customerId,
        },
      });

      if (!customer) {
        return NextResponse.json({ error: 'customer not found' }, { status: 400 });
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        customerId: data.customerId,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        status: data.status,
        depositPaid: data.depositPaid,
        depositAmount: data.depositAmount,
        price: data.price,
        tattooStyle: data.tattooStyle,
        description: data.description,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Format response
    const formattedAppointment = {
      ...updatedAppointment,
      customerName: updatedAppointment.customer.name,
      customerEmail: updatedAppointment.customer.email,
      customerPhone: updatedAppointment.customer.phone,
      customer: undefined, // Don't include full customer in response
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error(`Error updating appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/appointments/[id]
 * Delete a specific appointment
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Check if appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
