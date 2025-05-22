/**
 * Browser Supabase Client
 * Use this client in client components
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Return a dummy client if Supabase is not configured
  if (!process.env['NEXT_PUBLIC_SUPABASE_URL'] || 
      !process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
      process.env['NEXT_PUBLIC_SUPABASE_URL'] === 'https://qrcweallqlcgwiwzhqpb.supabase.co') {
    return createBrowserClient(
      'https://dummy.supabase.co',
      'dummy-key',
    );
  }
  
  return createBrowserClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );
}
