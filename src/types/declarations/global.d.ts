// Global type declarations

// Fix for window global in SSR
declare global {
  namespace globalThis {
    let _supressRequestInterceptors: boolean | null;
  }
  
  interface Window {
    Cal?: (action: string, options?: unknown) => void;
  }
}

// Export required to make this a module
export {};
