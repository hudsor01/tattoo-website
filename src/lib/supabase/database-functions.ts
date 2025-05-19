/**
 * Database Functions for Tattoo Shop Management
 *
 * This module provides functions for interacting with database functions
 * on the Supabase backend for appointment booking and management.
 */

import { createClient } from './server';

// Define UserLike type directly instead of importing it
interface UserLike {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
}

// We'll use dynamic imports for next/headers to prevent client-side errors

/**
 * Types for appointment creation
 */
export type CreateAppointmentParams = {
  customer_id: number | string;
  start_date: string;
  end_date: string;
  service_type: string;
  notes?: string;
  deposit_required?: boolean;
  deposit_amount?: number;
};

export type AppointmentResponse = {
  appointment_id?: string;
  error?: string;
  success?: boolean;
};

export type AvailableSlotsResponse = {
  available_slots?: { start_time: string; end_time: string }[];
  error?: string;
};

/**
 * Creates a new appointment using the database function
 */
export async function createAppointment(
  params: CreateAppointmentParams,
): Promise<AppointmentResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('create_appointment', {
      p_customer_id: params.customer_id,
      p_start_date: params.start_date,
      p_end_date: params.end_date,
      p_service_type: params.service_type,
      p_notes: params.notes || '',
      p_deposit_required: params.deposit_required || false,
      p_deposit_amount: params.deposit_amount || 0,
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
 * Gets available appointment slots for a given date
 */
export async function getAvailableSlots(
  date: string,
  duration_minutes: number = 60,
): Promise<AvailableSlotsResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_available_slots', {
      p_date: date,
      p_duration_minutes: duration_minutes,
    });

    if (error) {
      console.error('Error getting available slots:', error);
      return { error: error.message };
    }

    return {
      available_slots: data,
    };
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Add this interface before the checkIsAdmin function
interface CheckUserIsAdminParams {
  p_user_id: string;
}

/**
 * Checks if the current user has admin privileges
 * This function works in both client and server contexts
 */
export async function checkIsAdmin(user?: UserLike): Promise<boolean> {
  try {
    const supabase =
      (await createClient()) as import('@supabase/supabase-js').SupabaseClient<unknown>;

    // If user is provided, use it directly, otherwise fetch from auth
    let userId: string | undefined;

    if (user && user.id) {
      // User object was passed in
      userId = user.id;
    } else {
      // No user provided, try to get the current user
      const {
        data: { user: authUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !authUser) {
        return false;
      }

      userId = authUser.id;
    }

    // Then check for admin role
    if (!userId) {
      return false;
    }
    const { data, error } = await supabase.rpc<boolean, CheckUserIsAdminParams>('check_user_is_admin', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
}
