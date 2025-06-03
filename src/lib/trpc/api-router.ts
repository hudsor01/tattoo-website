/**
 * tRPC API Router (CLIENT-SAFE VERSION)
 * 
 * IMPORTANT: This file exists to provide a safe way for client components
 * to import the AppRouter type without importing server-only code.
 * 
 * Why this exists:
 * 1. app-router.ts has the 'server-only' directive and cannot be imported in client components
 * 2. We need the AppRouter type in client components for tRPC type safety
 * 3. This file provides just the type definition without the server code
 * 
 * If you're working on server components, you can import from app-router.ts directly.
 * Client components should import the AppRouter type from here or from client-types.ts.
 */

// Export type definition for client usage
import type { AppRouter as RouterType } from './app-router';
export type AppRouter = RouterType;
