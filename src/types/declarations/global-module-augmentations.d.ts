// Global module augmentations

// Extend Window interface
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    _paq?: unknown[];
  }
}

export {};
