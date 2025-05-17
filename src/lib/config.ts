/**
 * Application Configuration
 *
 * This module manages environment variables with validation and provides
 * typed access to configuration values across the application.
 */

// Function to get required environment variables
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Function to get optional environment variables with default value
const getOptionalEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

// Function to parse boolean environment variables
const getBooleanEnv = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

// Function to parse number environment variables
const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Application configuration
export const config = {
  // Base configuration
  env: getOptionalEnv('NODE_ENV', 'development'),
  isDev: getOptionalEnv('NODE_ENV', 'development') === 'development',
  isProd: getOptionalEnv('NODE_ENV', 'development') === 'production',
  isTest: getOptionalEnv('NODE_ENV', 'development') === 'test',

  // Server configuration
  server: {
    port: getNumberEnv('PORT', 3000),
    host: getOptionalEnv('HOST', '0.0.0.0'),
    websiteUrl: getOptionalEnv('WEBSITE_URL', 'http://localhost:3000'),
  },

  // Database configuration
  database: {
    url: getRequiredEnv('DATABASE_URL'),
    directUrl: getOptionalEnv('DIRECT_URL', ''),
    maxConnections: getNumberEnv('DATABASE_MAX_CONNECTIONS', 10),
    connectionTimeout: getNumberEnv('DATABASE_CONNECTION_TIMEOUT', 30000),
  },

  // Authentication configuration
  auth: {
    secret: getRequiredEnv('NEXTAUTH_SECRET'),
    url: getOptionalEnv('NEXTAUTH_URL', 'http://localhost:3000'),
    googleClientId: getOptionalEnv('GOOGLE_CLIENT_ID', ''),
    googleClientSecret: getOptionalEnv('GOOGLE_CLIENT_SECRET', ''),
  },

  // Email configuration
  email: {
    from: getOptionalEnv('EMAIL_FROM', 'noreply@example.com'),
    host: getOptionalEnv('EMAIL_HOST', 'smtp.example.com'),
    port: getNumberEnv('EMAIL_PORT', 587),
    secure: getBooleanEnv('EMAIL_SECURE', false),
    user: getOptionalEnv('EMAIL_USER', ''),
    password: getOptionalEnv('EMAIL_PASSWORD', ''),
  },

  // Payment configuration
  payment: {
    stripeSecretKey: getOptionalEnv('STRIPE_SECRET_KEY', ''),
    stripePublicKey: getOptionalEnv('STRIPE_PUBLIC_KEY', ''),
    stripeWebhookSecret: getOptionalEnv('STRIPE_WEBHOOK_SECRET', ''),
  },

  // Business configuration
  business: {
    studioName: getOptionalEnv('STUDIO_NAME', 'Tattoo Studio'),
    studioAddress: getOptionalEnv('STUDIO_ADDRESS', '123 Main St, Anytown, ST 12345'),
    studioPhone: getOptionalEnv('STUDIO_PHONE', '(555) 123-4567'),
    studioEmail: getOptionalEnv('STUDIO_EMAIL', 'contact@example.com'),
    businessHoursStart: getNumberEnv('BUSINESS_HOURS_START', 9), // 9 AM
    businessHoursEnd: getNumberEnv('BUSINESS_HOURS_END', 18), // 6 PM
    timezone: getOptionalEnv('TIMEZONE', 'America/New_York'),
  },

  // Integration configuration
  integrations: {
    googleCalendar: {
      enabled: getBooleanEnv('ENABLE_GOOGLE_CALENDAR', false),
      clientId: getOptionalEnv('GOOGLE_CLIENT_ID', ''),
      clientSecret: getOptionalEnv('GOOGLE_CLIENT_SECRET', ''),
    },
  },

  // Cron configuration
  cron: {
    secret: getOptionalEnv('CRON_SECRET', ''),
    emailQueueInterval: getOptionalEnv('CRON_EMAIL_QUEUE_INTERVAL', '*/15 * * * *'), // Every 15 minutes
    reminderTime: getOptionalEnv('CRON_REMINDER_TIME', '0 9 * * *'), // 9 AM daily
  },
};

export default config;
