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
export type AppointmentStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

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