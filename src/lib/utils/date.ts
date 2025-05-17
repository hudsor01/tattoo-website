/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date range based on period
 */
export function formatDateRange(period: string): { startDate: Date, endDate: Date } {
  const now = new Date();
  
  switch (period) {
    case 'today': {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      return { startDate, endDate };
    }
    
    case 'week': {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
      
      return { startDate, endDate };
    }
    
    case 'month': {
      return getCurrentMonthRange();
    }
    
    case 'year': {
      const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0); // January 1st of current year
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of current year
      
      return { startDate, endDate };
    }
    
    default: {
      // Default to current month
      return getCurrentMonthRange();
    }
  }
}

/**
 * Get the date range for the current month
 */
export function getCurrentMonthRange(): { startDate: Date, endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0); // First day of current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of current month
  
  return { startDate, endDate };
}

/**
 * Get the date range for the previous month
 */
export function getPreviousMonthRange(): { startDate: Date, endDate: Date } {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0); // First day of previous month
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // Last day of previous month
  
  return { startDate, endDate };
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date, format: string = 'medium'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'medium':
      return date.toLocaleString();
    case 'long':
      return date.toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'time':
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'date-only':
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    default:
      return date.toLocaleString();
  }
}

/**
 * Get a relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // In the past
  if (diffInSeconds >= 0) {
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  } 
  
  // In the future
  const diffInFutureSeconds = Math.abs(diffInSeconds);
  if (diffInFutureSeconds < 60) return `in ${diffInFutureSeconds} seconds`;
  if (diffInFutureSeconds < 3600) return `in ${Math.floor(diffInFutureSeconds / 60)} minutes`;
  if (diffInFutureSeconds < 86400) return `in ${Math.floor(diffInFutureSeconds / 3600)} hours`;
  if (diffInFutureSeconds < 604800) return `in ${Math.floor(diffInFutureSeconds / 86400)} days`;
  if (diffInFutureSeconds < 2592000) return `in ${Math.floor(diffInFutureSeconds / 604800)} weeks`;
  if (diffInFutureSeconds < 31536000) return `in ${Math.floor(diffInFutureSeconds / 2592000)} months`;
  return `in ${Math.floor(diffInFutureSeconds / 31536000)} years`;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}
