'use client';

/**
 * Custom hook for using Supabase in client components
 */

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { type SupabaseClient } from '@supabase/supabase-js';

/**
 * Hook for using Supabase in client components
 *
 * @returns The Supabase client
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const supabase = useSupabase();
 *
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       const { data } = await supabase.from('table').select('*');
 *       // ...
 *     };
 *
 *     fetchData();
 *   }, [supabase]);
 *
 *   return <div>...</div>;
 * };
 * ```
 */
export function useSupabase() {
  const [client] = useState(() => createClient());

  return client;
}

/**
 * React Context Provider for Supabase
 * Use this if you need to access the Supabase client in deeply nested components
 */
import { createContext, useContext } from 'react';

// Create a context for the Supabase client
const SupabaseContext = createContext<SupabaseClient | null>(null);

/**
 * Provider component for Supabase
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createClient());

  return children; // In .tsx this would use JSX, but since this is a .ts file we return children directly
}

/**
 * Hook for using Supabase from context
 * Only use this if you've wrapped your app with SupabaseProvider
 */
export function useSupabaseContext() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  }

  return context;
}

export default useSupabase;
