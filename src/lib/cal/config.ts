/**
 * Cal.com integration configuration
 */

export const calConfig = {
  apiKey: process.env['CAL_API_KEY'],
  username: process.env['NEXT_PUBLIC_CAL_USERNAME'],
  webhookSecret: process.env['CAL_WEBHOOK_SECRET'],
  apiBaseUrl: 'https://api.cal.com/v1',

  // Event type IDs for common booking types
  eventTypes: {
    consultation: 'consultation', // Use the URL slug from Cal.com
    tattooAppointment: 'tattoo-session', // Use the URL slug from Cal.com
    touchUp: 'touch-up', // Use the URL slug from Cal.com
  },

  // Map Cal.com status to internal status
  statusMap: {
    accepted: 'confirmed',
    pending: 'pending',
    cancelled: 'cancelled',
    rejected: 'cancelled',
  },

  // Default Cal.com settings
  defaultSettings: {
    bufferTime: 15, // minutes
    duration: 60, // minutes
  },
};

/**
 * Verifies if Cal.com integration is properly configured
 */
export function isCalConfigured(): boolean {
  return Boolean(
    process.env['CAL_API_KEY'] &&
      process.env['NEXT_PUBLIC_CAL_USERNAME'] &&
      process.env['CAL_WEBHOOK_SECRET']
  );
}
