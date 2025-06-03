import { clsx, type ClassValue } from 'clsx';

// CONVERTED TO SERVER COMPONENT: Pure utility functions for CSS classes
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for combining TailwindCSS classes conditionally
 * Enhanced for Tailwind CSS v4 compatibility.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse color variables to be used in style props
 */
export function parseColorVar(colorVar: string): string {
  return `var(${colorVar})`;
}
