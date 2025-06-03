'use client';

import { createContext, useContext } from 'react';
import { useUser, useSession } from '@/lib/auth-client';
import type { AuthContextType, AuthProviderProps } from '@prisma/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Component
 * 
 * Provides authentication context to the entire application tree.
 * Use this as a high-level wrapper in your app layout.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoading, isSignedIn, error } = useUser();
  const { data: session } = useSession();

  // Build the context manually as a type assertion to fix type errors
  // This is needed due to the complex structure of the User type
  const contextValue = {
    user: user ? { 
      ...user,
      role: user.role ?? 'user' as const, // Ensure role exists with proper type
      phone: null // Add required phone property
    } : null,
    session: session ?? null,
    isLoading,
    isAuthenticated: isSignedIn,
    error,
  } as AuthContextType;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}
