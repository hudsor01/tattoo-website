'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-6xl font-bold text-white mb-4">Critical Error</h1>
            <h2 className="text-2xl font-bold text-white mb-4">
              Something went seriously wrong
            </h2>
            <p className="text-gray-300 mb-8">
              We&apos;re experiencing technical difficulties. Please try again later.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-black rounded hover:bg-gray-100 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}