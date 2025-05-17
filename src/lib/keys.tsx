/**
 * React Query key factory functions
 *
 * These functions provide a consistent way to generate query keys
 * for different resources in the application. Using these factories
 * ensures that related queries are properly invalidated when mutations occur.
 */

// Booking-related query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookingKeys.details(), id] as const,
  status: (id: number) => [...bookingKeys.detail(id), 'status'] as const,
  availability: (date?: string) => [...bookingKeys.all, 'availability', date] as const,
};

// Payment-related query keys
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  status: (id: string) => [...paymentKeys.detail(id), 'status'] as const,
  byBooking: (bookingId: number) => [...paymentKeys.all, 'booking', bookingId] as const,
  byAppointment: (appointmentId: string) =>
    [...paymentKeys.all, 'appointment', appointmentId] as const,
  byClient: (clientId: string) => [...paymentKeys.all, 'client', clientId] as const,
};

// Client-related query keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  appointments: (id: string) => [...clientKeys.detail(id), 'appointments'] as const,
  payments: (id: string) => [...clientKeys.detail(id), 'payments'] as const,
  designs: (id: string) => [...clientKeys.detail(id), 'designs'] as const,
};

// Appointment-related query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  status: (id: string) => [...appointmentKeys.detail(id), 'status'] as const,
  byClient: (clientId: string) => [...appointmentKeys.all, 'client', clientId] as const,
  byDate: (date: string) => [...appointmentKeys.all, 'date', date] as const,
  calendar: (month: string) => [...appointmentKeys.all, 'calendar', month] as const,
};

// Email/Marketing-related query keys
export const emailKeys = {
  all: ['emails'] as const,
  campaigns: () => [...emailKeys.all, 'campaigns'] as const,
  campaign: (id: string) => [...emailKeys.campaigns(), id] as const,
  templates: () => [...emailKeys.all, 'templates'] as const,
  template: (id: string) => [...emailKeys.templates(), id] as const,
  stats: () => [...emailKeys.all, 'stats'] as const,
  preview: (templateId: string, data?: unknown) =>
    [...emailKeys.templates(), templateId, 'preview', data] as const,
};

// Admin-related query keys
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  notifications: () => [...adminKeys.all, 'notifications'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
};

// Lead-related query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  magnets: () => [...leadKeys.all, 'magnets'] as const,
  magnet: (id: string) => [...leadKeys.magnets(), id] as const,
};

// CRM-related query keys
export const crmKeys = {
  all: ['crm'] as const,
  contacts: () => [...crmKeys.all, 'contacts'] as const,
  contact: (id: string) => [...crmKeys.contacts(), id] as const,
  companies: () => [...crmKeys.all, 'companies'] as const,
  company: (id: string) => [...crmKeys.companies(), id] as const,
  opportunities: () => [...crmKeys.all, 'opportunities'] as const,
  opportunity: (id: string) => [...crmKeys.opportunities(), id] as const,
};
