/**
 * tRPC App Router
 * 
 * This file combines all the feature-specific routers into a single app router.
 * It serves as the main entry point for all tRPC procedures.
 */
import { router } from './server';
import { bookingRouter } from './routers/booking-router';
import { galleryRouter } from './routers/gallery-router';
import { adminRouter } from './routers/admin-router';
import { userRouter } from './routers/user-router';
import { subscriptionRouter } from './routers/subscription-router';
import { analyticsRouter } from './routers/analytics-router';

/**
 * Main application router
 * 
 * This combines all sub-routers to create the main API
 * entry point. Each sub-router handles a specific feature area.
 */
export const appRouter = router({
  booking: bookingRouter,
  gallery: galleryRouter,
  admin: adminRouter,
  user: userRouter,
  subscription: subscriptionRouter,
  analytics: analyticsRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
