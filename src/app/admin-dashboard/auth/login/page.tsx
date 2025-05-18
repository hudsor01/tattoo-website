'use client';

import React, { useState } from 'react';
import { login, signup } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (action: (formData: FormData) => Promise<void>) => {
    setIsLoading(true);
    try {
      await action(new FormData(document.querySelector('form')!));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-3xl font-bold text-primary">Ink 37</h1>
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                formAction={login}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="flex-1"
                formAction={signup}
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}