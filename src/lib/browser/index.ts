'use client';

/**
 * Browser Utilities
 * 
 * Centralized browser-related functions that are safe to use in both client and server components.
 * These utilities handle SSR gracefully and provide consistent behavior.
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';

/**
 * Safe browser globals
 */
export const safeWindow = typeof window !== 'undefined' ? window : undefined;
export const safeDocument = typeof document !== 'undefined' ? document : undefined;
export const safeNavigator = typeof navigator !== 'undefined' ? navigator : undefined;
export const safeLocation = typeof location !== 'undefined' ? location : undefined;

/**
 * Get the user agent string safely
 */
export function getUserAgent(): string {
  return safeNavigator?.userAgent || '';
}

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (!safeNavigator) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    safeNavigator.userAgent
  );
}

/**
 * Detect if the current device is a tablet
 */
export function isTabletDevice(): boolean {
  if (!safeNavigator) return false;
  const userAgent = safeNavigator.userAgent.toLowerCase();
  return /ipad|tablet|(android(?!.*mobile))/i.test(userAgent);
}

/**
 * Get the browser language
 */
export function getBrowserLanguage(): string {
  return safeNavigator?.language || 'en';
}

/**
 * Get basic device information
 */
export function getDeviceInfo() {
  if (!isBrowser) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }
  
  const userAgent = getUserAgent();
  
  // Determine device type
  const isMobile = isMobileDevice();
  const isTablet = isTabletDevice();
  
  const deviceType = isTablet 
    ? 'tablet' 
    : isMobile 
      ? 'mobile' 
      : 'desktop';
  
  // Determine browser
  let browser;
  if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
    browser = 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    browser = 'Edge';
  } else {
    browser = 'Unknown';
  }
  
  // Determine OS
  let os;
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    os = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || /iPhone|iPad|iPod/.test(userAgent)) {
    os = 'iOS';
  } else {
    os = 'Unknown';
  }
  
  return { deviceType, browser, os };
}

/**
 * Safe local storage access
 */
export const safeLocalStorage = typeof localStorage !== 'undefined' ? localStorage : {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
  clear: () => null,
  key: () => null,
  length: 0,
};

/**
 * Safe session storage access
 */
export const safeSessionStorage = typeof sessionStorage !== 'undefined' ? sessionStorage : {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
  clear: () => null,
  key: () => null,
  length: 0,
};

/**
 * Safe window dimensions
 */
export const safeInnerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
export const safeInnerHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

/**
 * Safe media query matching
 */
export function safeMatchMedia(query: string) {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(query);
  }
  
  // Return a stub matchMedia object
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions() {
  return {
    width: safeInnerWidth,
    height: safeInnerHeight
  };
}

/**
 * Safe event listener that handles cleanup
 */
export function safeAddEventListener<K extends keyof WindowEventMap>(
  target: Window | Document | HTMLElement | undefined | null,
  event: K,
  callback: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  if (!target) return () => {};
  
  target.addEventListener(event, callback as EventListener, options);
  return () => target.removeEventListener(event, callback as EventListener, options);
}

/**
 * Safe document title setter
 */
export function setDocumentTitle(title: string): void {
  if (safeDocument) {
    safeDocument.title = title;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser) return false;
  
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
}

/**
 * Parse URL query parameters
 */
export function parseQueryParams(queryString?: string): Record<string, string> {
  if (!isBrowser) return {};
  
  const searchParams = new URLSearchParams(
    queryString || window.location.search
  );
  
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Generate a simple browser fingerprint
 */
export function generateBrowserFingerprint(): string {
  if (!isBrowser) return 'server';
  
  const components = [
    navigator.userAgent,
    navigator.language,
    String(screen.colorDepth),
    `${screen.width}x${screen.height}`,
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency),
    String(!!navigator.cookieEnabled),
  ].join('|||');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < components.length; i++) {
    const char = components.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Basic browser capability detection
 */
export function getBrowserCapabilities() {
  if (!isBrowser) {
    return {
      localStorage: false,
      sessionStorage: false,
      cookies: false,
      serviceWorker: false,
      webp: false,
      webgl: false,
      touchscreen: false,
    };
  }
  
  return {
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    cookies: navigator.cookieEnabled,
    serviceWorker: 'serviceWorker' in navigator,
    webp: (() => {
      try {
        return document.createElement('canvas')
          .toDataURL('image/webp')
          .indexOf('data:image/webp') === 0;
      } catch (e) {
        return false;
      }
    })(),
    webgl: (() => {
      try {
        return !!document.createElement('canvas').getContext('webgl');
      } catch (e) {
        return false;
      }
    })(),
    touchscreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}
