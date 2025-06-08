import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/server';
import { prisma } from '@/lib/db/prisma';
import type { BookingStatus } from '@prisma/client';
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/appointments/[id]
 * Get a specific appointment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    const appointment = await prisma.booking.findUnique({
      where: { id },
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
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);

  } catch (error) {
    void logger.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/appointments/[id]
 * Update an appointment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;
    const body = await request.json();

    const updatedAppointment = await prisma.booking.update({
      where: { id },
      data: {
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName && { lastName: body.lastName }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.tattooType && { tattooType: body.tattooType }),
        ...(body.size && { size: body.size }),
        ...(body.placement && { placement: body.placement }),
        ...(body.description && { description: body.description }),
        ...(body.preferredDate && { preferredDate: new Date(body.preferredDate) }),
        ...(body.preferredTime && { preferredTime: body.preferredTime }),
        ...(body.status && { status: body.status as BookingStatus }),
        ...(body.notes && { notes: body.notes }),
        ...(body.totalAmount !== undefined && { totalAmount: body.totalAmount }),
        updatedAt: new Date(),
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

    void logger.info('Updated appointment:', { appointmentId: id });

    return NextResponse.json(updatedAppointment);

  } catch (error) {
    void logger.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/appointments/[id]
 * Delete an appointment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    await prisma.booking.delete({
      where: { id },
    });

    void logger.info('Deleted appointment:', { appointmentId: id });

    return NextResponse.json({ success: true });

  } catch (error) {
    void logger.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
