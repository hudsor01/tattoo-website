// Global type declarations

// Fix for window global in SSR
declare global {
  namespace globalThis {
    var _supressRequestInterceptors: boolean | undefined;
  }
}

// Export required to make this a module
export {};
