import { Target, TargetAndTransition } from 'framer-motion';

/**
 * TypeScript declarations for Framer Motion custom variants
 */

// Simple variant with just target properties
export interface SimpleVariant {
  [key: string]: Target;
}

// Variant with transition properties
export interface TransitionVariant {
  [key: string]: TargetAndTransition;
}

// Variant with custom props (like index-based variants)
export interface CustomVariant<P> {
  [key: string]: (props: P) => TargetAndTransition;
}

// Custom variant that accepts a number index
export interface IndexVariant {
  [key: string]: Target | ((i: number) => TargetAndTransition);
}
