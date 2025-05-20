'use client';

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
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
 * Format a timestamp for display in a user-friendly way
 */
export function formatTimestamp(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  
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