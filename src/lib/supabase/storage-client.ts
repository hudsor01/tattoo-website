import { createClient } from '@supabase/supabase-js';
import { getRequiredEnvVar } from '@/lib/utils/env';

// Get required environment variables for Supabase storage client
const SUPABASE_URL = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Supabase client for storage only
export const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
