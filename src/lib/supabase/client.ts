import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { getRequiredEnvVar } from '@/lib/utils/env';

// Get required environment variables for Supabase client
const supabaseUrl = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
