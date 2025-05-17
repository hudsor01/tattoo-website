// Type declarations for Headers Iterator

// Extend Headers interface for Next.js
declare global {
  interface Headers {
    entries(): IterableIterator<[string, string]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<string>;
    [Symbol.iterator](): IterableIterator<[string, string]>;
  }
}

export {};
