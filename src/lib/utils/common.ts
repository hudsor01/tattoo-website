'use client';

/**
 * Safely access nested object properties
 */
export function get<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key];
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Generate a random string ID
 */
export function generateId(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)  }...`;
}

/**
 * Fix Supabase URL if it has a malformed prefix
 * 
 * This utility function handles the case where a URL might have 
 * a malformed prefix like "Fa" before the https:// part.
 */
export function fixSupabaseUrl(url: string): string {
  // Check if the URL doesn't start with "http"
  if (url && !url.startsWith('http')) {
    // Extract the URL part that follows any prefix before "http"
    const match = url.match(/(https?:\/\/.+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // If no issues or we couldn't fix it, return the original
  return url || '';
}

/**
 * Clean up URL parameters to ensure we have the correct Supabase URL
 * 
 * This addresses the specific issue with "grc" vs "qrc" in the URL
 */
export function ensureCorrectSupabaseUrl(url: string): string {
  if (!url) return '';
  
  // Fix the URL if it contains grcweallglcgwiwzhgpb instead of qrcweallqlcgwiwzhqpb
  if (url.includes('grcweallglcgwiwzhgpb')) {
    return url.replace('grcweallglcgwiwzhgpb', 'qrcweallqlcgwiwzhqpb');
  }
  
  return url;
}