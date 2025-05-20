'use client';

import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { cn } from './styling';

/**
 * Format a category name for display by capitalizing each word
 * and replacing underscores with spaces
 */
export function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a number with commas for display
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format a percentage value for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Calculate trend based on previous value
 */
export function calculateTrend(current: number, previous?: number): 'up' | 'down' | 'neutral' {
  if (previous === undefined || previous === current) {
    return 'neutral';
  }
  return current > previous ? 'up' : 'down';
}

/**
 * Calculate change percentage between current and previous values
 */
export function calculateChangePercentage(current: number, previous?: number): number {
  if (previous === undefined || previous === 0) {
    return 0;
  }
  return (Math.abs(current - previous) / previous) * 100;
}

/**
 * Standardize timestamp to ISO string format
 * This function ensures all timestamps are in a consistent ISO string format
 */
export function standardizeTimestamp(timestamp: string | number | Date | undefined | null): string | null {
  if (timestamp === undefined || timestamp === null) {
    return null;
  }
  
  try {
    // If timestamp is already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    
    // If timestamp is a number that looks like a Unix timestamp in milliseconds
    if (typeof timestamp === 'number' || (!isNaN(Number(timestamp)) && Number(timestamp) > 1000000000000)) {
      return new Date(Number(timestamp)).toISOString();
    }
    
    // If timestamp is a string that's already an ISO format
    if (typeof timestamp === 'string' && timestamp.includes('T') && timestamp.includes('Z')) {
      // Verify it's a valid ISO string by parsing and re-formatting
      return new Date(timestamp).toISOString();
    }
    
    // Otherwise, try to create a Date object and convert to ISO string
    return new Date(timestamp).toISOString();
  } catch (error) {
    console.error('Error standardizing timestamp:', error);
    return null;
  }
}

/**
 * Parse a timestamp to a Date object
 * This function handles various timestamp formats and returns a consistent Date object
 */
export function parseTimestamp(timestamp: string | number | Date | undefined | null): Date | null {
  if (timestamp === undefined || timestamp === null) {
    return null;
  }
  
  try {
    // If already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If timestamp is a string in ISO format
    if (typeof timestamp === 'string' && timestamp.includes('T') && timestamp.includes('Z')) {
      return parseISO(timestamp);
    }
    
    // Otherwise, create a new Date object
    return new Date(timestamp);
  } catch (error) {
    console.error('Error parsing timestamp:', error);
    return null;
  }
}

/**
 * Format a timestamp for display in a user-friendly way
 */
export function formatTimestamp(timestamp: string | number | Date | undefined | null): string {
  const date = parseTimestamp(timestamp);
  
  if (!date) {
    return 'Invalid date';
  }
  
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
}

/**
 * Get CSS classes for trend direction
 */
export function getTrendClasses(trend: 'up' | 'down' | 'neutral'): string {
  return cn(
    'transition-colors duration-300',
    trend === 'up' ? 'text-green-600 dark:text-green-400' : 
    trend === 'down' ? 'text-red-600 dark:text-red-400' : ''
  );
}

/**
 * Get border color classes for a trend
 */
export function getTrendBorderClasses(trend: 'up' | 'down' | 'neutral'): string {
  return cn(
    'border transition-colors duration-300',
    trend === 'up' ? 'border-green-200' : 
    trend === 'down' ? 'border-red-200' : 'border'
  );
}

/**
 * Get badge variant for a trend
 */
export function getTrendBadgeVariant(trend: 'up' | 'down' | 'neutral'): 'success' | 'destructive' | 'outline' {
  return trend === 'up' ? 'success' : 
         trend === 'down' ? 'destructive' : 'outline';
}

/**
 * Format an event type for display
 */
export function formatEventType(eventType: string): string {
  return eventType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}