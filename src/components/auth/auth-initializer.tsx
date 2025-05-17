'use client';

import { useEffect } from 'react';
import { useInitializeAuth } from '@/store/useAuthStore';

/**
 * Auth Initializer component
 * 
 * This component initializes authentication on application load
 * and sets up auth state listeners for Supabase Auth changes.
 * 
 * Place this in your root layout to ensure auth is always initialized.
 */
export function AuthInitializer() {
  const { setupAuthListener, initialized } = useInitializeAuth();

  useEffect(() => {
    // Set up auth listener and handle cleanup
    const unsubscribe = setupAuthListener();
    
    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [setupAuthListener]);

  return null; // This component doesn't render anything
}

export default AuthInitializer;
