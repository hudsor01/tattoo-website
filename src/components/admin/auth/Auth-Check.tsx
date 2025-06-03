"use client";

import { useUser, useIsAdmin, authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ShieldAlert, LogOut, Chrome } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logger } from "@/lib/logger";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const { user, isLoading, isSignedIn } = useUser();
  const isAdmin = useIsAdmin();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set isClient to true on mount to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, [setIsClient]);

  // Handle sign out
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    // Make direct POST request to Better Auth social sign-in endpoint
    fetch('/api/auth/sign-in/social', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        callbackURL: '/admin/dashboard',
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      if (data.url && data.redirect) {
        // Redirect to Google OAuth
        window.location.href = data.url
      } else {
        throw new Error('Invalid response from auth server')
      }
    })
    .catch(err => {
      void logger.error('Google sign in error:', err)
    });
  };

  // During server render or initial client hydration, show minimal loading state
  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
      </div>
    );
  }

  // If still loading after hydration, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, show sign-in option
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] max-w-md mx-auto p-4 space-y-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to sign in to access the admin dashboard.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3 w-full">
          <Button
            onClick={() => { void handleGoogleSignIn(); }}
            variant="outline"
            className="w-full"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continue with Google
          </Button>
          
          <Button
            onClick={() => router.push('/auth')}
            variant="default"
            className="w-full"
          >
            Sign In with Email
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] max-w-md mx-auto p-4 space-y-4">
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-6 w-6 mb-2" />
          <AlertDescription className="text-center">
            <strong className="text-lg block mb-2">Access Denied</strong>
            <p>You are not authorized to access the admin dashboard.</p>
            <p className="mt-1 text-sm">
              Only administrators can access this area. Current user: {user?.email}
            </p>
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => { void handleSignOut(); }}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button 
            variant="default" 
            onClick={() => router.push("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated and admin, show the children
  return <>{children}</>;
}
