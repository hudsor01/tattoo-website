'use client';

/**
 * Get the user agent string
 */
export function getUserAgent(): string {
  return typeof window !== 'undefined' ? window.navigator.userAgent : '';
}

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

/**
 * Get the browser language
 */
export function getBrowserLanguage(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return window.navigator.language ?? 'en';
}

/**
 * Get basic device information
 */
export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const userAgent = window.navigator.userAgent;

  // Determine device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

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
