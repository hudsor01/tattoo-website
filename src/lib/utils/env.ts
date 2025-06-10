import { z } from 'zod';
import { logger } from "@/lib/logger";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_CAL_USERNAME: z.string().optional(),
  NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_CAL_API_URL: z.string().optional(),
  NEXT_PUBLIC_X_CAL_ID: z.string().optional(),
  NEXT_PUBLIC_REFRESH_URL: z.string().optional(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().optional(),
  NEXT_PUBLIC_MEDIA_CDN: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ARTIST_EMAIL: z.string().optional(),
  CONTACT_EMAIL: z.string().optional(),
  CONTACT_PHONE: z.string().optional(),
  CAL_API_KEY: z.string().optional(),
  CAL_WEBHOOK_SECRET: z.string().optional(),
  CAL_OAUTH_CLIENT_ID: z.string().optional(),
  CAL_ACCESS_TOKEN: z.string().optional(),
  CAL_ORGANIZATION_ID: z.string().optional(),
  CAL_API_URL: z.string().optional(),
  CAL_REFRESH_URL: z.string().optional(),
  CAL_FREE_CONSULTATION_EVENT_ID: z.string().optional(),
  CAL_DESIGN_REVIEW_EVENT_ID: z.string().optional(),
  CAL_TATTOO_SESSION_EVENT_ID: z.string().optional(),
  CAL_TOUCH_UP_EVENT_ID: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NPM_PACKAGE_VERSION: z.string().optional(),
  BUILD_TIME: z.string().optional(),
}).passthrough();

function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://ink37tattoos.com',
    NEXT_PUBLIC_CAL_USERNAME: process.env['NEXT_PUBLIC_CAL_USERNAME'],
    NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID: process.env['NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID'],
    NEXT_PUBLIC_CAL_API_URL: process.env['NEXT_PUBLIC_CAL_API_URL'],
    NEXT_PUBLIC_X_CAL_ID: process.env['NEXT_PUBLIC_X_CAL_ID'],
    NEXT_PUBLIC_REFRESH_URL: process.env['NEXT_PUBLIC_REFRESH_URL'],
    NEXT_PUBLIC_CONTACT_EMAIL: process.env['NEXT_PUBLIC_CONTACT_EMAIL'],
    NEXT_PUBLIC_MEDIA_CDN: process.env['NEXT_PUBLIC_MEDIA_CDN'],
    NEXT_PUBLIC_GTM_ID: process.env['NEXT_PUBLIC_GTM_ID'],
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env['NEXT_PUBLIC_VERCEL_ANALYTICS_ID'],
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'],
    NODE_ENV: process.env['NODE_ENV'],
  };

  const result = clientEnvSchema.safeParse(clientEnv);

  if (!result.success) {
    void logger.error('❌ Invalid client environment variables:');
    result.error.issues.forEach((issue) => {
      void logger.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });

    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Invalid client environment variables');
    }

    return clientEnv as z.infer<typeof clientEnvSchema>;
  }

  return result.data;
}

