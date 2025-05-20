'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-system';
import { OAuthButton, MagicLinkButton } from '@/components/auth/supabase/auth-buttons';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthFormProps {
  isAdmin?: boolean;
  redirectPath?: string;
  showSocialLogin?: boolean;
  showMagicLink?: boolean;
  showRegister?: boolean;
  providers?: ('google' | 'github' | 'twitter' | 'discord')[];
}

/**
 * Auth Form
 *
 * A comprehensive authentication form that combines:
 * - Shadcn UI components
 * - Supabase Auth
 * - Multiple authentication methods
 * - Responsive design
 */
export function AuthForm({
  isAdmin = false,
  redirectPath,
  showSocialLogin = true,
  showMagicLink = true,
  showRegister = true,
  providers = ['google', 'github'],
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [activeTab, setActiveTab] = React.useState<string>('signin');

  // Get auth methods from auth-system
  const { signIn, signUp } = useAuthStore();

  // Form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Handle sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await signIn(email, password);

      if (!error) {
        // Redirect to returnTo param or default path
        const defaultPath = isAdmin ? '/admin' : '/client-portal';
        const finalRedirectPath = redirectPath || returnTo || defaultPath;

        router.push(finalRedirectPath);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, {
        role: isAdmin ? 'admin_pending' : 'client',
      });

      if (!error) {
        // Email confirmation required
        setSuccess('Check your email for a confirmation link!');
        
        // Auto-confirm enabled in Supabase, redirect user
        const defaultPath = isAdmin ? '/admin/welcome' : '/client-portal/register-success';
        const finalRedirectPath = redirectPath || returnTo || defaultPath;

        router.push(finalRedirectPath);
      } else {
        setError('An error occurred during registration');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle magic link - currently unused but kept for future reference
  // const handleMagicLink = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     await sendMagicLink(email);
  //     setSuccess('Check your email for a magic link!');
  //   } catch (error) {
  //     console.error('Magic link error:', error);
  //     setError('An error occurred sending the magic link');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Handle OAuth provider sign in - currently unused but kept for future reference
  // const handleProviderSignIn = async (provider: 'google' | 'github' | 'twitter' | 'discord') => {
  //   setError(null);
  //   try {
  //     await signInWithProvider(provider, window.location.origin + (returnTo || ''));
  //   } catch (error) {
  //     console.error(`${provider} sign in error:`, error);
  //     setError(`An error occurred during ${provider} sign in`);
  //   }
  // };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isAdmin ? 'Admin Portal' : 'Client Portal'}</CardTitle>
        <CardDescription>
          {activeTab === 'signin'
            ? 'Sign in to access your account'
            : activeTab === 'signup'
              ? 'Create a new account'
              : 'Get a magic link sent to your email'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            {showRegister && <TabsTrigger value="signup">Register</TabsTrigger>}
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-signin">Password</Label>
                  <a
                    href={isAdmin ? '/admin/forgot-password' : '/client-portal/forgot-password'}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password-signin"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              {showMagicLink && (
                <div className="text-center mt-4">
                  <MagicLinkButton
                    className="text-sm text-muted-foreground hover:text-primary"
                    redirectTo={redirectPath}
                  >
                    Sign in with magic link
                  </MagicLinkButton>
                </div>
              )}
            </form>
          </TabsContent>

          {showRegister && (
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          )}
        </Tabs>

        {showSocialLogin && providers.length > 0 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {providers.map(provider => (
                <OAuthButton
                  key={provider}
                  provider={provider}
                  redirectTo={redirectPath || returnTo || undefined}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        {!showRegister ? (
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <a
              href={isAdmin ? '/admin/contact' : '/client-portal/register'}
              className="text-primary hover:underline"
            >
              {isAdmin ? 'Contact us' : 'Register'}
            </a>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}

export default AuthForm;