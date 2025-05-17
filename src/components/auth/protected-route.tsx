'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, checkAccess } from '@/lib/auth/auth-system';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * ProtectedRoute component
 * 
 * Provides consistent authentication and authorization checks
 * for protecting routes that require authentication.
 */
export function ProtectedRoute({
  children,
  adminOnly = false,
  redirectTo,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle redirect logic when authentication or authorization fails
  useEffect(() => {
    if (!isLoading && isClient) {
      // Not authenticated
      if (!user) {
        // Use provided redirectTo or default based on whether admin is required
        const redirectPath = redirectTo || (adminOnly ? '/admin/login' : '/customer/login');
        const returnPath = typeof window !== 'undefined' 
          ? encodeURIComponent(window.location.pathname) 
          : '';
        
        router.push(`${redirectPath}?returnTo=${returnPath}`);
        return;
      }

      // Not authorized (requires admin but user is not admin)
      if (adminOnly && !isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, isAdmin, router, adminOnly, redirectTo, isClient]);

  // Show custom fallback or default loading indicator
  if (isLoading || !isClient) {
    return fallback || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <p className="text-foreground mt-4">Loading...</p>
      </Box>
    );
  }

  // Hide content if not authenticated or not authorized
  if (!user || (adminOnly && !isAdmin)) {
    return null;
  }

  // Render children when authenticated and authorized
  return <>{children}</>;
}

export default ProtectedRoute;