/**
 * Security utilities for safe HTML content injection
 */

/**
 * Safely serialize JSON for script injection to prevent XSS attacks
 * This function escapes potentially dangerous characters in JSON strings
 * 
 * @param data - The data to serialize
 * @returns Escaped JSON string safe for script injection
 */
export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/"/g, '\\u0022');
}

/**
 * Create safe props for dangerouslySetInnerHTML with JSON-LD structured data
 * 
 * @param data - The structured data object
 * @returns Safe props object for dangerouslySetInnerHTML
 */
export function createSafeJsonLdProps(data: unknown) {
  return {
    __html: safeJsonStringify(data)
  };
}