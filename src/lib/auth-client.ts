'use client';

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Create auth client exactly as per Better Auth documentation
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NODE_ENV === "production" 
      ? "https://ink37tattoos.com" 
      : "http://localhost:3000"),
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
