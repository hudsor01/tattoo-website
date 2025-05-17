'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDebug() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createClient = () => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  };

  const testSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const supabase = createClient();
      console.log('Testing sign in with:', { email, password });

      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', response);
      setResult(response);

      if (response.error) {
        setError(response.error.message);
      } else {
        setSuccess('Authentication successful!');
      }
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      setError(err.message || 'An unexpected error occurred');
      setResult(err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const supabase = createClient();
      console.log('Testing connection to Supabase');

      // Simple health check query
      const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);

      console.log('Connection test result:', { data, error });
      setResult({ data, error });

      if (error) {
        setError(`Connection error: ${error.message}`);
      } else {
        setSuccess('Successfully connected to Supabase database!');
      }
    } catch (err: unknown) {
      console.error('Connection test error:', err);
      setError(err.message || 'Failed to connect to Supabase');
      setResult(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Supabase Auth Debug</CardTitle>
          <CardDescription>Test your Supabase authentication connection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={testSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Testing...' : 'Test Sign In'}
              </Button>
              <Button type="button" variant="outline" onClick={testConnection} disabled={loading}>
                Test Connection
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4 p-4 bg-slate-800 text-white rounded overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground">
            <p>Environment Variables:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>
                NEXT_PUBLIC_SUPABASE_URL:{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </li>
              <li>
                NEXT_PUBLIC_SUPABASE_ANON_KEY:{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
