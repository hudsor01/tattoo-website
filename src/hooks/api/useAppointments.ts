'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import type { 
  Appointment, 
  AppointmentCreateRequest
} from '@/types/booking-types';
import { useErrorHandling } from '@/hooks/use-error-handling';

/**
 * Hook for managing appointments
 */
export function useAppointments(options?: {
  limit?: number;
  userType?: 'customer' | 'artist';
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Default options
  const { 
    limit = 10, 
    userType = 'customer' 
  } = options || {};

  // Fetch appointments
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', limit, userType],
    queryFn: async () => {
      const { data } = await axios.get<{ appointments: Appointment[] }>(
        `/api/appointments?limit=${limit}&userType=${userType}`
      );
      return data.appointments;
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: AppointmentCreateInput) => {
      setIsSubmitting(true);
      try {
        const { data } = await axios.post('/api/appointments', appointmentData);
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment scheduled successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to schedule appointment';
      toast.error(message);
    },
  });

  // Check availability
  const checkAvailability = async (
    artistId: string,
    startDate: Date,
    endDate?: Date
  ): Promise<boolean> => {
    try {
      const params = new URLSearchParams({
        artistId,
        startDate: startDate.toISOString(),
      });
      
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      
      const response = await axios.head(`/api/appointments?${params.toString()}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      setIsSubmitting(true);
      try {
        const { data } = await axios.delete(`/api/appointments/${appointmentId}`);
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to cancel appointment';
      toast.error(message);
    },
  });

  // Reschedule appointment mutation
  const rescheduleAppointmentMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      startDate,
      endDate,
    }: {
      appointmentId: string;
      startDate: Date;
      endDate?: Date;
    }) => {
      setIsSubmitting(true);
      try {
        const { data } = await axios.patch(`/api/appointments/${appointmentId}`, {
          startDate,
          endDate,
        });
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment rescheduled successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to reschedule appointment';
      toast.error(message);
    },
  });

  return {
    // Queries
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    isError: appointmentsQuery.isError,
    error: appointmentsQuery.error,
    isSubmitting,
    
    // Functions
    checkAvailability,
    createAppointment: createAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    rescheduleAppointment: rescheduleAppointmentMutation.mutate,
    
    // Refetch
    refetch: appointmentsQuery.refetch,
  };
}