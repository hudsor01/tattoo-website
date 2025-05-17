/**
 * tRPC Router Index
 * 
 * This file exports the main app router with all subrouters combined
 */

import { router } from '../trpc';
import { galleryRouter } from './gallery-router';
import { userRouter } from './user-router';
import { adminRouter } from './admin-router';
import { bookingRouter } from './booking-router';
import { analyticsRouter } from './analytics-router';
import { appointmentsRouter } from './appointments-router';
import { paymentsRouter } from './payments-router';
import { subscriptionRouter } from './subscription-router';
import { tasksRouter } from './tasks-router';

// Export the application router type
export const appRouter = router({
  gallery: galleryRouter,
  user: userRouter,
  admin: adminRouter,
  booking: bookingRouter,
  analytics: analyticsRouter,
  appointments: appointmentsRouter,
  payments: paymentsRouter,
  subscription: subscriptionRouter,
  tasks: tasksRouter,
});

// Export router type
export type AppRouter = typeof appRouter;