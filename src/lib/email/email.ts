// Import and export specific email functionality with direct named exports
import { DEFAULT_FROM_EMAIL, sendEmail, createResend } from './email-resend';

// Import email templates with named imports
import { generateAftercareReminderEmail } from './email-aftercare-reminder';
import { generateBookingConfirmationEmail } from './email-booking-confirmation';

import { 
  generateAdminContactEmail, 
  generateCustomerContactConfirmation 
} from './email-contact-form';

import { generateLeadMagnetEmail } from './email-lead-magnet';

// Named exports
export {
  // Email sending functionality
  DEFAULT_FROM_EMAIL,
  sendEmail,
  createResend,

  // Email templates
  generateAftercareReminderEmail,
  generateBookingConfirmationEmail,
  generateAdminContactEmail,
  generateCustomerContactConfirmation,
  generateLeadMagnetEmail,
};