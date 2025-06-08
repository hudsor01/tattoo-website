/**
 * Shared customer utility functions
 * Consolidated from multiple customer management components
 */

import { formatCurrency } from './date-format';

interface CustomerData {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  zipCode?: string | null;
  totalSpent?: number;
}

/**
 * Gets display name for a customer
 * @param customer - Customer data object
 * @returns Formatted customer name or 'Unknown Customer' if no name available
 */
export function getCustomerName(customer: CustomerData): string {
  const firstName = customer.firstName ?? '';
  const lastName = customer.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Unknown Customer';
}

/**
 * Formats currency amount for display with customer-specific defaults
 * @param totalSpent - Amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCustomerCurrency(totalSpent: number | undefined): string {
  if (typeof totalSpent !== 'number' || isNaN(totalSpent)) return '$0.00';
  return formatCurrency(totalSpent); // Use standard currency formatting
}

/**
 * Gets full address string for a customer
 * @param customer - Customer data object
 * @returns Formatted address string or 'Not provided' if no address
 */
export function getCustomerAddress(customer: CustomerData): string {
  const addressParts = [
    customer.address,
    customer.city,
    customer.state,
    customer.postalCode ?? customer.zipCode,
  ].filter(Boolean);

  return addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';
}

/**
 * Gets customer initials for avatar display
 * @param customer - Customer data object
 * @returns Customer initials (e.g., "JD" for John Doe)
 */
export function getCustomerInitials(customer: CustomerData): string {
  const firstName = customer.firstName ?? '';
  const lastName = customer.lastName ?? '';

  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
}
