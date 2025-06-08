"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * 🚀 OPTIMIZED: Authentication wrapper with performance improvements
 * 
 * Key optimizations:
 * - Removed useState to prevent extra re-renders
 * - Simplified logic
 * - Memoized loading component
 * - Uses Better Auth session directly
 */
export function AuthWrapper({ 
  children, 
  fallback = null, 
  redirectTo = "/auth" 
}: AuthWrapperProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // 🚀 PERFORMANCE: Memoize the loading component to prevent recreation
  const LoadingComponent = useMemo(() => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-semibold mb-2">Checking authentication...</p>
      </div>
    </div>
  ), []);

  // 🔥 OPTIMIZED: Simplified logic without extra state
  if (isPending) {
    return LoadingComponent;
  }

  // If no session and redirectTo is provided, redirect immediately
  if (!session && redirectTo) {
    router.push(redirectTo);
    return LoadingComponent; // Show loading while redirecting
  }

  // If no session, show fallback
  if (!session) {
    return <>{fallback}</>;
  }

  // If authenticated, show children
  return <>{children}</>;
}

/**
 * 🚀 OPTIMIZED: Simple authentication guard without redirect
 */
export function AuthGuard({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  const { data: session, isPending } = useSession();

  // Show loading while checking
  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
      </div>
    );
  }

  // Show children if authenticated, fallback otherwise
  return session ? <>{children}</> : <>{fallback}</>;
}
