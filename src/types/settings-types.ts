/**
 * Settings Types
 *
 * Type definitions for application settings functionality.
 * This file centralizes all settings-related types and schemas.
 */

// ===== FORM STATE TYPES (EXTRACTED FROM SETTINGS PAGE) =====

/**
 * General settings form state
 */
export interface GeneralSettingsForm {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  timezone: string;
}

/**
 * Booking settings form state
 */
export interface BookingSettingsForm {
  bookingEnabled: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  cancellationHours: number;
  autoConfirmBookings: boolean;
  sendReminderEmails: boolean;
  reminderHoursBefore: number;
}

/**
 * Email settings form state
 */
export interface EmailSettingsForm {
  emailProvider: 'resend' | 'sendgrid' | 'smtp';
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  sendWelcomeEmails: boolean;
  sendBookingConfirmations: boolean;
  sendPaymentConfirmations: boolean;
  sendCancellationNotices: boolean;
}

/**
 * Security settings form state
 */
export interface SecuritySettingsForm {
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireStrongPasswords: boolean;
  allowApiAccess: boolean;
  logSecurityEvents: boolean;
}

/**
 * Notification settings form state
 */
export interface NotificationSettingsForm {
  newBookingAlerts: boolean;
  paymentAlerts: boolean;
  cancellationAlerts: boolean;
  systemMaintenanceAlerts: boolean;
  errorAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

// ===== SETTINGS CONFIGURATION ARRAYS =====

/**
 * Email notification setting configuration
 */
export interface EmailNotificationSetting {
  key: keyof EmailSettingsForm;
  label: string;
  description: string;
}

/**
 * Security setting configuration
 */
export interface SecuritySettingConfig {
  key: keyof SecuritySettingsForm;
  label: string;
  description: string;
}

/**
 * Notification setting configuration
 */
export interface NotificationSettingConfig {
  key: keyof NotificationSettingsForm;
  label: string;
  description: string;
}

// ===== TRPC RESPONSE TYPES =====

/**
 * Settings response interface for tRPC
 */
export interface SettingsResponse {
  general?: Record<string, unknown>;
  booking?: Record<string, unknown>;
  email?: Record<string, unknown>;
  security?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
}

/**
 * Settings mutation error type
 */
export interface SettingsMutationError {
  message: string;
}

/**
 * Test email input type
 */
export interface TestEmailInput {
  email: string;
}

// ===== LEGACY TYPES (BACKWARD COMPATIBILITY) =====

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  timezone: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmations: boolean;
  reminderEmails: boolean;
  marketingEmails: boolean;
  systemAlerts: boolean;
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  allowedIPs: string;
  maxLoginAttempts: number;
}

export interface DisplaySettings {
  theme: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCSS: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface DatabaseSettings {
  backupFrequency: string;
  retentionPeriod: number;
  compressionEnabled: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  display: DisplaySettings;
  email: EmailSettings;
  database: DatabaseSettings;
}

// ===== COMPREHENSIVE SETTINGS INTERFACES =====

/**
 * Enhanced booking system settings
 */
export interface BookingSettings {
  bookingEnabled: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  cancellationHours: number;
  autoConfirmBookings: boolean;
  sendReminderEmails: boolean;
  reminderHoursBefore: number;
  allowOnlinePayments: boolean;
  maxSlotsPerDay: number;
  slotDurationMinutes: number;
}

/**
 * Enhanced email service settings
 */
export interface EmailServiceSettings {
  emailProvider: 'resend' | 'sendgrid' | 'smtp';
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  sendWelcomeEmails: boolean;
  sendBookingConfirmations: boolean;
  sendPaymentConfirmations: boolean;
  sendCancellationNotices: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUsername?: string;
  smtpPassword?: string;
}

/**
 * Enhanced security and authentication settings
 */
export interface SecurityAuthSettings {
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireStrongPasswords: boolean;
  allowApiAccess: boolean;
  logSecurityEvents: boolean;
  ipWhitelist?: string[];
  allowedOrigins?: string[];
}

/**
 * Enhanced notification and alert settings
 */
export interface NotificationAlertSettings {
  newBookingAlerts: boolean;
  paymentAlerts: boolean;
  cancellationAlerts: boolean;
  systemMaintenanceAlerts: boolean;
  errorAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

/**
 * Integration settings for external services
 */
export interface IntegrationSettings {
  calendarProvider: 'cal.com' | 'google' | 'outlook' | 'none';
  paymentProvider: 'stripe' | 'paypal' | 'square' | 'none';
  emailProvider: 'resend' | 'sendgrid' | 'mailgun' | 'smtp';
  smsProvider: 'twilio' | 'nexmo' | 'none';
  analyticsProvider: 'google' | 'plausible' | 'none';
  calApiKey?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  googleAnalyticsId?: string;
}

/**
 * Combined application settings
 */
export interface ApplicationSettings {
  general: GeneralSettings;
  booking: BookingSettings;
  email: EmailServiceSettings;
  security: SecurityAuthSettings;
  notifications: NotificationAlertSettings;
  integrations: IntegrationSettings;
  lastUpdated: Date;
  updatedBy: string;
}

/**
 * Settings update payload type
 */
export type SettingsUpdatePayload = Partial<ApplicationSettings>;

/**
 * Settings validation result
 */
export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Settings backup information
 */
export interface SettingsBackup {
  id: string;
  settings: ApplicationSettings;
  createdAt: Date;
  createdBy: string;
  description?: string;
}
