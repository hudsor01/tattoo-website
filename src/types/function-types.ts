export type AppointmentAvailabilityResult = {
  is_available: boolean;
  conflicts: unknown[] | null;
  error?: string;
};

export type PricingBreakdown = {
  base_hourly_rate: number;
  estimated_hours: number;
  size_factor: number;
  placement_factor: number;
  complexity_factor: number;
  total_price: number;
  deposit_amount: number;
};

export type CustomerValidationResult = {
  is_valid: boolean;
  errors: string[];
  normalized_data: {
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    birthdate: Date | null;
  };
  potential_duplicates: Array<{
    customer_id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    birthdate: Date | null;
  }> | null;
};

export type CancellationPolicyResult = {
  success: boolean;
  error?: string;
  appointment_id?: string;
  cancellation_date?: Date;
  days_notice?: number;
  reason_code?: string;
  policy_applied?: string;
  fee_percentage?: number;
  fee_amount?: number;
  deposit_refundable?: boolean;
  allow_reschedule?: boolean;
};

export type AppointmentScheduleResult = {
  success: boolean;
  error?: string;
  conflicts?: unknown[];
  appointment_id?: string;
  start_date?: Date;
  end_date?: Date;
  deposit?: number;
  total_price?: number;
  pricing_details?: PricingBreakdown;
};

export type CustomerLtv = {
  customer_id: string;
  total_spent: number;
  appointment_count: number;
  first_appointment: Date | null;
  last_appointment: Date | null;
  relationship_days: number;
  avg_appointment_value: number;
  frequency_days: number;
  projected_annual_value: number;
};

export type ArtistPerformanceMetrics = {
  artist_id: string;
  artist_name: string;
  date_range: {
    start_date: Date;
    end_date: Date;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    no_show: number;
    completion_rate: number;
  };
  revenue: {
    total: number;
    avg_per_appointment: number;
  };
  utilization: {
    hours_booked: number;
    hours_available: number;
    utilization_rate: number;
  };
};

export type BusinessDashboardMetrics = {
  date_range: {
    start_date: Date;
    end_date: Date;
  };
  revenue: {
    total: number;
    deposits: number;
    avg_ticket: number;
  };
  customers: {
    new: number;
  };
  appointments: {
    total: number;
    cancellation_rate: number;
  };
  top_artists: Array<{
    artist_id: string;
    artist_name: string;
    appointments: number;
    revenue: number;
  }>;
};

export type CustomerSearchResult = {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birthdate: Date | null;
};
