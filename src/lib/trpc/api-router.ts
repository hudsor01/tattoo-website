/**
 * tRPC API Router
 * 
 * This file configures the app router that handles all tRPC API routes.
 * It imports and merges all sub-routers from the router directory.
 */

import { router, adminProcedure, publicProcedure, protectedProcedure } from './trpc';
import { adminRouter } from './routers/admin-router';
import { analyticsRouter } from './routers/analytics-router';
import { appointmentsRouter } from './routers/appointments-router';
import { bookingRouter } from './routers/booking-router';
import { dashboardRouter } from './routers/dashboard-router';
import { galleryRouter } from './routers/gallery-router';
import { userRouter } from './routers/user-router';
import { subscriptionRouter } from './routers/subscription-router';

/**
 * Main application router that combines all sub-routers
 */
export const appRouter = router({
  admin: adminRouter,
  analytics: analyticsRouter,
  appointments: appointmentsRouter,
  booking: bookingRouter,
  dashboard: dashboardRouter,
  gallery: galleryRouter,
  user: userRouter,
  subscription: subscriptionRouter,
});

/**
 * Export type definition of API
 */
export type AppRouter = typeof appRouter;

/**
 * Export procedures to be used in routers
 */
export { adminProcedure, publicProcedure, protectedProcedure };