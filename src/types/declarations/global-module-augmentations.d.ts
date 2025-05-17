// Global module augmentations

// Extend Window interface
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    _paq?: any[];
  }
}

export {};
