/**
 * Hooks exports
 * 
 * This module re-exports hooks with renamed exports to avoid naming conflicts
 * Import hooks directly from their source files for better performance
 * 
 * Note: This file is maintained for backward compatibility only and should not be used for new code
 */

// API hooks
import * as apiAppointments from './api/useAppointments';
import * as apiAuth from './api/useAuth';
import * as apiPricing from './api/usePricing';

// Form hooks
import * as formHooks from './use-form';
import * as debounceHooks from './use-debounce';

// UI hooks
import * as mobileHooks from './use-mobile';
import * as toastHooks from './use-toast';

// Data hooks
import * as contactsHooks from './use-contacts';
import * as dashboardHooks from './use-dashboard';
import * as appointmentsHooks from './useAppointments';
import * as customersHooks from './useCustomers';
import * as paymentsHooks from './usePayments';
import * as tasksHooks from './useTasks';

// Authentication hooks
import * as supabaseHooks from './use-supabase';

// Analytics hooks
import * as analyticsHooks from './use-analytics';
import * as liveAnalyticsHooks from './use-live-analytics';
import * as pageViewTrackingHooks from './use-page-view-tracking';

// Database hooks
import * as databaseFunctionsHooks from './use-database-functions';
import * as realtimeHooks from './use-realtime';
import * as realtimeCoreHooks from './use-realtime-core';
import * as supabaseSubscriptionHooks from './use-supabase-subscription';
import * as supabaseUploadHooks from './use-supabase-upload';

// Query hooks
import * as queryInvalidationHooks from './useQueryInvalidation';
import * as trpcCoreHooks from './use-trpc-core';
import * as trpcBookingsHooks from './use-trpc-bookings';

// tRPC hooks
import * as trpcAdminHooks from './trpc/use-admin';
import * as trpcAnalyticsHooks from './trpc/use-analytics';
import * as trpcBookingHooks from './trpc/use-booking';
import * as trpcGalleryHooks from './trpc/use-gallery';
import * as trpcGallerySubscriptionHooks from './trpc/use-gallery-subscription';
import * as trpcUserHooks from './trpc/use-user';
import * as trpcSubscriptionHooks from './trpc/use-subscription';

// Export all hooks with namespace
export {
  apiAppointments,
  apiAuth,
  apiPricing,
  formHooks,
  debounceHooks,
  mobileHooks,
  toastHooks,
  contactsHooks,
  dashboardHooks,
  appointmentsHooks,
  customersHooks,
  paymentsHooks,
  tasksHooks,
  supabaseHooks,
  analyticsHooks,
  liveAnalyticsHooks,
  pageViewTrackingHooks,
  databaseFunctionsHooks,
  realtimeHooks,
  realtimeCoreHooks,
  supabaseSubscriptionHooks,
  supabaseUploadHooks,
  queryInvalidationHooks,
  trpcCoreHooks,
  trpcBookingsHooks,
  trpcAdminHooks,
  trpcAnalyticsHooks,
  trpcBookingHooks,
  trpcGalleryHooks,
  trpcGallerySubscriptionHooks,
  trpcUserHooks,
  trpcSubscriptionHooks,
};