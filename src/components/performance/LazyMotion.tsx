'use client';

import React from 'react';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';

/**
 * Lazy Motion Provider - loads only necessary motion features
 * Reduces bundle size by ~30KB for framer-motion
 * 
 * NOTE: Explicitly set strict={false} to allow both 'motion' and 'm' 
 * components to work together during migration period.
 */
export function LazyMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      {children}
    </LazyMotion>
  );
}

// Re-export the 'm' as 'motion' for easier migration
export { motion };
