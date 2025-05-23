/**
 * Appointment Database Functions
 * 
 * Unified functions for appointment-related operations using Prisma
 */

import { prisma, executeStoredProcedure } from './prisma';
import type { 
  AppointmentCreateInput 
} from '@/types/booking-types';

/**
 * Get upcoming appointments for a user (customer or artist)
 */
export async function getUpcomingAppointments(userId: string, userType: 'customer' | 'artist', limit = 10) {
  try {
    const now = new Date();
    const whereClause = userType === 'customer' 
      ? { customerId: userId } 
      : { artistId: userId };
    
    return await prisma.appointment.findMany({
      where: {
        ...whereClause,
        startDate: { gte: now },
        status: { notIn: ['cancelled', 'completed', 'no_show'] }
      },
      orderBy: { startDate: 'asc' },
      take: limit,
      include: {
        Customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        Artist: {
          select: {
            id: true,
            specialty: true,
            User: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
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
        Customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        Artist: {
          select: {
            id: true,
            specialty: true,
            User: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting appointment details:', error);
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
  complexity?: string,
) {
  try {
    // If endTime is not provided but size is, we'll let the database function calculate it
    if (!endTime && size) {
      const result = await executeStoredProcedure(
        'check_appointment_availability',
        [artistId, startTime, null, appointmentId, size, complexity || '3'],
      );
      return result;
    }

    const result = await executeStoredProcedure(
      'check_appointment_availability',
      [artistId, startTime, endTime, appointmentId],
    );
    return result;
  } catch (error) {
    console.error('Error checking appointment availability:', error);
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
    const {
      title,
      description = '',
      startDate,
      customerId,
      artistId,
      tattooSize = 'medium',
      complexity = 3,
      location = 'main_studio',
    } = params;

    // Call stored procedure for scheduling with business logic
    const result = await executeStoredProcedure(
      'schedule_appointment',
      [
        title,
        description,
        startDate,
        customerId,
        artistId,
        tattooSize,
        complexity,
        location,
      ],
    );
    
    return result;
  } catch (error) {
    console.error('Error scheduling appointment:', error);
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
  newStartDate: Date,
  reason?: string,
) {
  try {
    const result = await executeStoredProcedure(
      'reschedule_appointment',
      [appointmentId, newStartDate, reason || null],
    );
    return result;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
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
  reasonCode: string = 'customer_request',
) {
  try {
    const result = await executeStoredProcedure(
      'enforce_cancellation_policy',
      [appointmentId, cancellationDate, reasonCode],
    );
    return result;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
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
  endDate: Date = new Date(),
) {
  try {
    // Get all appointments within date range
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(artistId ? { artistId } : {}),
        startDate: { gte: startDate },
        endDate: { lte: endDate },
      },
      select: {
        status: true,
      }
    });
    
    // Count by status
    const counts: Record<string, number> = {};
    appointments.forEach(appointment => {
      const status = appointment.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting appointment counts by status:', error);
    throw error;
  }
}