'use client';

import { useAuthState } from '@/lib/auth-client';
import { ReactNode, useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireArtist?: boolean;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

/**
 * Protected Route Component with performance improvements
 * 
 * Key optimizations:
 * - Uses single useAuthState hook instead of multiple hooks
 * - Memoized components to prevent recreation
 * - Simplified logic flow
 * - No router calls (parent handles redirects)
 */
export function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireArtist = false,
  fallback = null,
  loadingComponent,
}: ProtectedRouteProps) {
  const { isLoading, isSignedIn, isAdmin, isArtist } = useAuthState();

  // Memoize loading component to prevent recreation
  const LoadingComponent = useMemo(() => {
    return loadingComponent ?? (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }, [loadingComponent]);

  // Move useMemo before conditional returns to fix hook rule
  const hasRequiredPermission = useMemo(() => {
    if (requireAdmin) return isAdmin;
    if (requireArtist) return isArtist;
    if (requireAuth) return isSignedIn;
    return true; // No requirements
  }, [requireAdmin, requireArtist, requireAuth, isAdmin, isArtist, isSignedIn]);

  // Show loading while checking authentication
  if (isLoading) {
    return LoadingComponent;
  }

  // If requirements not met, show fallback
  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
}

/**
 * Convenience component for admin-only content
 */
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <ProtectedRoute requireAdmin fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Convenience component for artist-level content
 */
export function ArtistOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <ProtectedRoute requireArtist fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Convenience component for authenticated content
 */
export function AuthenticatedOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <ProtectedRoute requireAuth fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
