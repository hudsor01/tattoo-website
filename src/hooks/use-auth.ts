'use client';

import { useAuthState, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { logger } from "@/lib/logger";
export function useAuth() {
  const authState = useAuthState();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
          },
        },
      });
    } catch (error) {
      void logger.error('Sign out error:', error);
    }
  }, [router]);

  const guards = {
    requireAuth: (redirectTo = '/auth') => {
      if (!authState.isLoading && !authState.isSignedIn) {
        router.push(redirectTo);
        return false;
      }
      return true;
    },
    
    requireAdmin: (redirectTo = '/unauthorized') => {
      if (!authState.isLoading && !authState.isAdmin) {
        router.push(redirectTo);
        return false;
      }
      return true;
    },
    
    requireArtist: (redirectTo = '/unauthorized') => {
      if (!authState.isLoading && !authState.isArtist) {
        router.push(redirectTo);
        return false;
      }
      return true;
    },
  };

  return {
    ...authState,
    signOut: handleSignOut,
    guards,
  };
}
