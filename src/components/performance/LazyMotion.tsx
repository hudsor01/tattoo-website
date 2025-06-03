'use client';

import React from 'react';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';

/**
 * Lazy Motion Provider - loads only necessary motion features
 * Reduces bundle size by ~30KB for framer-motion
 * 
 * NOTE: Currently not in strict mode to allow gradual migration
 * from motion.div to m.div components across the codebase.
 */
export function LazyMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}

// Re-export the 'm' as 'motion' for easier migration
export { motion };
