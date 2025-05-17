/**
 * Browser API shims for server-side rendering
 * 
 * This file provides shims for common browser APIs when running in a server environment
 * to prevent "X is not defined" errors during SSR.
 */

// Make sure we're actually in a server environment
const isServer = typeof window === 'undefined';

// Only apply shims in a server environment
if (isServer) {
  // Create global.self if it doesn't exist (used by many libraries)
  if (typeof global.self === 'undefined') {
    (global as any).self = global;
  }

  // Provide shims for other common browser globals if needed
  if (typeof global.window === 'undefined') {
    (global as any).window = {}; 
  }

  if (typeof global.document === 'undefined') {
    (global as any).document = {
      createElement: () => ({}),
      head: {},
      body: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      documentElement: {
        style: {},
        setAttribute: () => {},
      },
    };
  }

  if (typeof global.navigator === 'undefined') {
    (global as any).navigator = {
      userAgent: 'Node.js',
      platform: process.platform,
    };
  }

  // Storage API shims
  if (typeof global.localStorage === 'undefined') {
    (global as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  if (typeof global.sessionStorage === 'undefined') {
    (global as any).sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
}

// Export a dummy function to allow importing this file
export const setupServerShims = () => {
  // This function exists just to make this file importable
  // The shims are applied when the file is imported
};

export default setupServerShims;