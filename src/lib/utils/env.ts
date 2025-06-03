/**
 * Environment variable access helper
 * 
 * This utility provides type-safe access to environment variables
 * and fixes TypeScript TS4111 index signature access errors.
 */

import { z } from 'zod';

import { logger } from "@/lib/logger";
// Environment variable validation schemas
const clientEnvSchema = z.object({
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().optional(),

  // Database (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Authentication (Better Auth)
  NEXT_PUBLIC_AUTH_SECRET: z.string().optional(),
  NEXT_PUBLIC_AUTH_URL: z.string().default('/api/auth'),

  // Cal.com Integration
  NEXT_PUBLIC_CAL_USERNAME: z.string().optional(),
  
  // Media CDN
  NEXT_PUBLIC_MEDIA_CDN: z.string().optional(),
  
  // Google Tag Manager
  NEXT_PUBLIC_GTM_ID: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  
  // Node environment (provided for client components that need it)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Server-side environment variable schema
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
  
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // Authentication
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Email
  RESEND_API_KEY: z.string().optional(),
  ARTIST_EMAIL: z.string().optional(),
  CONTACT_EMAIL: z.string().optional(),
  CONTACT_PHONE: z.string().optional(),
  
  // Cal.com Integration
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
  
  // PWA 
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NPM_PACKAGE_VERSION: z.string().optional(),
  BUILD_TIME: z.string().optional(),
}).passthrough(); // Allow unknown fields to pass through

// Validate client-side environment variables
function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] ?? 'https://ink37tattoos.com',
    NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'],
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    NEXT_PUBLIC_AUTH_SECRET: process.env['NEXT_PUBLIC_AUTH_SECRET'],
    NEXT_PUBLIC_AUTH_URL: process.env['NEXT_PUBLIC_AUTH_URL'],
    NEXT_PUBLIC_CAL_USERNAME: process.env['NEXT_PUBLIC_CAL_USERNAME'],
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

    // In development, we still need to return the environment variables even if they're not valid
    return clientEnv as z.infer<typeof clientEnvSchema>;
  }

  return result.data;
}

// Validate server-side environment variables (when not in browser)
function validateServerEnv() {
  // Skip in browser context
  if (typeof window !== 'undefined') {
    return {};
  }

  const serverEnv = {
    // Database
    DATABASE_URL: process.env['DATABASE_URL'],
    DIRECT_URL: process.env['DIRECT_URL'],
    
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'],
    
    // Authentication
    AUTH_SECRET: process.env['AUTH_SECRET'],
    
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'],
    GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'],
    
    // Email
    RESEND_API_KEY: process.env['RESEND_API_KEY'],
    ARTIST_EMAIL: process.env['ARTIST_EMAIL'],
    CONTACT_EMAIL: process.env['CONTACT_EMAIL'],
    CONTACT_PHONE: process.env['CONTACT_PHONE'],
    
    // Cal.com Integration
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
    
    // PWA
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'],
    
    // Node environment
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

    // Only throw in production
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('Invalid server environment variables');
    }

    // In development, we still need to return the environment variables even if they're not valid
    return serverEnv as z.infer<typeof serverEnvSchema>;
  }

  return result.data;
}

// Export validated environment variables
export const ENV = validateClientEnv();
export const SERVER_ENV = validateServerEnv();

/**
 * Get an environment variable safely, using the correct ENV object
 * Works in both client and server contexts
 */
export function getEnvSafe(name: string, defaultValue: string = ''): string {
  // Check if it's a server-side environment variable
  if (name.startsWith('NEXT_PUBLIC_')) {
    return (ENV as Record<string, string | undefined>)[name] ?? defaultValue;
  }
  
  // For server-side variables
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
  // Use index notation to satisfy TS4111
  const value = process.env[name];
  // Make sure we return a string, not undefined or null
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
    // Try to parse the value as JSON if T is not string
    if (typeof defaultValue !== 'string') {
      return JSON.parse(value) as T;
    }
    
    // Otherwise treat as string
    return value as unknown as T;
  } catch {
    // If parsing fails, return the default value
    return defaultValue;
  }
}
