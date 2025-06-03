/**
 * Production-ready database functions
 * Using direct Prisma queries for tattoo-website project
 */

import { prisma } from './prisma';
import { AppointmentStatus } from '@prisma/client';
import { addHours, parseISO } from 'date-fns';

import { logger } from "@/lib/logger";
/**
 * Get available time slots for booking appointments
 * @returns Array of available time slots
 */
export async function getAvailableSlots(artistId?: string, date?: Date) {
  try {
    // Get all booked slots for the specified date (or today by default)
    const targetDate = date ?? new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    // Get booked appointments
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        ...(artistId && { artist: { id: artistId } }),
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['CONFIRMED', 'PENDING']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });
    
    // Generate available slots (assuming 1-hour slots from 9 AM to 6 PM)
    const availableSlots = [];
    const businessHours = {
      start: 9, // 9 AM
      end: 18   // 6 PM
    };
    
    // Create hourly slots
    for (let hour = businessHours.start; hour < businessHours.end; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      // Check if slot is available (not overlapping with booked appointments)
      const isAvailable = !bookedAppointments.some(appointment => {
        return (
          (slotStart >= appointment.startTime && slotStart < appointment.endTime) ||
          (slotEnd > appointment.startTime && slotEnd <= appointment.endTime) ||
          (slotStart <= appointment.startTime && slotEnd >= appointment.endTime)
        );
      });
      
      if (isAvailable) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }
    }
    
    return availableSlots;
  } catch (error) {
    void void logger.error('Error fetching available slots:', error);
    return [];
  }
}

/**
 * Cancel an appointment with the specified ID
 * @param appointmentId The ID of the appointment to cancel
 */
export async function cancelAppointment(appointmentId: string) {
  try {
    // Update the appointment status to CANCELLED
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });
    
    // Return success response with the updated appointment
    return {
      success: true,
      data: updatedAppointment,
      message: 'Appointment cancelled successfully',
    };
  } catch (error) {
    void void logger.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel appointment',
      data: null,
    };
  }
}

/**
 * Check if an appointment time slot is available
 * @param artistId The ID of the artist
 * @param startTime The start time of the appointment
 * @param endTime The end time of the appointment (defaults to 1 hour after start time)
 * @param appointmentId Optional ID of an existing appointment to exclude from conflicts
 */
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date | null = null,
  appointmentId: string | null = null
) {
  try {
    // If no end time provided, default to 1 hour after start time
    const effectiveEndTime = endTime ?? addHours(startTime, 1);
    
    // Check for conflicting appointments
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        artist: { id: artistId },
        id: appointmentId ? { not: appointmentId } : undefined,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        OR: [
          {
            // Appointment starts during the requested time slot
            startTime: {
              gte: startTime,
              lt: effectiveEndTime
            }
          },
          {
            // Appointment ends during the requested time slot
            endTime: {
              gt: startTime,
              lte: effectiveEndTime
            }
          },
          {
            // Appointment spans the entire requested time slot
            startTime: {
              lte: startTime
            },
            endTime: {
              gte: effectiveEndTime
            }
          }
        ]
      }
    });
    
    return {
      isAvailable: conflictingAppointments.length === 0,
      conflicts: conflictingAppointments.length > 0 ? conflictingAppointments : null,
    };
  } catch (error) {
    void void logger.error('Error checking appointment availability:', error);
    return {
      isAvailable: false,
      conflicts: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate appointment duration based on tattoo size and complexity
 * @param size The size of the tattoo (small, medium, large, etc.)
 * @param complexity The complexity level of the tattoo design (1-5)
 */
export async function calculateAppointmentDurationWithFallback(
  size: string,
  complexity: number = 3
): Promise<string> {
  try {
    // Implement size-based duration calculation
    let baseHours = 1; // Default base duration
    
    // Calculate base hours based on size
    switch (size.toLowerCase()) {
      case 'small':
        baseHours = 1;
        break;
      case 'medium':
        baseHours = 2;
        break;
      case 'large':
        baseHours = 4;
        break;
      case 'extra-large':
      case 'xl':
        baseHours = 6;
        break;
      case 'full-sleeve':
        baseHours = 8;
        break;
      case 'back-piece':
        baseHours = 10;
        break;
      default:
        baseHours = 2;
    }
    
    // Adjust for complexity (1-5 scale)
    const adjustedComplexity = Math.max(1, Math.min(5, complexity));
    const complexityFactor = 0.8 + (adjustedComplexity * 0.1); // 0.9 to 1.3 complexity factor
    
    // Calculate final duration in hours
    const totalHours = Math.ceil(baseHours * complexityFactor);
    
    return `${totalHours} hour${totalHours !== 1 ? 's' : ''}`;
  } catch (error) {
    void void logger.error('Error calculating appointment duration:', error);
    return '2 hours'; // Default fallback
  }
}

/**
 * Create a new appointment
 * @param params The appointment parameters
 */
export async function createAppointment(params: {
  customer_id: string;
  start_time: string;
  end_time: string;
  service_id: string;
  artist_id?: string;
  notes?: string;
  status?: string;
}) {
  try {
    // Parse dates from ISO strings
    const startTime = parseISO(params.start_time);
    const endTime = parseISO(params.end_time);
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: params.customer_id,
        startTime: startTime,
        endTime: endTime,
        serviceId: params.service_id,
        ...(params.artist_id && { 
          artist: { 
            connect: { id: params.artist_id } 
          } 
        }),
        notes: params.notes,
        status: (params.status as AppointmentStatus) ?? 'PENDING',
      }
    });
    
    // Return success response with the created appointment
    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    void void logger.error('Error creating appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating appointment',
    };
  }
}