function validateServerEnv() {
  if (typeof window !== 'undefined') {
    return {};
  }

  const serverEnv = {
    DATABASE_URL: process.env['DATABASE_URL'],
    DIRECT_URL: process.env['DIRECT_URL'],
    RESEND_API_KEY: process.env['RESEND_API_KEY'],
    ARTIST_EMAIL: process.env['ARTIST_EMAIL'],
    CONTACT_EMAIL: process.env['CONTACT_EMAIL'],
    CONTACT_PHONE: process.env['CONTACT_PHONE'],
    ADMIN_EMAILS: process.env['ADMIN_EMAILS'],
    CAL_API_KEY: process.env['CAL_API_KEY'],
    CAL_WEBHOOK_SECRET: process.env['CAL_WEBHOOK_SECRET'],
    CAL_OAUTH_CLIENT_ID: process.env['CAL_OAUTH_CLIENT_ID'],
    CAL_ACCESS_TOKEN: process.env['CAL_ACCESS_TOKEN'],
    CAL_ORGANIZATION_ID: process.env['CAL_ORGANIZATION_ID'],
    CAL_API_URL: process.env['CAL_API_URL'],
    CAL_REFRESH_URL: process.env['CAL_REFRESH_URL'],
    CAL_FREE_CONSULTATION_EVENT_ID: process.env['CAL_FREE_CONSULTATION_EVENT_ID'],
    CAL_DESIGN_REVIEW_EVENT_ID: process.env['CAL_DESIGN_REVIEW_EVENT_ID'],
    CAL_TATTOO_SESSION_EVENT_ID: process.env['CAL_TATTOO_SESSION_EVENT_ID'],
    CAL_TOUCH_UP_EVENT_ID: process.env['CAL_TOUCH_UP_EVENT_ID'],
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'],
    NODE_ENV: process.env['NODE_ENV'],
    NPM_PACKAGE_VERSION: process.env['NPM_PACKAGE_VERSION'],
    BUILD_TIME: process.env['BUILD_TIME'],
  };

  const result = serverEnvSchema.safeParse(serverEnv);

  if (!result.success) {
    void logger.error('❌ Invalid server environment variables:');
    result.error.issues.forEach((issue) => {
      void logger.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    // Only throw error in production if it's a runtime error, not build time
    if (process.env['NODE_ENV'] === 'production' && !process.env['VERCEL_ENV']) {
      throw new Error('Invalid server environment variables');
    }
  }

  return result.data;
}

export const ENV = validateClientEnv();
export const SERVER_ENV = validateServerEnv();
export function getEnvSafe(name: string, defaultValue: string = ''): string {
  if (name.startsWith('NEXT_PUBLIC_')) {
    return (ENV as Record<string, string | undefined>)[name] ?? defaultValue;
  }
  return (SERVER_ENV as Record<string, string | undefined>)[name] ?? process.env[name] ?? defaultValue;
}

/**
 * Get an environment variable with type safety
 * 
 * @param name The name of the environment variable
 * @param defaultValue Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnvVar(name: string, defaultValue: string = ''): string {
  const value = process.env[name];
  return (value !== undefined && value !== '') ? value : defaultValue;
}

/**
 * Check if an environment variable is defined
 * 
 * @param name The name of the environment variable
 * @returns True if defined and not empty
 */
export function hasEnvVar(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value !== '';
}

/**
 * Get required environment variable with error handling
 * 
 * @param name The name of the environment variable
 * @throws Error if the environment variable is not defined
 * @returns The environment variable value
 */
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  
  if (value === undefined || value === '') {
    // In development, provide a helpful error
    if (process.env['NODE_ENV'] === 'development') {
      throw new Error(`Required environment variable ${name} is not defined. Please check your .env file.`);
    }
    
    // In production, log error but don't crash
    void logger.error(`Required environment variable ${name} is not defined.`);
    return '';
  }
  
  return value;
}

/**
 * Get environment variable with specific type casting
 * 
 * @param name The name of the environment variable
 * @param defaultValue Default value if environment variable is not defined
 * @returns The environment variable value cast to the type of defaultValue
 */
export function getTypedEnvVar<T>(name: string, defaultValue: T): T {
  const value = process.env[name];

  if (value === undefined || value === '') {
    return defaultValue;
  }

  try {
    if (typeof defaultValue !== 'string') {
      return JSON.parse(value) as T;
    }

    return value as unknown as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Get the app URL safely with guaranteed fallback
 * 
 * @returns Always returns a valid URL string
 */
export function getAppUrl(): string {
  if (ENV.NEXT_PUBLIC_APP_URL && ENV.NEXT_PUBLIC_APP_URL !== '') {
    return ENV.NEXT_PUBLIC_APP_URL;
  }
  
  const envUrl = process.env['NEXT_PUBLIC_APP_URL'];
  if (envUrl && envUrl !== '') {
    return envUrl;
  }
  
  return 'https://ink37tattoos.com';
}

/**
 * Create a safe URL constructor that never throws
 * 
 * @param path The path to append to the base URL
 * @param baseUrl Optional base URL (defaults to app URL)
 * @returns URL object or null if construction fails
 */
export function createSafeUrl(path: string, baseUrl?: string): URL | null {
  try {
    const base = baseUrl ?? getAppUrl();
    return new URL(path, base);
  } catch (error) {
    void logger.error('Failed to create URL', { path, baseUrl, error });
    return null;
  }
}

/**
 * Get admin emails from environment variable
 * 
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  const adminEmailsStr = getEnvVar('ADMIN_EMAILS', process.env['NEXT_PUBLIC_CONTACT_EMAIL'] ?? 'contact@ink37tattoos.com');
  return adminEmailsStr.split(',').map(email => email.trim()).filter(email => email.length > 0);
}
