'use client';

import { useEffect } from 'react';
import { ImageOff, RefreshCw, Home } from 'lucide-react';

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    void console.error('Gallery error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <ImageOff className="h-16 w-16 text-red-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Gallery Loading Error</h1>
            <p className="text-zinc-400">
              We're having trouble loading the tattoo gallery. This might be a temporary issue with
              image loading.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload gallery</span>
          </button>

          <a
            href="/"
            className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-3 rounded-lg w-full"
          >
            <Home className="h-4 w-4" />
            <span>Go home</span>
          </a>
        </div>

        <div className="text-sm text-zinc-500">
          <p>You can also check out our work on social media:</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a
              href="https://www.instagram.com/fennyg83/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors underline"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/fennyg83/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors underline"
            >
              TikTok
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
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
