'use client';

import { ErrorHandler } from '@/components/error/error-boundary';

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorHandler error={error} reset={reset} variant="gallery" />;
}
