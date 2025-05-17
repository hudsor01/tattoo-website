'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SupabaseDebug() {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...`
        : undefined,
    };

    setOutput(JSON.stringify(envVars, null, 2));
  }, []);

  const testConnection = async () => {
    try {
      setError(null);
      setOutput('Testing connection...');

      // Create client directly to compare with the imported version
      const directClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // Perform a simple health check
      const { data, error: healthError } = await directClient
        .from('_prisma_migrations')
        .select('*')
        .limit(1);

      if (healthError) {
        throw new Error(`Health check failed: ${healthError.message}`);
      }

      setOutput(
        JSON.stringify(
          {
            message: 'Connection successful',
            usingUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
            data: data || [],
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    } catch (err: unknown) {
      console.error('Connection test error:', err);
      setError(err.message || 'An unexpected error occurred');
      setOutput(
        JSON.stringify(
          {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    }
  };

  const compareUrlStructures = () => {
    const errorUrl = 'grcweallglcgwiwzhgpb.supabase.co';
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '';

    // Compare character by character
    const comparison = Array.from(errorUrl).map((char, i) => {
      const envChar = envUrl[i] || '';
      return {
        position: i,
        errorChar: char,
        envChar,
        match: char === envChar,
      };
    });

    setOutput(
      JSON.stringify(
        {
          errorUrl,
          envUrl,
          comparison,
          analysis: "The characters that don't match might indicate a typo or data corruption",
        },
        null,
        2,
      ),
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Debugger</CardTitle>
          <CardDescription>
            Diagnose issues with Supabase connection and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="flex flex-col space-y-2">
              <h3 className="font-medium">Environment Variables</h3>
              <div className="p-4 bg-slate-800 text-white rounded overflow-auto max-h-60">
                <pre className="text-xs whitespace-pre-wrap">{output}</pre>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={testConnection}>Test Direct Connection</Button>
              <Button variant="outline" onClick={compareUrlStructures}>
                Compare URL Structures
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">Error URL Analysis</h3>
            <div className="p-4 bg-slate-800 text-white rounded">
              <p className="text-xs mb-2">
                Error URL:{' '}
                <span className="font-mono">
                  Fahttps://grcweallglcgwiwzhgpb.supabase.co/auth/v1/token
                </span>
              </p>
              <p className="text-xs mb-2">
                Env URL: <span className="font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL}</span>
              </p>
              <p className="text-xs">
                The "Fa" prefix suggests a string concatenation error or a UI rendering issue where
                "Failed" was partially captured in the error output.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <p>
            The 500 error with "database error granting user" typically indicates an issue with
            Supabase's auth system, possibly due to database permissions or a connection issue.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
