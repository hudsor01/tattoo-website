/**
 * Unified UA Parser Module
 * 
 * A centralized implementation of user agent parsing to avoid duplicate code
 * and reduce bundle size by using a single implementation across the application.
 */

// Basic interface for parsed UA result
export interface ParsedUA {
  browser: {
    name: string;
    version: string;
    major: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    vendor: string;
    model: string;
    type: string;
  };
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Lightweight UA parser function for client-side use.
 * Only includes essential functionality to reduce bundle size.
 */
export function parseUserAgent(ua?: string): ParsedUA {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  // Default result structure
  const result: ParsedUA = {
    browser: { name: '', version: '', major: '' },
    engine: { name: '', version: '' },
    os: { name: '', version: '' },
    device: { vendor: '', model: '', type: '' },
    isMobile: false,
    isTablet: false,
    isDesktop: false
  };

  // Simple checks for common browsers
  if (/chrome|chromium|crios/i.test(userAgent)) {
    result.browser.name = 'Chrome';
  } else if (/firefox|fxios/i.test(userAgent)) {
    result.browser.name = 'Firefox';
  } else if (/safari/i.test(userAgent)) {
    result.browser.name = 'Safari';
  } else if (/edg/i.test(userAgent)) {
    result.browser.name = 'Edge';
  } else if (/msie|trident/i.test(userAgent)) {
    result.browser.name = 'IE';
  }

  // Simple OS detection
  if (/windows/i.test(userAgent)) {
    result.os.name = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    result.os.name = 'macOS';
  } else if (/android/i.test(userAgent)) {
    result.os.name = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    result.os.name = 'iOS';
  } else if (/linux/i.test(userAgent)) {
    result.os.name = 'Linux';
  }

  // Mobile/tablet detection
  result.isMobile = /android|iphone|ipod|windows phone/i.test(userAgent);
  result.isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  result.isDesktop = !result.isMobile && !result.isTablet;

  // Extract version (simple approach)
  const browserVersionMatch = userAgent.match(
    /(chrome|firefox|safari|edge|msie|trident(?=\/))\/?\s*(\d+)/i
  );
  if (browserVersionMatch && browserVersionMatch[2]) {
    result.browser.version = browserVersionMatch[2];
    result.browser.major = browserVersionMatch[2];
  }

  return result;
}

/**
 * Get simplified browser info - lightweight function for basic needs
 */
export function getBrowserInfo(): { name: string; isMobile: boolean } {
  const ua = parseUserAgent();
  return {
    name: ua.browser.name,
    isMobile: ua.isMobile
  };
}

/**
 * Check if the current browser is supported
 */
export function isBrowserSupported(): boolean {
  const ua = parseUserAgent();
  
  // Define minimum supported versions
  const minVersions = {
    Chrome: 60,
    Firefox: 60,
    Safari: 12,
    Edge: 79,
    IE: Infinity // IE is not supported
  };
  
  const browserName = ua.browser.name as keyof typeof minVersions;
  const browserVersion = parseInt(ua.browser.major, 10) || 0;
  
  // If browser is not in our support list, assume it's not supported
  if (!browserName || !(browserName in minVersions)) {
    return false;
  }
  
  // Check if browser version meets minimum requirements
  return browserVersion >= minVersions[browserName];
}

/**
 * Check if device is touch-enabled
 */
/**
 * Type definition for navigator with non-standard properties
 */
interface ExtendedNavigator extends Navigator {
  msMaxTouchPoints?: number;
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Cast navigator to our extended type
  const extendedNavigator = navigator as ExtendedNavigator;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (extendedNavigator.msMaxTouchPoints || 0) > 0
  );
}

/**
 * Get device type for analytics and customized experiences
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = parseUserAgent();
  
  if (ua.isTablet) return 'tablet';
  if (ua.isMobile) return 'mobile';
  return 'desktop';
}

// Export a unified API for parsers to avoid using multiple parsers in the codebase
export default {
  parseUserAgent,
  getBrowserInfo,
  isBrowserSupported,
  isTouchDevice,
  getDeviceType,
};
