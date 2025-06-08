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

// Analytics Types
interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  conversionRate: number;
  averageBookingValue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  revenueGrowth: number;
  bookingGrowth: number;
}

interface ServiceDistribution {
  services: Array<{
    name: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  totalBookings: number;
}

interface BookingTimeAnalysis {
  hourlyDistribution: Array<{
    hour: number;
    count: number;
    label: string;
  }>;
  dailyDistribution: Array<{
    day: string;
    count: number;
    percentage: number;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  totalAnalyzed: number;
}

// Payment Types
interface PaymentRecord {
  id: string;
  bookingId: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  description: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  totalTransactions: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
}

interface PaymentsResponse {
  payments: PaymentRecord[];
  stats: PaymentStats;
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    total: number;
  };
}

// Health Status Types
interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  buildTime: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
    external?: HealthCheckResult;
  };
  metadata?: {
    nodeVersion: string;
    platform: string;
    processId: number;
  };
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

// Analytics API functions
async function fetchDashboardMetrics(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<DashboardMetrics> {
  const searchParams = new URLSearchParams();
  
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`/api/admin/analytics/dashboard?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard metrics');
  }
  
  return response.json();
}

async function fetchServiceDistribution(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<ServiceDistribution> {
  const searchParams = new URLSearchParams();
  
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`/api/admin/analytics/services?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch service distribution');
  }
  
  return response.json();
}

async function fetchBookingTimeAnalysis(params: {
  startDate?: string;
  endDate?: string;
} = {}): Promise<BookingTimeAnalysis> {
  const searchParams = new URLSearchParams();
  
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`/api/admin/analytics/booking-times?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch booking time analysis');
  }
  
  return response.json();
}

// Health Status API function
async function fetchHealthStatus(): Promise<HealthStatus> {
  const response = await fetch('/api/health');
  
  if (!response.ok) {
    throw new Error('Failed to fetch health status');
  }
  
  return response.json();
}

// Payments API function
async function fetchPayments(params: {
  limit?: number;
  cursor?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<PaymentsResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.cursor) searchParams.set('cursor', params.cursor);
  if (params.status) searchParams.set('status', params.status);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const response = await fetch(`/api/admin/payments?${searchParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments data');
  }
  
  const result = await response.json();
  return result.data;
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

// Analytics Hooks
export function useDashboardMetrics(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['dashboard-metrics', params],
    queryFn: () => fetchDashboardMetrics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useServiceDistribution(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['service-distribution', params],
    queryFn: () => fetchServiceDistribution(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBookingTimeAnalysis(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['booking-time-analysis', params],
    queryFn: () => fetchBookingTimeAnalysis(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Health Status Hook
export function useHealthStatus() {
  return useQuery({
    queryKey: ['health-status'],
    queryFn: fetchHealthStatus,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Payments Hook
export function usePayments(params: {
  limit?: number;
  cursor?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => fetchPayments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Recent Appointments Hook for Dashboard
export function useRecentAppointments(params: {
  limit?: number;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ['recent-appointments', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', String(params.limit ?? 5));
      searchParams.set('page', '1');
      if (params.status) searchParams.set('status', params.status);

      const response = await fetch(`/api/admin/appointments?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent appointments');
      }
      
      const data = await response.json();
      return data.appointments;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}