'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ClientHydrationProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientHydration - Handles safe client-side hydration
 * 
 * This component prevents hydration mismatches by only rendering
 * children after the component has mounted on the client.
 * 
 * This is critical for components that use authentication state
 * to prevent "text content did not match" hydration errors.
 */
export default function ClientHydration({ 
  children, 
  fallback = null 
}: ClientHydrationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return <>{children}</>;
}