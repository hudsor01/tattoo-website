import { z } from 'zod';

// Environment variable validation schemas
const serverEnvSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Supabase)
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  DIRECT_URL: z.string().url('Invalid DIRECT_URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Authentication (Clerk)
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // Cal.com Integration
  CAL_API_KEY: z.string().optional(),
  CAL_WEBHOOK_SECRET: z.string().optional(),

  // Email & Analytics
  RESEND_API_KEY: z.string().optional(),
  ARTIST_EMAIL: z.string().email('Invalid ARTIST_EMAIL').optional(),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid NEXT_PUBLIC_APP_URL').optional(),
});

const clientEnvSchema = z.object({
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid NEXT_PUBLIC_APP_URL').optional(),

  // Database (Supabase)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/admin'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/admin'),

  // Cal.com Integration
  NEXT_PUBLIC_CAL_USERNAME: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

// Validate environment variables
export function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    void console.error('❌ Invalid server environment variables:');
    result.error.issues.forEach((issue) => {
      void console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid server environment variables');
    }
  }

  return result.data ?? {};
}

export function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    NEXT_PUBLIC_CAL_USERNAME: process.env.NEXT_PUBLIC_CAL_USERNAME,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };

  const result = clientEnvSchema.safeParse(clientEnv);

  if (!result.success) {
    void console.error('❌ Invalid client environment variables:');
    result.error.issues.forEach((issue) => {
      void console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid client environment variables');
    }
  }

  return result.data ?? {};
}

// Export validated environment variables
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Helper to check if required environment variables are set
export function checkRequiredEnvVars() {
  const missing: string[] = [];

  // Check critical variables
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    missing.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  if (!process.env.CLERK_SECRET_KEY) missing.push('CLERK_SECRET_KEY');

  if (missing.length > 0) {
    void console.error('❌ Missing required environment variables:');
    missing.forEach((varName) => {
      void console.error(`  ${varName}`);
    });

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  return missing.length === 0;
}

// Validate on import (server-side only)
if (typeof window === 'undefined') {
  checkRequiredEnvVars();
}
