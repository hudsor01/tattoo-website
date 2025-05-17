'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { isBefore, addDays } from 'date-fns';
import { useErrorHandling } from '@/hooks/use-error-handling';

export function useAppointmentCancellation() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const utils = trpc.useUtils();
  const cancelMutation = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      // Invalidate the appointments query to refresh data
      utils.appointments.getAll.invalidate();
      utils.appointments.getById.invalidate();
      
      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been successfully cancelled.',
        variant: 'default',
      });
    },
    onError: (err) => {
      console.error('Error cancelling appointment:', err);
      setError(err.message || 'Failed to cancel appointment');
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  /**
   * Check if appointment can be cancelled (more than 48 hours before start)
   */
  const canCancelAppointment = (appointmentDate: Date): boolean => {
    const today = new Date();
    // Allow cancellation only if appointment is more than 48 hours away
    return isBefore(today, addDays(appointmentDate, -2));
  };
  
  /**
   * Cancel an appointment
   */
  const cancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await cancelMutation.mutateAsync({ 
        id: appointmentId, 
        reason: reason 
      });
      
      return true;
    } catch (err) {
      // Error handling is done in the mutation's onError
      return false;
    }
  };
  
  return {
    cancelAppointment,
    canCancelAppointment,
    isLoading,
    error
  };
}