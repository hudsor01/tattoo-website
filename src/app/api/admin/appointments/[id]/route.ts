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
        Customer: true,
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
      customerName: appointment.Customer ? `${appointment.Customer.firstName} ${appointment.Customer.lastName}` : '',
      customerEmail: appointment.Customer?.email,
      customerPhone: appointment.Customer?.phone,
      startDate: appointment.startDate,
      endDate: appointment.endDate,
      status: appointment.status,
      deposit: appointment.deposit,
      totalPrice: appointment.totalPrice,
      designNotes: appointment.designNotes,
      description: appointment.description,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      customer: appointment.Customer
        ? {
            id: appointment.Customer.id,
            name: `${appointment.Customer.firstName} ${appointment.Customer.lastName}`,
            email: appointment.Customer.email,
            phone: appointment.Customer.phone,
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
        return NextResponse.json({ error: 'Customer not found' }, { status: 400 });
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        ...(data.title !==  null && { title: data.title }),
        ...(data.customerId !==  null && { customerId: data.customerId }),
        ...(data.startDate !==  null && { startDate: new Date(data.startDate) }),
        ...(data.endDate !==  null && { endDate: new Date(data.endDate) }),
        ...(data.status !==  null && { status: data.status }),
        ...(data.deposit !== null && { deposit: data.deposit }),
        ...(data.totalPrice !== null && { totalPrice: data.totalPrice }),
        ...(data.designNotes !== null && { designNotes: data.designNotes }),
        ...(data.description !== null && { description: data.description }),
        updatedAt: new Date(),
      },
      include: {
        Customer: true,
      },
    });

    // Format response
    const formattedAppointment = {
      ...updatedAppointment,
      customerName: updatedAppointment.Customer ? `${updatedAppointment.Customer.firstName} ${updatedAppointment.Customer.lastName}` : '',
      customerEmail: updatedAppointment.Customer?.email,
      customerPhone: updatedAppointment.Customer?.phone,
      Customer: null, // Don't include full customer in response
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
