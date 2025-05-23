/**
 * Email Service - Contact Forms Only
 * 
 * Simplified email service for contact form notifications.
 * Booking-related emails are handled by Cal.com integration.
 */

// Import and export specific email functionality
import { DEFAULT_FROM_EMAIL, sendEmail } from './email-service';

// Import contact form email templates
import { 
  generateAdminContactEmail, 
  generateCustomerContactConfirmation 
} from './email-contact-form';

// Named exports - contact form functionality only
export {
  // Email sending functionality
  DEFAULT_FROM_EMAIL,
  sendEmail,

  // Contact form email templates
  generateAdminContactEmail,
  generateCustomerContactConfirmation,
};