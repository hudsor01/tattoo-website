'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface CreateBookingData {
  name: string;
  email: string;
  phone?: string;
  tattooType: string;
  size?: string;
  placement?: string;
  description?: string;
  preferredDate: string; // ISO date string
  preferredTime?: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tattooType: string;
  size: string | null;
  placement: string | null;
  description: string | null;
  preferredDate: Date;
  preferredTime: string | null;
  status: string;
  source: string;
  createdAt: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
}

// API functions
async function createBooking(data: CreateBookingData): Promise<Booking> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to create booking');
  }
  
  return response.json();
}

// Hooks
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate admin queries to show new booking
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}