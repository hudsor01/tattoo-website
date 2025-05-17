/**
 * API Functions
 * 
 * This file provides consolidated functions for API access,
 * combining tRPC, Supabase, and other data sources.
 */

// Export database functions
export {
  // Appointments
  getUpcomingAppointments,
  getAppointmentById,
  checkAppointmentAvailability,
  scheduleAppointment,
  rescheduleAppointment,
  cancelAppointment,
  
  // Pricing
  calculatePricing,
  calculateAppointmentDuration,
  getArtistRates,
  getStandardPricingData
} from './db/db-appointments';

// Export authentication functions
export {
  // Client auth
  signIn,
  signUp,
  signOut,
  resetPassword,
  updateUserEmail,
  updateUserPassword,
  getSession,
  getUser,
  refreshSession
} from './supabase/auth';

// Export server authentication functions
export {
  // Server auth
  verifySession,
  createServerSession,
  getServerSession,
  refreshServerSession,
  requireAuth,
  requireAdmin
} from './supabase/server-auth';

// Export email functions
export {
  // Email
  sendEmail,
  sendTemplatedEmail,
  sendBulkEmails,
  parseInboundEmail
} from './email/send-email';

// Export email templates
export {
  // Email templates
  generateAppointmentConfirmationEmail,
  generateAppointmentReminderEmail,
  generateWelcomeEmail,
  generateBookingConfirmationEmail,
  generateCancellationEmail,
  generateDepositReminderEmail
} from './email/templates';
