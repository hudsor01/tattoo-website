import type { HTMLMotionProps, Target, TargetAndTransition } from 'framer-motion';

export interface MotionCustomProps extends Omit<HTMLMotionProps<'div'>, 'whileHover'> {
  whileHover?: CustomMotionVariant;
}

export interface CustomMotionVariant {
  scale?: number;
  x?: number | string;
  y?: number | string;
  opacity?: number;
  rotate?: number;
  transition?: {
    duration?: number;
    ease?: string;
    delay?: number;
  };
  '--glow-opacity'?: number;
  '--glow-spread'?: string;
  [key: string]: unknown;
}

export type CustomTargetAndTransition = TargetAndTransition & {
  [key: `--${string}`]: Target;
};

export interface MotionTarget extends Target {
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    staggerChildren?: number;
    delayChildren?: number;
  };
}
