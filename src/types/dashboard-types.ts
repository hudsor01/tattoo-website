/**
 * Dashboard Types
 *
 * Centralized type definitions for dashboard-related functionality.
 * This file consolidates all schemas and types used in the dashboard router.
 */

import { z } from 'zod';

// ===== ZOD SCHEMAS =====

/**
 * Schema for dashboard statistics filtering
 */
export const StatsFilterSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
  compareToPrevious: z.boolean().optional().default(true),
});

export type StatsFilterInput = z.infer<typeof StatsFilterSchema>;

/**
 * Schema for appointments filtering
 */
export const AppointmentsFilterSchema = z.object({
  status: z
    .enum(['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .optional()
    .default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AppointmentsFilterInput = z.infer<typeof AppointmentsFilterSchema>;

/**
 * Schema for payments filtering
 */
export const PaymentsFilterSchema = z.object({
  status: z.enum(['all', 'verified', 'pending', 'failed']).optional().default('all'),
  limit: z.number().min(1).max(50).optional().default(5),
  page: z.number().min(1).optional().default(1),
  period: z.enum(['all', 'today', 'week', 'month', 'year']).optional().default('all'),
});

export type PaymentsFilterInput = z.infer<typeof PaymentsFilterSchema>;

/**
 * Schema for recent bookings query
 */
export const RecentBookingsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  cursor: z.number().optional(),
  status: z.string().optional(),
});

export type RecentBookingsInput = z.infer<typeof RecentBookingsSchema>;

/**
 * Schema for recent contacts query
 */
export const RecentContactsSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
});

export type RecentContactsInput = z.infer<typeof RecentContactsSchema>;

/**
 * Schema for recent activity query
 */
export const RecentActivitySchema = z.object({
  limit: z.number().min(1).max(50).optional().default(5),
});

export type RecentActivityInput = z.infer<typeof RecentActivitySchema>;

/**
 * Schema for notifications query
 */
export const NotificationsSchema = z.object({
  limit: z.number().min(1).max(50).optional().default(5),
});

export type NotificationsInput = z.infer<typeof NotificationsSchema>;

// ===== EXISTING TYPES (LEGACY COMPATIBILITY) =====

export interface PaymentWithAmount {
  id: number;
  amount: number;
  createdAt?: Date;
  status?: string;
  bookingId?: number;
  customerEmail?: string;
  customerName?: string;
}

/**
 * Stats Period options for filtering dashboard data
 */
export type StatsPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

/**
 * Appointment Status type for filtering
 */
export type AppointmentStatus =
  | 'all'
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * Payment Status type for filtering
 */
export type PaymentStatus = 'all' | 'verified' | 'pending' | 'failed';

/**
 * Stats Filter options
 */
export interface StatsFilter {
  period: StatsPeriod;
  compareToPrevious: boolean;
}

/**
 * Appointments Filter options
 */
export interface AppointmentsFilter {
  status: AppointmentStatus;
  limit: number;
  page: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Payments Filter options
 */
export interface PaymentsFilter {
  status: PaymentStatus;
  limit: number;
  page: number;
  period: StatsPeriod;
}

/**
 * Dashboard Stat Card
 */
export interface DashboardStatCard {
  title: string;
  value: string;
  change: string;
  description: string;
  color: string;
  icon: string;
  link: string;
}

/**
 * Dashboard Summary data
 */
export interface DashboardSummary {
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    period: number;
    change: number;
  };
  customers: {
    total: number;
    new: number;
    change: number;
  };
  revenue: {
    period: number;
    previous: number;
    change: number;
  };
  completionRate: number;
  period: {
    label: string;
    start: string;
    end: string;
  };
}

/**
 * Dashboard Stats for InteractiveCharts component
 */
export interface DashboardStats {
  summary: DashboardSummary;
}

/**
 * Service Statistics for chart display
 */
export interface ServiceStat {
  name: string;
  value: number;
  color?: string;
}

/**
 * Time Statistics for chart display
 */
export interface TimeStatItem {
  name: string;
  bookings: number;
}

// ===== NEW COMPREHENSIVE TYPES =====

/**
 * Dashboard statistics summary
 */
export interface DashboardStatsSummary {
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
    period: number;
    change: number;
  };
  customers: {
    total: number;
    new: number;
    change: number;
  };
  revenue: {
    period: number;
    previous: number;
    change: number;
  };
  completionRate: number;
  period: {
    label: string;
    start: string;
    end: string;
  };
}

/**
 * Dashboard stats response type
 */
export interface DashboardStatsResponse {
  stats: DashboardStatCard[];
  summary: DashboardStatsSummary;
  totalCustomers: number;
  pendingBookings: number;
  completedAppointments: number;
  recentMessages: number;
}

/**
 * Formatted appointment for dashboard display
 */
export interface DashboardAppointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  customerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  depositPaid: boolean;
  depositAmount: number;
  price: number;
  description: string;
}

/**
 * Pagination information for dashboard queries
 */
export interface DashboardPagination {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/**
 * Dashboard appointments response
 */
export interface DashboardAppointmentsResponse {
  appointments: DashboardAppointment[];
  pagination: DashboardPagination;
}

/**
 * Formatted payment for dashboard display
 */
export interface DashboardPayment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  date: string;
  customerId: string;
  clientName: string;
  clientEmail: string;
  appointmentId: string;
  appointmentTitle: string | null;
  bookingId: string | null;
}

/**
 * Dashboard payments response
 */
export interface DashboardPaymentsResponse {
  payments: DashboardPayment[];
  pagination: DashboardPagination;
  totalAmount: number;
}

/**
 * Formatted booking for dashboard display
 */
export interface DashboardBooking {
  id: number;
  customerId: string;
  appointmentId: null;
  name: string;
  email: string;
  tattooType: string | null;
  size: string | null;
  placement: string | null;
  description: string | null;
  estimatedPrice: null;
  preferredDate: string | undefined;
  status: string;
  depositPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
  Customer: null;
}

/**
 * Dashboard bookings response
 */
export interface DashboardBookingsResponse {
  bookings: DashboardBooking[];
  nextCursor: number | null;
  totalCount: number;
}

/**
 * Weekly booking chart data point
 */
export interface WeeklyBookingDataPoint {
  name: string;
  bookings: number;
}

/**
 * Service distribution chart data point
 */
export interface ServiceDistributionDataPoint {
  name: string;
  value: number;
  color: string;
}

/**
 * Contact for dashboard display
 */
export interface DashboardContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

/**
 * Activity item for dashboard feed
 */
export interface DashboardActivity {
  id: string;
  type: 'booking' | 'appointment';
  message: string;
  timestamp: string;
}

/**
 * Notification item for dashboard
 */
export interface DashboardNotification {
  id: string;
  type: 'appointment' | 'payment' | 'customer' | 'completed';
  title: string;
  message: string;
  time: string;
  status?: string;
  link?: string;
}

/**
 * Dashboard notifications response
 */
export interface DashboardNotificationsResponse {
  notifications: DashboardNotification[];
  activity: DashboardNotification[];
}

/**
 * Appointment confirmation response
 */
export interface AppointmentConfirmationResponse {
  success: boolean;
  appointment: {
    id: string;
    status: string;
    updatedAt: Date;
  };
}

// ===== HELPER TYPE DEFINITIONS =====

/**
 * Dashboard period options
 */
export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

/**
 * Chart colors array type
 */
export type ChartColors = readonly string[];

/**
 * Date range for filtering
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Previous period date range
 */
export interface PreviousDateRange {
  startDate: Date;
  endDate: Date;
}
