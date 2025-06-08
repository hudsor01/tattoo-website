/**
 * Booking-related constants
 * Consolidated from VirtualizedappointmentsList components
 */

export const BOOKING_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
  'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
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
