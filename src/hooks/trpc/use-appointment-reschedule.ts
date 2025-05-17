'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';

export function useAppointmentReschedule() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const rescheduleMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      // Invalidate the appointments query to refresh data
      utils.appointments.getAll.invalidate();
      utils.appointments.getById.invalidate();

      toast({
        title: 'Appointment Rescheduled',
        description: 'Your appointment has been successfully rescheduled.',
        variant: 'default',
      });
    },
    onError: err => {
      console.error('Error rescheduling appointment:', err);
      setError(err.message || 'Failed to reschedule appointment');

      toast({
        title: 'Error',
        description: err.message || 'Failed to reschedule appointment. Please try again.',
        variant: 'error',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  /**
   * Reschedule an appointment
   */
  const rescheduleAppointment = async (
    appointmentId: string,
    newStartDate: Date,
    newEndDate: Date,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      await rescheduleMutation.mutateAsync({
        id: appointmentId,
        start_date: newStartDate,
        end_date: newEndDate,
      });

      return true;
    } catch {
      // Error handling is done in the mutation's onError
      return false;
    }
  };

  return {
    rescheduleAppointment,
    isLoading,
    error,
  };
}
