/**
 * Core query keys and utilities for React Query
 * 
 * This module establishes standard query keys for different resources
 * to ensure consistency across the application.
 */

/**
 * Standard query keys for resources in the application
 */
export const QUERY_KEYS = {
  // User-related
  USER: 'user',
  USER_PROFILE: 'user_profile',
  USER_SETTINGS: 'user_settings',
  
  // Auth
  AUTH: 'auth',
  AUTH_SESSION: 'auth_session',
  
  // Booking and appointments
  BOOKINGS: 'bookings',
  APPOINTMENTS: 'appointments',
  AVAILABILITY: 'availability',
  
  // Gallery and designs
  GALLERY: 'gallery',
  DESIGNS: 'designs',
  
  // Payments and transactions
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  TRANSACTIONS: 'transactions',
  
  // Admin dashboard
  ADMIN: 'admin',
  DASHBOARD: 'dashboard',
  STATS: 'stats',
  METRICS: 'metrics',
  
  // Customers
  CUSTOMERS: 'customers',
  CLIENTS: 'clients',
  CONTACTS: 'contacts',
  
  // Services and products
  SERVICES: 'services',
  PRODUCTS: 'products',
  PRICING: 'pricing',
  
  // Email and communications
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages',
  
  // Analytics
  ANALYTICS: 'analytics',
  PAGE_VIEWS: 'page_views',
  EVENTS: 'events',
};

/**
 * Creates a nested query key from multiple parts
 */
export function createQueryKey(...parts: (string | number)[]) {
  return parts.filter(Boolean);
}

/**
 * Creates a prefixed query key for a resource
 */
export function createPrefixedQueryKey(prefix: string, ...parts: (string | number)[]) {
  return [prefix, ...parts.filter(Boolean)];
}

/**
 * Default stale times for different types of data
 */
export const STALE_TIMES = {
  FREQUENT: 1000 * 60 * 1, // 1 minute
  STANDARD: 1000 * 60 * 5, // 5 minutes
  EXTENDED: 1000 * 60 * 15, // 15 minutes
  LONG: 1000 * 60 * 60, // 1 hour
  VERY_LONG: 1000 * 60 * 60 * 24, // 24 hours
};