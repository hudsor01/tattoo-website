/**
 * Modern Dashboard tRPC Router
 *
 * Provides type-safe procedures for all dashboard-related data fetching and actions.
 * Modularized for better maintainability using domain-specific sub-routers.
 * 
 * This replaces the original 1012-line dashboard-router.ts with a cleaner,
 * React 19 compatible structure split across multiple focused routers.
 */

import { router } from '@/lib/trpc/procedures';
import { statsRouter } from './dashboard/stats-router';
import { contactsRouter } from './dashboard/contacts-router';
import { activityRouter } from './dashboard/activity-router';

/**
 * Main dashboard router that combines all domain-specific routers
 * 
 * Structure:
 * - stats: Dashboard statistics and overview data
 * - contacts: Contact management and communication  
 * - activity: Activity tracking and notifications
 * 
 * Note: Bookings, appointments, and payments are handled via Cal.com integration
 * and are managed through the respective dedicated routers (cal-router, etc.)
 */
export const dashboardRouter = router({
  // Statistics and overview data
  stats: statsRouter,
  
  // Contact management
  contacts: contactsRouter,
  
  // Activity tracking and notifications
  activity: activityRouter,
});