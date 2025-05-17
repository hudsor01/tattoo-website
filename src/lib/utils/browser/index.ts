/**
 * Browser utility functions
 * 
 * This module contains utilities for browser-specific operations
 * that should only be used in client-side code.
 */

'use client';

/**
 * Detect if running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Safely access browser window object
 * 
 * @param callback Function to execute with window object
 * @param fallback Optional fallback value if not in browser
 */
export function safeWindow<T>(callback: (window: Window) => T, fallback?: T): T | undefined {
  if (isBrowser) {
    return callback(window);
  }
  return fallback;
}

/**
 * Safely access browser document object
 * 
 * @param callback Function to execute with document object
 * @param fallback Optional fallback value if not in browser
 */
export function safeDocument<T>(callback: (document: Document) => T, fallback?: T): T | undefined {
  if (isBrowser) {
    return callback(document);
  }
  return fallback;
}

/**
 * Safely access browser localStorage
 * 
 * @param callback Function to execute with localStorage
 * @param fallback Optional fallback value if not in browser
 */
export function safeLocalStorage<T>(
  callback: (localStorage: Storage) => T,
  fallback?: T
): T | undefined {
  if (isBrowser && window.localStorage) {
    try {
      return callback(window.localStorage);
    } catch (e) {
      console.error('LocalStorage access error:', e);
    }
  }
  return fallback;
}

/**
 * Safely access browser sessionStorage
 * 
 * @param callback Function to execute with sessionStorage
 * @param fallback Optional fallback value if not in browser
 */
export function safeSessionStorage<T>(
  callback: (sessionStorage: Storage) => T,
  fallback?: T
): T | undefined {
  if (isBrowser && window.sessionStorage) {
    try {
      return callback(window.sessionStorage);
    } catch (e) {
      console.error('SessionStorage access error:', e);
    }
  }
  return fallback;
}

/**
 * Get browser viewport dimensions
 */
export function getViewportDimensions() {
  return safeWindow(
    (window) => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    { width: 0, height: 0 }
  );
}

/**
 * Check if device is likely a mobile device
 */
export function isMobileDevice() {
  return safeWindow(
    (window) => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const mobileRegex = /(android|iphone|ipad|ipod|webos|blackberry|windows phone)/i;
      return mobileRegex.test(userAgent);
    },
    false
  );
}

/**
 * Add an event listener with automatic cleanup
 * 
 * @param target DOM element to attach listener to
 * @param eventType Event type to listen for
 * @param callback Event handler function
 * @returns Function to remove the event listener
 */
export function safeAddEventListener<K extends keyof WindowEventMap>(
  target: Window | Document | HTMLElement,
  eventType: K,
  callback: (event: WindowEventMap[K]) => void
): () => void {
  target.addEventListener(eventType, callback as EventListener);
  return () => target.removeEventListener(eventType, callback as EventListener);
}

/**
 * Copy text to clipboard
 * 
 * @param text Text to copy to clipboard
 * @returns Promise resolving to boolean indicating success
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  return safeWindow(async (window) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (error) {
      console.error('Failed to copy text:', error);
      return false;
    }
  }, false) || false;
}

/**
 * Parse URL query parameters
 * 
 * @param queryString Optional query string (uses current URL if not provided)
 * @returns Object with parsed query parameters
 */
export function parseQueryParams(queryString?: string): Record<string, string> {
  return safeWindow((window) => {
    const searchParams = new URLSearchParams(
      queryString || window.location.search
    );
    const params: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }, {}) || {};
}

/**
 * Safely scroll to an element
 * 
 * @param elementId ID of element to scroll to
 * @param options ScrollIntoView options
 * @returns Whether the scroll was successful
 */
export function scrollToElement(
  elementId: string,
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
): boolean {
  return safeDocument((document) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView(options);
      return true;
    }
    return false;
  }, false) || false;
}

/**
 * Generate a browser fingerprint 
 * (simple implementation - for advanced needs use a dedicated library)
 */
export function generateSimpleFingerprint(): string {
  return safeWindow((window) => {
    const components = [
      window.navigator.userAgent,
      window.navigator.language,
      window.screen.colorDepth,
      `${window.screen.width  }x${  window.screen.height}`,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
    ].join('||');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `fp_${  Math.abs(hash).toString(16)}`;
  }, 'unknown_fingerprint') || 'unknown_fingerprint';
}