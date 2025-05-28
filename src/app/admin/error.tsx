'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    void console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Admin Dashboard Error</h1>
            <p className="text-zinc-400">
              Something went wrong in the admin dashboard. This could be a temporary issue.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try again</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="/admin"
              className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
            <a
              href="/contact"
              className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Support</span>
            </a>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-zinc-900 p-4 rounded-lg">
            <summary className="cursor-pointer text-zinc-400 mb-2">
              Error details (development only)
            </summary>
            <div className="space-y-2">
              <code className="text-xs text-red-400 block">{error.message}</code>
              {error.digest && (
                <code className="text-xs text-red-400 block">Digest: {error.digest}</code>
              )}
              {error.stack && (
                <code className="text-xs text-red-400 block whitespace-pre-wrap">
                  {error.stack}
                </code>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
