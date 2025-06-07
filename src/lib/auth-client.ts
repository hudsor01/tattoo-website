'use client';

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Create auth client exactly as per Better Auth documentation
// Determine the correct base URL for different environments
function getBaseURL() {
  // Client-side: use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: determine based on environment
  // Vercel production
  if (process.env['VERCEL_ENV'] === 'production') {
    return "https://ink37tattoos.com";
  }
  
  // Vercel preview/development
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}`;
  }
  
  // Local development
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    adminClient()
  ],
});

// Export individual methods for convenience
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession 
} = authClient;

// Export admin functions
export const {
  admin: {
    createUser,
    listUsers,
    banUser,
    unbanUser,
    removeUser,
    impersonateUser,
    stopImpersonating,
    listUserSessions,
    revokeUserSession,
    setRole
  }
} = authClient;

// Export types exactly as per Better Auth docs
export type Session = typeof authClient.$Infer.Session;

// Simple user hook following Better Auth patterns
export function useUser() {
  const { data: session, isPending, error } = useSession();
  
  // Return exactly what Better Auth session contains
  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    isLoading: isPending,
    isSignedIn: !!session?.user,
    error,
    // Simplified role check - only admin/not-admin
    isAdmin: session?.user?.role === 'admin',
  };
}

// Convenience hooks
export function useIsAdmin() {
  const { isAdmin } = useUser();
  return isAdmin;
}

// Simple auth state hook
export function useAuthState() {
  const { user, session, isLoading, isSignedIn, error, isAdmin } = useUser();
  
  return {
    user,
    session,
    isLoading,
    isSignedIn,
    isAdmin,
    error,
    requireAuth: () => isSignedIn && !isLoading,
    requireAdmin: () => isAdmin && !isLoading,
  };
}

// Admin permissions hook - simplified to admin only
export function useAdminPermissions() {
  const { isAdmin } = useUser();
  
  return {
    canCreateUsers: isAdmin,
    canBanUsers: isAdmin,
    canViewAllUsers: isAdmin,
    canManageRoles: isAdmin,
    canImpersonate: isAdmin,
    canDeleteUsers: isAdmin,
  };
}
