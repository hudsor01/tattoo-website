/**
 * Database Functions
 * 
 * This module provides functions for interacting with database functions.
 */

import { createClient } from './supabase/server';

/**
 * Types for function parameters and responses
 */

export type Availability = {
  start_time: string;
  end_time: string;
  available: boolean;
};

export type CheckAvailabilityParams = {
  date: string;
  duration_minutes?: number;
  artist_id?: string;
};

export type CreateAppointmentParams = {
  customer_id: string;
  artist_id?: string;
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
};

export type AppointmentResponse = {
  appointment_id?: string;
  success?: boolean;
  error?: string;
};

export type AvailabilityResponse = {
  slots?: Availability[];
  error?: string;
};

/**
 * Type for conflicting appointments
 */
export type ConflictingAppointment = {
  appointment_id: string;
  start_time: string;
  end_time: string;
  artist_id: string;
  customer_id?: string;
  status?: string;
};

/**
 * Check availability for appointments on a given date
 */
export async function checkAvailability(
  params: CheckAvailabilityParams
): Promise<AvailabilityResponse> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('check_availability', {
      p_date: params.date,
      p_duration_minutes: params.duration_minutes || 60,
      p_artist_id: params.artist_id || null,
    });
    
    if (error) {
      console.error('Error checking availability:', error);
      return { error: error.message };
    }
    
    return { slots: data };
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  params: CreateAppointmentParams
): Promise<AppointmentResponse> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('create_appointment', {
      p_customer_id: params.customer_id,
      p_artist_id: params.artist_id || null,
      p_service_id: params.service_id,
      p_start_time: params.start_time,
      p_end_time: params.end_time,
      p_notes: params.notes || '',
      p_status: params.status || 'scheduled',
    });
    
    if (error) {
      console.error('Error creating appointment:', error);
      return { error: error.message };
    }
    
    return {
      appointment_id: data,
      success: true,
    };
  } catch (error) {
    console.error('Error in createAppointment:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<AppointmentResponse> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.rpc('cancel_appointment', {
      p_appointment_id: appointmentId,
    });
    
    if (error) {
      console.error('Error cancelling appointment:', error);
      return { error: error.message };
    }
    
    return {
      appointment_id: appointmentId,
      success: true,
    };
  } catch (error) {
    console.error('Error in cancelAppointment:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get available time slots for a given date
 */
export async function getAvailableTimeSlots(
  date: string,
  duration_minutes: number = 60,
  artist_id?: string
): Promise<AvailabilityResponse> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('get_available_time_slots', {
      p_date: date,
      p_duration_minutes: duration_minutes,
      p_artist_id: artist_id || null,
    });
    
    if (error) {
      console.error('Error getting available time slots:', error);
      return { error: error.message };
    }
    
    return { slots: data };
  } catch (error) {
    console.error('Error in getAvailableTimeSlots:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if an appointment time is available
 */
export async function checkAppointmentAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date,
  appointmentId?: string
): Promise<{ available: boolean; conflicting_appointments?: ConflictingAppointment[] }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('check_appointment_availability', {
      p_artist_id: artistId,
      p_start_time: startTime.toISOString(),
      p_end_time: endTime.toISOString(),
      p_appointment_id: appointmentId || null
    });
    
    if (error) {
      console.error('Error checking appointment availability:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkAppointmentAvailability:', error);
    throw error;
  }
}

/**
 * Calculate appointment duration based on tattoo size and complexity
 */
export async function calculateAppointmentDuration(
  size: string,
  complexity: number = 3
): Promise<string> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('calculate_appointment_duration', {
      p_size: size,
      p_complexity: complexity
    });
    
    if (error) {
      console.error('Error calculating appointment duration:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error in calculateAppointmentDuration:', error);
    throw error;
  }
}