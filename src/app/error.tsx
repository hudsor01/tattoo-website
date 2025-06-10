'use client';

import { usePathname } from 'next/navigation';
import { ErrorHandler } from '@/components/error/error-boundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  
  // Determine variant based on route
  let variant: 'admin' | 'gallery' | 'global' | 'default' = 'default';
  
  if (pathname.includes('/gallery')) {
    variant = 'gallery';
  } else if (pathname.includes('/admin')) {
    variant = 'admin';
  }
  
  return <ErrorHandler error={error} reset={reset} variant={variant} />;
}