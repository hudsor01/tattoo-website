/**
 * URL Utility Functions
 * Server-side compatible versions of URL handling functions
 */

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