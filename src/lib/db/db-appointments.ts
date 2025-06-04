/**
 * Appointment Database Functions
 *
 * Unified functions for appointment-related operations using Prisma
 */

import { prisma } from './prisma';
import type { Prisma } from '@prisma/client';

// Appointment create input using Prisma.GetPayload
type AppointmentCreateInput = Prisma.AppointmentCreateInput;

import { logger } from "@/lib/logger";
/**
 * Get upcoming appointments for a user (customer or artist)
 */
export async function getUpcomingAppointments(
  userId: string,
  userType: 'customer' | 'artist',
  limit = 10
) {
  try {
    const now = new Date();
    const whereClause = userType === 'customer' ? { customerId: userId } : { userId: userId };

    return await prisma.appointment.findMany({
      where: {
        ...whereClause,
        startTime: { gte: now },
        status: { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error getting upcoming appointments:', error);
    throw error;
  }
}

/**
 * Get appointment details by ID
 */
export async function getAppointmentById(appointmentId: string) {
  try {
    return await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Error getting appointment details:', error);
    throw error;
  }
}

/**
 * Check if an appointment time slot is available
 */
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date | null = null,
  appointmentId: string | null = null,
  size?: string,
  complexity?: string
) {
  try {
    // Calculate endTime if not provided
    const calculatedEndTime = endTime || new Date(startTime.getTime() + (2 * 60 * 60 * 1000)); // Default 2 hours
    
    // Check for conflicting appointments using Prisma
    const conflicts = await prisma.appointment.findMany({
      where: {
        userId: artistId,
        id: appointmentId ? { not: appointmentId } : undefined,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime }
          },
          {
            startTime: { lt: calculatedEndTime },
            endTime: { gte: calculatedEndTime }
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: calculatedEndTime }
          }
        ]
      }
    });
    
    return {
      isAvailable: conflicts.length === 0,
      conflicts: conflicts.length > 0 ? conflicts : null,
      error: null
    };
  } catch (error) {
    logger.error('Error checking appointment availability:', error);
    return {
      isAvailable: false,
      conflicts: null,
      error: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

/**
 * Schedule a new appointment
 */
export async function scheduleAppointment(params: AppointmentCreateInput) {
  try {
    // Create appointment using proper Prisma fields
    const appointment = await prisma.appointment.create({
      data: params,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      appointment,
    };
  } catch (error) {
    logger.error('Error scheduling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error scheduling appointment',
    };
  }
}

/**
 * Reschedule an existing appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newStartTime: Date,
  reason?: string
) {
  try {
    // Get the existing appointment to calculate duration
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    
    if (!existingAppointment) {
      return {
        success: false,
        error: 'Appointment not found'
      };
    }
    
    // Calculate duration from existing appointment
    const duration = existingAppointment.endTime.getTime() - existingAppointment.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        notes: reason ? `${existingAppointment.notes || ''} - Rescheduled: ${reason}` : existingAppointment.notes,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      }
    });
    
    return {
      success: true,
      appointment: updatedAppointment
    };
  } catch (error) {
    logger.error('Error rescheduling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error rescheduling appointment',
    };
  }
}

/**
 * Cancel an appointment with policy enforcement
 */
export async function cancelAppointment(
  appointmentId: string,
  cancellationDate: Date = new Date(),
  reasonCode: string = 'customer_request'
) {
  try {
    // Update appointment status to cancelled
    const cancelledAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: `Cancelled on ${cancellationDate.toISOString()} - Reason: ${reasonCode}`,
        updatedAt: new Date()
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      }
    });
    
    return {
      success: true,
      appointment: cancelledAppointment,
      cancellationPolicy: {
        applied: true,
        reason: reasonCode,
        date: cancellationDate
      }
    };
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error applying cancellation policy',
    };
  }
}

/**
 * Get appointment count by status
 */
export async function getAppointmentCountsByStatus(
  artistId?: string,
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: Date = new Date()
) {
  try {
    // Get all appointments within date range
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(artistId ? { userId: artistId } : {}),
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      select: {
        status: true,
      },
    });

    // Count by status
    const counts: Record<string, number> = {};
    appointments.forEach((appointment) => {
      const status = appointment.status;
      counts[status] = (counts[status] ?? 0) + 1;
    });

    return counts;
  } catch (error) {
    logger.error('Error getting appointment counts by status:', error);
    throw error;
  }
}
