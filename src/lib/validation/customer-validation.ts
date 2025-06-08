/**
 * Shared customer validation utilities
 * Consolidated from CustomersInfinite, CustomersModern, and CustomersOptimistic
 */

import { toast } from 'sonner';

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
}

/**
 * Validates customer input data
 * @param customer - Customer data to validate
 * @returns true if valid, false if validation fails (with toast error message)
 */
export function validateCustomerInput(customer: CustomerInput): boolean {
  // Validate required fields
  if (customer.firstName?.trim()) {
    void toast.error('First name is required');
    return false;
  }

  if (customer.lastName?.trim()) {
    void toast.error('Last name is required');
    return false;
  }

  if (customer.email?.trim()) {
    void toast.error('Email is required');
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer.email)) {
    void toast.error('Please enter a valid email address');
    return false;
  }

  return true;
}

/**
 * Sanitizes customer input data for API submission
 * @param customer - Raw customer input
 * @returns Sanitized customer data object
 */
export function sanitizeCustomerInput(customer: CustomerInput) {
  return {
    firstName: customer.firstName.trim(),
    lastName: customer.lastName.trim(),
    email: customer.email.trim().toLowerCase(),
    phone: customer.phone?.trim() ?? undefined,
    address: customer.address?.trim() ?? undefined,
    city: customer.city?.trim() ?? undefined,
    state: customer.state?.trim() ?? undefined,
    zipCode: customer.zipCode?.trim() ?? undefined,
    notes: customer.notes?.trim() ?? undefined,
  };
}

/**
 * Creates empty customer input object
 * @returns Empty customer input with all fields as empty strings
 */
export function createEmptyCustomerInput(): CustomerInput {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  };
}
