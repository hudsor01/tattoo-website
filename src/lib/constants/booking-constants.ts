/**
 * Booking-related constants
 * Consolidated from VirtualizedappointmentsList components
 */

export const BOOKING_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-fernando-gradient/10 text-fernando-red border-fernando-red/20',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  'in-progress': 'bg-fernando-gradient/20 text-fernando-orange border-fernando-orange/30',
  'no-show': 'bg-steel/10 text-steel border-steel/20',
} as const;

export type appointmentstatus = keyof typeof BOOKING_STATUS_COLORS;

export const BOOKING_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'no-show', label: 'No Show' },
] as const;

export const BOOKING_SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
] as const;

/**
 * Gets the CSS classes for a booking status
 * @param status - Booking status
 * @returns CSS classes for styling the status badge
 */
export function getappointmentstatusClasses(status: string): string {
  return BOOKING_STATUS_COLORS[status as appointmentstatus] ?? 'bg-gray-100 text-gray-800';
}
