'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Unused import: import { useAuthStore } from '@/lib/auth/auth-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';

interface ForgotPasswordFormProps {
  redirectPath?: string;
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ 
  // redirectPath is unused but kept for API compatibility
  // redirectPath = '/auth/forgot-password-success',
  onSuccess 
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (!error) {
        setIsSuccess(true);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMessage('Error sending password reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </p>
          <Button 
            className="w-full"
            onClick={() => router.push('/auth/login')}
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-center text-sm">
          Remember your password?{' '}
          <a
            href="/auth/login"
            className="text-primary hover:underline"
          >
            Back to Login
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ForgotPasswordForm;