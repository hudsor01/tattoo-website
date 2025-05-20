/**
 * tRPC API Router
 * 
 * This file re-exports the AppRouter type for client usage without importing
 * server-only code. The actual router implementation stays in app-router.ts.
 */

// Export type definition for client usage
import type { AppRouter as RouterType } from './app-router';
export type AppRouter = RouterType;