import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAdminAccess } from '@/lib/utils/server';
import type { Appointment } from '@prisma/client';
import { AppointmentStatus } from '@prisma/client';
import { logger } from "@/lib/logger";
/**
 * GET /api/admin/appointments/[id]
 * Get a specific appointment by ID
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = params.id;

    // Get appointment from the database
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
      select: {
      id: true,
      userId: true,
      customerId: true,
      serviceId: true,
      startTime: true,
      endTime: true,
      status: true,
      notes: true,
      totalPrice: true,
      createdAt: true,
      updatedAt: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Format response
    const formattedAppointment: Partial<Appointment> = {
    id: appointment.id,
    startTime: appointment.startTime, // use consistent field names
    endTime: appointment.endTime,
    status: appointment.status as AppointmentStatus,
    notes: appointment.notes,
    totalPrice: appointment.totalPrice,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
    userId: appointment.userId,
    customerId: appointment.customerId,
    serviceId: appointment.serviceId,
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    void void logger.error(`Error fetching appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/appointments/[id]
 * Update a specific appointment (non-relational fields only)
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

    // Prepare update data - only allow non-relational fields
    const updateData: {
      startTime?: Date | undefined;
      endTime?: Date | undefined;
      status?: AppointmentStatus | undefined;
      notes?: string | undefined;
      totalPrice?: number | undefined;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    // Only update allowed fields - only add properties that are actually being updated
    if (data.startDate !== undefined && data.startDate !== null) {
      updateData.startTime = new Date(data.startDate);
    }
    if (data.endDate !== undefined && data.endDate !== null) {
      updateData.endTime = new Date(data.endDate);
    }
    if (data.status !== undefined && data.status !== null) {
      updateData.status = data.status as AppointmentStatus;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.totalPrice !== undefined && data.totalPrice !== null) {
      updateData.totalPrice = data.totalPrice;
    }

    // Create a clean update object with only defined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as Parameters<typeof prisma.appointment.update>[0]['data'];

    // Update appointment with only non-relational fields
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: cleanUpdateData,
      select: {
        id: true,
        userId: true,
        customerId: true,
        serviceId: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        totalPrice: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Format response
    const formattedAppointment = {
      ...updatedAppointment,
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    void void logger.error(`Error updating appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/appointments/[id]
 * Delete a specific appointment
 */
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
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
    void void logger.error(`Error deleting appointment ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
