'use client';

import React from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

/**
 * Lazy Motion Provider - loads only necessary motion features
 * Reduces bundle size by ~30KB for framer-motion
 */
export function LazyMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}