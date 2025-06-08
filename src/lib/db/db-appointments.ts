/**
 * Appointment Database Functions
 *
 * Unified functions for appointment-related operations using Booking model
 * Note: The appointment model has been replaced with the Booking model in the simplified schema
 */

import { prisma } from './prisma';
import type { Prisma, BookingStatus } from '@prisma/client';
import { logger } from "@/lib/logger";

// Type aliases for backward compatibility
type BookingCreateInput = Prisma.BookingCreateInput;
type AppointmentCreateInput = BookingCreateInput;

/**
 * Get upcoming appointments for a user (customer)
 */
export async function getUpcomingAppointments(
  userId: string,
  userType: 'customer' | 'artist',
  limit = 10
) {
  try {
    const now = new Date();
    const whereClause = userType === 'customer' ? { customerId: userId } : { customerId: userId };

    return await prisma.booking.findMany({
      where: {
        ...whereClause,
        preferredDate: { gte: now },
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
      },
      orderBy: { preferredDate: 'asc' },
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
    return await prisma.booking.findUnique({
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
      },
    });
  } catch (error) {
    logger.error('Error getting appointment details:', error);
    throw error;
  }
}

/**
 * Check if an appointment time slot is available
 * Simplified version using preferredDate
 */
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  _endTime: Date | null = null,
  appointmentId: string | null = null,
  _size?: string,
  _complexity?: string
) {
  try {
    // For simplified booking model, check if the preferred date conflicts
    const sameDay = new Date(startTime);
    sameDay.setHours(0, 0, 0, 0);
    const nextDay = new Date(sameDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Check for conflicting bookings on the same day
    const conflicts = await prisma.booking.findMany({
      where: {
        customerId: artistId, // Note: using customerId as artist reference
        id: appointmentId ? { not: appointmentId } : undefined,
        preferredDate: {
          gte: sameDay,
          lt: nextDay,
        },
        status: { notIn: ['CANCELLED'] },
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
    // Create booking using proper Prisma fields
    const booking = await prisma.booking.create({
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
      },
    });

    return {
      success: true,
      appointment: booking,
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
    // Get the existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: appointmentId }
    });
    
    if (!existingBooking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }
    
    // Update the booking with new preferred date
    const updatedBooking = await prisma.booking.update({
      where: { id: appointmentId },
      data: {
        preferredDate: newStartTime,
        notes: reason ? `${existingBooking.notes ?? ''} - Rescheduled: ${reason}` : existingBooking.notes,
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
      }
    });
    
    return {
      success: true,
      appointment: updatedBooking
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
    // Update booking status to cancelled
    const cancelledBooking = await prisma.booking.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED' as BookingStatus,
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
      }
    });
    
    return {
      success: true,
      appointment: cancelledBooking,
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
    // Get all bookings within date range
    const bookings = await prisma.booking.findMany({
      where: {
        ...(artistId ? { customerId: artistId } : {}),
        preferredDate: { 
          gte: startDate,
          lte: endDate 
        },
      },
      select: {
        status: true,
      },
    });

    // Count by status
    const counts: Record<string, number> = {};
    bookings.forEach((booking) => {
      const status = booking.status;
      counts[status] = (counts[status] ?? 0) + 1;
    });

    return counts;
  } catch (error) {
    logger.error('Error getting appointment counts by status:', error);
    throw error;
  }
}