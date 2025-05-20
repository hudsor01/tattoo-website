/**
 * TRPC Client-side type definitions
 * 
 * This file provides type definitions for use in client components,
 * without importing server-only code.
 */

// Common type definitions that are safe to use in client components
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './api-router';

// Infer router input/output types
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Export specific endpoints for type-safe API calls
export type GalleryRouter = RouterOutputs['gallery'];
export type GalleryInputs = RouterInputs['gallery'];

export type AnalyticsRouter = RouterOutputs['analytics'];
export type AnalyticsInputs = RouterInputs['analytics'];

export type BookingRouter = RouterOutputs['booking'];
export type BookingInputs = RouterInputs['booking'];

export type UserRouter = RouterOutputs['user'];
export type UserInputs = RouterInputs['user'];

export type AdminRouter = RouterOutputs['admin'];
export type AdminInputs = RouterInputs['admin'];

export type DashboardRouter = RouterOutputs['dashboard'];
export type DashboardInputs = RouterInputs['dashboard'];

export type PaymentsRouter = RouterOutputs['payments'];
export type PaymentsInputs = RouterInputs['payments'];

export type SubscriptionRouter = RouterOutputs['subscription'];
export type SubscriptionInputs = RouterInputs['subscription'];