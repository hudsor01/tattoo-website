'use client';

import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleIcon } from '@/components/icons'; 
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logger } from "@/lib/logger";

export function AdminLoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Use Better Auth's exact API from documentation
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (result.data) {
        // Success - redirect to admin dashboard
        router.push('/admin');
        router.refresh();
      } else if (result.error) {
        throw new Error(result.error.message ?? "Sign in failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      setError(errorMessage);
      void logger.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Better Auth's social sign-in API exactly as documented
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Google sign in failed");
      }
      
      // Better Auth handles redirects automatically
    } catch (err) {
      void logger.error('Google sign in error:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to sign in with Google.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111111]">
      <div className="w-full max-w-md px-4 mb-6 text-center">
        <img 
          src="/logo.png" 
          alt="Ink 37 Tattoos Logo" 
          className="h-24 mx-auto mb-2" 
        />
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
      </div>
      
      <Card className="w-full max-w-md mx-4 border-2 border-gray-700 shadow-xl bg-[#1c1c1c] text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Secure Access</CardTitle>
          <p className="text-sm text-center text-gray-400">
            Enter your credentials to access the admin dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="animate-fadeIn">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In Button */}
          <Button 
            variant="outline" 
            className="w-full h-11 flex items-center justify-center gap-2 font-medium transition-all hover:bg-slate-100@light hover:bg-slate-800@dark"
            onClick={() => void handleGoogleSignIn()}
            disabled={isLoading}
          >
            <GoogleIcon className="h-5 w-5" />
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 py-1 text-muted-foreground rounded-full">
                Or continue with email
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleEmailSignIn();
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleEmailSignIn();
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-2 font-medium"
              disabled={!email || !password || isLoading}
              onClick={() => void handleEmailSignIn()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </div>
          
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Tattoos. All rights reserved.</p>
        <p>Secured with Better Auth™</p>
      </div>
    </div>
  );
}