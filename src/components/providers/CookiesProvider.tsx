'use client';

import React from 'react';

/**
 * This is a lightweight replacement for react-cookie's CookiesProvider
 * 
 * Since our custom implementation doesn't use React Context,
 * this is just a pass-through component that renders its children
 */
export default function CookiesProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}