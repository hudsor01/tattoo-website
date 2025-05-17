/**
 * Shared constants for Supabase E2E tests
 */

// Test data prefixes to isolate test data
export const TEST_PREFIX = 'supabase_test_';

// Test customer data
export const TEST_CUSTOMER = {
  firstName: 'Supabase',
  lastName: 'TestCustomer',
  email: 'supabase-test-customer@example.com',
  phone: '5551234567',
};

// Test booking data
export const TEST_BOOKING = {
  name: 'Supabase Test Booking',
  email: 'supabase-test-booking@example.com',
  phone: '5551234567',
  tattooType: 'custom',
  size: 'medium',
  placement: 'arm',
  description: 'Test booking created by Supabase E2E test',
  preferredTime: 'afternoon',
  paymentMethod: 'card',
};

// Test payment data
export const TEST_PAYMENT = {
  amount: 100,
  paymentMethod: 'card',
  status: 'pending',
};

// Routes for testing
export const ROUTES = {
  home: '/',
  booking: '/booking',
  gallery: '/gallery',
  admin: {
    dashboard: '/admin/dashboard',
    customers: '/admin/dashboard/customers',
    appointments: '/admin/dashboard/appointments',
    payments: '/admin/dashboard/payments',
  },
};
