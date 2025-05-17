'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import { type MotionCardProps } from '@/types/component-types';

export function MotionCard({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  ...props
}: MotionCardProps &
  Omit<React.ComponentPropsWithoutRef<typeof motion.div>, keyof MotionCardProps>) {
  // Define animation variants based on direction
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 50 };
      case 'down':
        return { opacity: 0, y: -50 };
      case 'left':
        return { opacity: 0, x: 50 };
      case 'right':
        return { opacity: 0, x: -50 };
      default:
        return { opacity: 0, y: 50 };
    }
  };

  const getFinalPosition = () => {
    return { opacity: 1, y: 0, x: 0 };
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={getFinalPosition()}
      viewport={{ once: true }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        'relative rounded-lg border border-white/10 bg-tattoo-black/30 p-6 shadow-lg backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
