/**
 * @deprecated Use centralized browser utilities from '@/lib/browser' instead
 * This file is maintained for backward compatibility during migration.
 */

import * as browserUtils from '@/lib/browser';

// Re-export everything from the standardized browser utils
export const {
  isBrowser,
  safeWindow,
  safeDocument,
  safeNavigator,
  safeLocation,
  safeLocalStorage,
  safeSessionStorage,
  safeMatchMedia,
  safeInnerWidth,
  safeInnerHeight,
  getUserAgent,
  isMobileDevice,
  getBrowserLanguage,
  safeAddEventListener,
  setDocumentTitle,
} = browserUtils;

// Log deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'browser-safe.ts is deprecated. Please import from @/lib/browser instead.'
  );
}
