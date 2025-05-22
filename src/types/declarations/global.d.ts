// Global type declarations

// Fix for window global in SSR
declare global {
  namespace globalThis {
    var _supressRequestInterceptors: boolean | null;
  }
}

// Export required to make this a module
export {};
