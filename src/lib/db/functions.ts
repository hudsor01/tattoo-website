import { executeStoredProcedure } from './prisma';

export async function getAvailableSlots() {
  return [];
}

export async function cancelAppointment(appointmentId: string) {
  try {
    const result = await executeStoredProcedure('cancel_appointment', [appointmentId]);
    return {
      success: true,
      data: result,
      message: 'Appointment cancelled successfully'
    };
  } catch (error) {
    void console.error('Error cancelling appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel appointment',
      data: null
    };
  }
}

/**
 * Check if an appointment time slot is available
 */
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date | null = null,
  appointmentId: string | null = null
) {
  try {
    const result = await executeStoredProcedure('check_appointment_availability', [
      artistId,
      startTime,
      endTime,
      appointmentId
    ]);
    return result;
  } catch (error) {
    void console.error('Error checking appointment availability:', error);
    return {
      isAvailable: false,
      conflicts: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculate appointment duration with fallback - alternative to calculateAppointmentDuration
 */
export async function calculateAppointmentDurationWithFallback(
  size: string,
  complexity: number = 3
): Promise<string> {
  try {
    const result = await executeStoredProcedure<{ duration: string }>(
      'calculate_appointment_duration',
      [size, complexity]
    );
    return result.duration ?? '2 hours';
  } catch (error) {
    void console.error('Error calculating appointment duration:', error);
    return '2 hours'; // Default fallback
  }
}

/**
 * Create a new appointment
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
    const result = await executeStoredProcedure('create_appointment', [
      params.customer_id,
      params.start_time,
      params.end_time,
      params.service_id,
      params.artist_id ?? null,
      params.notes ?? null,
      params.status ?? 'scheduled'
    ]);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    void console.error('Error creating appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating appointment'
    };
  }
}