'use client';

import { useState } from 'react';
import {
  createAppointment,
  getAvailableSlots,
  checkIsAdmin,
  type CreateAppointmentParams,
  type AppointmentResponse,
  type AvailableSlotsResponse,
} from '@/lib/supabase/database-functions';

/**
 * Hook for accessing database functions with loading and error states
 *
 * @example
 * const {
 *   createAppointment,
 *   getAvailableSlots,
 *   checkIsAdmin,
 *   loading,
 *   error
 * } = useDatabaseFunctions();
 *
 * // Use the functions
 * const handleCreateAppointment = async () => {
 *   const result = await createAppointment({
 *     customer_id: 123,
 *     start_date: '2025-05-10T10:00:00',
 *     end_date: '2025-05-10T11:00:00',
 *     service_type: 'consultation',
 *   });
 *
 *   if (result.success) {
 *     console.log('Appointment created with ID:', result.appointment_id);
 *   } else {
 *     console.error('Failed to create appointment:', result.error);
 *   }
 * };
 */
export function useDatabaseFunctions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Wrapper for createAppointment with loading state
  const createAppointmentWithState = async (
    params: CreateAppointmentParams
  ): Promise<AppointmentResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await createAppointment(params);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for getAvailableSlots with loading state
  const getAvailableSlotsWithState = async (
    date: string,
    duration_minutes: number = 60
  ): Promise<AvailableSlotsResponse> => {
    try {
      setLoading(true);
      setError(null);
      return await getAvailableSlots(date, duration_minutes);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Wrapper for checkIsAdmin with loading state
  const checkIsAdminWithState = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await checkIsAdmin();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAppointment: createAppointmentWithState,
    getAvailableSlots: getAvailableSlotsWithState,
    checkIsAdmin: checkIsAdminWithState,
    loading,
    error,
    // Reset error state
    clearError: () => setError(null),
  };
}
