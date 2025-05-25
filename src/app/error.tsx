'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    void console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">Oops!</h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-300 mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-white text-black hover:bg-gray-100"
          >
            Try again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}