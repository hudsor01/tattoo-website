/**
 * tRPC Utility Functions
 * 
 * This file contains utility functions for tRPC that can be safely
 * imported from both client and server components without circular dependencies.
 */

/**
 * Helper function to get the base URL for API calls
 * This function works in both browser and server environments
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NODE_ENV === "production" 
      ? "https://ink37tattoos.com" 
      : window.location.origin;
  }
  // In server environment
  if (process.env["VERCEL_URL"]) return `https://${process.env["VERCEL_URL"]}`;
  return process.env.NODE_ENV === "production"
    ? "https://ink37tattoos.com"
    : `http://localhost:${process.env["PORT"] ?? '3000'}`;
}
