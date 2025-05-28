'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    void console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="font-inter bg-black text-white antialiased">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-red-500">500</h1>
              <h2 className="text-2xl font-semibold">Something went wrong!</h2>
              <p className="text-zinc-400 max-w-md mx-auto">
                We're experiencing some technical difficulties. Our team has been notified and is
                working on a fix.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try again
              </button>

              <div className="flex justify-center space-x-4">
                <a href="/" className="text-zinc-400 hover:text-white transition-colors underline">
                  Go home
                </a>
                <a
                  href="/contact"
                  className="text-zinc-400 hover:text-white transition-colors underline"
                >
                  Contact support
                </a>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && error.digest && (
              <details className="text-left bg-zinc-900 p-4 rounded-lg max-w-lg mx-auto">
                <summary className="cursor-pointer text-zinc-400 mb-2">
                  Error details (development only)
                </summary>
                <code className="text-xs text-red-400 block">Digest: {error.digest}</code>
                <code className="text-xs text-red-400 block mt-2">{error.message}</code>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
