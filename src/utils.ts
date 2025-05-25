/**
 * Client-safe utilities
 * This file exports utilities that are safe to use in both client and server components.
 */

// Re-export styling utilities
export { cn, parseColorVar } from './lib/utils/styling';

// Export common utilities
export * from './lib/utils/common';

// Export formatting and date utilities with namespaces to avoid conflicts
import * as formatUtils from './lib/utils/date-format';

// Export image utilities
export * from './lib/utils/image';

// Export utilities with namespace to avoid conflicts
export { formatUtils };

// Export individual functions with renamed versions
export const formatCurrency = formatUtils.formatCurrency;
export const formatPhoneNumber = formatUtils.formatPhoneNumber;

// Export formatDate function
export const formatDisplayDate = formatUtils.formatDate;