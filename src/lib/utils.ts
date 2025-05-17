/**
 * Server-side utilities
 * 
 * This is a server-only file and should not be imported in client components.
 * For client-safe utilities, import from '@/utils' instead.
 */

// Re-export all server-side utilities
export * from './utils/server';

// Common utilities that are safe on both client and server
export * from './utils/common';

// Format utilities that are safe on both client and server
import * as formatUtils from './utils/format';

// Date utilities that are safe on both client and server
import * as dateUtils from './utils/date';

// Image utilities 
export * from './utils/image';

// Export utilities with namespace to avoid conflicts
export { formatUtils, dateUtils };

// Export individual functions with renamed versions
export const formatCurrency = formatUtils.formatCurrency;
export const formatPhoneNumber = formatUtils.formatPhoneNumber;

// Rename the conflicting formatDate functions
export const formatDisplayDate = formatUtils.formatDate; // Basic date formatter
export const formatDateWithOptions = dateUtils.formatDate; // Advanced date formatter with options
