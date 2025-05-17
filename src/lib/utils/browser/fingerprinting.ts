'use client';

/**
 * Generate a unique identifier for the current browser session
 */
export function getBrowserFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Create a simple fingerprint based on available browser information
  const userAgent = window.navigator.userAgent;
  const language = window.navigator.language;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const colorDepth = window.screen.colorDepth;
  const timezone = new Date().getTimezoneOffset();
  
  // Combine the values and hash them
  const components = [
    userAgent,
    language,
    screenWidth,
    screenHeight,
    colorDepth,
    timezone,
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(36);
}