/**
 * Admin Main Router
 *
 * This router aggregates all admin sub-routers into a single admin router.
 * It follows the same pattern as the dashboard router, providing a modular
 * and maintainable approach to organizing admin functionality.
 */
import { router } from '../../procedures';
import { adminNotesRouter } from './notes-router';
import { adminUsersRouter } from './users-router';
import { adminMetricsRouter } from './metrics-router';

/**
 * Combined admin router that aggregates all admin-specific sub-routers
 */
export const adminMainRouter = router({
  // Notes management
  notes: adminNotesRouter,
  
  // User management
  users: adminUsersRouter,
  
  // Metrics and statistics
  metrics: adminMetricsRouter,
});