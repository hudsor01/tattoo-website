/**
 * @deprecated Use centralized browser utilities from '@/lib/browser' instead
 * This file is maintained for backward compatibility during migration.
 */

import * as browserUtils from '@/lib/browser';

// Re-export functions used in this file
export const {
  getUserAgent,
  isMobileDevice,
  getBrowserLanguage,
  getDeviceInfo,
  generateBrowserFingerprint,
} = browserUtils;

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'browser.ts is deprecated. Please import from @/lib/browser instead.'
  );
}
