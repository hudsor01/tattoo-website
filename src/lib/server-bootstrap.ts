/**
 * Server Bootstrap
 * 
 * This file is loaded early in the Next.js server initialization process
 * to set up necessary shims and global state for server-side rendering.
 */

// Import browser API polyfills for server-side rendering
import '../utils/polyfills';

// Also import the original shims
import '../utils/server-shims';

// Re-export setupServerShims to allow importing this file
export { setupServerShims } from '../utils/server-shims';

// This file intentionally contains no logic, just imports
// for polyfills and shims to be applied at the module level