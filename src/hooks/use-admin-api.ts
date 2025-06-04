'use client';

import { useQuery } from '@tanstack/react-query';

// Types
interface BookingStatus {
  status: string;
  count: number;
}

interface AdminStats {
  totalBookings: number;
  totalCustomers: number;
  totalDesigns: number;
  approvedDesigns: number;
  pendingDesigns: number;
  confirmedBookings: number;
  estimatedRevenue: number;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tattooType: string;
  size: string | null;
  placement: string | null;
  preferredDate: Date;
  status: string;
  createdAt: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: Date;
}

interface AdminDashboardData {
  stats: AdminStats;
  bookingsByStatus: BookingStatus[];
  recentBookings: Booking[];
  recentContacts: Contact[];
}

interface BookingsResponse {
  bookings: Booking[];
  nextCursor: string | null;
  totalCount: number;
}

// API functions
async function fetchAdminDashboard(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<AdminDashboardData> {
  const searchParams = new URLSearchParams();
  
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`/api/admin?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard data');
  }
  
  return response.json();
}

async function fetchBookings(params: {
  limit?: number;
  cursor?: string;
  status?: string;
} = {}): Promise<BookingsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.status) searchParams.set('status', params.status);

  const response = await fetch(`/api/bookings?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  
  return response.json();
}

// Hooks
export function useAdminDashboard(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['admin-dashboard', params],
    queryFn: () => fetchAdminDashboard(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useBookings(params: {
  limit?: number;
  cursor?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => fetchBookings(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}