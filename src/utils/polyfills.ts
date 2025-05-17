/**
 * Browser API polyfills for server-side rendering
 */

// Only run this code on the server
if (typeof window === 'undefined') {
  // Polyfill global self if it doesn't exist (used by many libraries)
  if (typeof global.self === 'undefined') {
    // @ts-ignore
    global.self = global;
  }

  // Mock window for libraries that expect it
  if (typeof global.window === 'undefined') {
    // @ts-ignore
    global.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      document: {
        createElement: () => ({}),
        head: {},
        body: {},
      },
      navigator: {
        userAgent: 'node',
      },
      location: {
        href: 'http://localhost',
        protocol: 'http:',
        host: 'localhost',
        pathname: '/',
        search: '',
      },
    };
  }
  
  // Mock document for libraries that expect it
  if (typeof global.document === 'undefined') {
    // @ts-ignore
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      head: {},
      body: {},
      title: 'Server-rendered Page',
      querySelector: () => null,
      querySelectorAll: () => [],
    };
  }
}

// Export nothing - this file is meant to be imported for its side effects
export {};