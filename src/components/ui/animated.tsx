'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MotionProps, Variant } from 'framer-motion';
import React, { forwardRef } from 'react';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';
import {
  fadeAnimation,
  slideUpAnimation,
  slideDownAnimation,
  slideLeftAnimation,
  slideRightAnimation,
  scaleAnimation,
  modalAnimation,
  menuAnimation,
  sidebarAnimation,
  createAnimation
} from '@/lib/utils/animation';

// Define the different animation presets available
export type AnimationPreset = 
  | 'fade'
  | 'slideUp' 
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'modal'
  | 'menu'
  | 'sidebar'
  | 'none';

// Speed modifiers for animations
export type AnimationSpeed = 'fast' | 'normal' | 'slow';

// Props for the Animated component
export interface AnimatedProps extends Omit<MotionProps, 'initial' | 'animate' | 'exit'> {
  /**
   * The element to render
   * @default div
   */
  as?: ElementType;

  /**
   * The preset animation to use
   * @default fade
   */
  preset?: AnimationPreset;

  /**
   * The animation speed
   * @default normal
   */
  speed?: AnimationSpeed;

  /**
   * Delay before the animation starts (in seconds)
   */
  delay?: number;

  /**
   * Custom animation variants (overrides preset)
   */
  variants?: {
    hidden?: Variant;
    visible?: Variant;
    exit?: Variant;
  };

  /**
   * Whether the component should animate on mount
   * @default true
   */
  animate?: boolean;

  /**
   * Whether the component should be present in the DOM
   * @default true
   */
  show?: boolean;

  /**
   * Children elements
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Get duration value based on speed
 */
const getDuration = (speed: AnimationSpeed): number => {
  switch (speed) {
    case 'fast':
      return 0.15;
    case 'slow':
      return 0.5;
    default:
      return 0.3;
  }
};

/**
 * Get the animation variants based on the preset
 */
const getAnimationVariants = (preset: AnimationPreset, speed: AnimationSpeed, delay?: number) => {
  const duration = getDuration(speed);
  
  switch (preset) {
    case 'fade':
      return createAnimation(fadeAnimation, { duration, delay });
    case 'slideUp':
      return createAnimation(slideUpAnimation, { duration, delay });
    case 'slideDown':
      return createAnimation(slideDownAnimation, { duration, delay });
    case 'slideLeft':
      return createAnimation(slideLeftAnimation, { duration, delay });
    case 'slideRight':
      return createAnimation(slideRightAnimation, { duration, delay });
    case 'scale':
      return createAnimation(scaleAnimation, { duration, delay });
    case 'modal':
      return createAnimation(modalAnimation, { duration, delay });
    case 'menu':
      return createAnimation(menuAnimation, { duration, delay });
    case 'sidebar':
      return createAnimation(sidebarAnimation, { duration, delay });
    case 'none':
      return {};
    default:
      return createAnimation(fadeAnimation, { duration, delay });
  }
};

/**
 * Animated component: A simplified version that doesn't use the "as" prop
 * but instead wraps the content with the desired element type
 */
export const Animated = forwardRef<HTMLDivElement, AnimatedProps>(
  ({ 
    preset = 'fade',
    speed = 'normal',
    delay,
    variants: customVariants,
    animate: shouldAnimate = true,
    show = true,
    children,
    className,
    ...motionProps
  }, ref) => {
    // Get animation variants
    const variants = customVariants || getAnimationVariants(preset, speed, delay);

    // Create the content based on the element type
    const content = (
      <motion.div
        ref={ref}
        initial={shouldAnimate ? 'hidden' : 'visible'}
        animate="visible"
        exit="exit"
        variants={variants}
        className={className}
        {...motionProps}
      >
        {children}
      </motion.div>
    );

    return (
      <AnimatePresence mode="wait">
        {show && content}
      </AnimatePresence>
    );
  }
);

Animated.displayName = 'Animated';

/**
 * AnimatedList component: Renders a list of items with staggered animations
 */
export interface AnimatedListProps extends Omit<AnimatedProps, 'children'> {
  /**
   * The items to render
   */
  items: unknown[];

  /**
   * Render function for each item
   */
  renderItem: (item: unknown, index: number) => React.ReactNode;

  /**
   * Stagger delay between items (in seconds)
   * @default 0.05
   */
  staggerDelay?: number;
}

export const AnimatedList = forwardRef<HTMLDivElement, AnimatedListProps>(
  ({
    preset = 'fade',
    speed = 'normal',
    delay = 0,
    variants: customVariants,
    animate: shouldAnimate = true,
    show = true,
    items,
    renderItem,
    staggerDelay = 0.05,
    className,
    ...motionProps
  }, ref) => {
    // Get base animation variants
    const baseVariants = customVariants || getAnimationVariants(preset, speed, delay);

    // Create container variants
    const containerVariants = {
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay || 0,
        },
      },
      exit: { opacity: 1 },
    };

    return (
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            ref={ref}
            initial={shouldAnimate ? 'hidden' : 'visible'}
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className={className}
            {...motionProps}
          >
            {items.map((item: unknown, index: number) => (
              <motion.div
                key={index}
                variants={baseVariants}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

AnimatedList.displayName = 'AnimatedList';

/**
 * AnimatedWrapper: A simple wrapper that applies animations to children
 */
export interface AnimatedWrapperProps extends Omit<AnimatedProps, 'show'> {
  /** @internal */
  _wrapperSpecific?: never;
}

export const AnimatedWrapper = forwardRef<HTMLDivElement, AnimatedWrapperProps>(
  ({
    preset = 'fade',
    speed = 'normal',
    delay,
    variants: customVariants,
    animate: shouldAnimate = true,
    children,
    className,
    ...motionProps
  }, ref) => {
    // Get animation variants
    const variants = customVariants || getAnimationVariants(preset, speed, delay);

    return (
      <motion.div
        ref={ref}
        initial={shouldAnimate ? 'hidden' : 'visible'}
        animate="visible"
        variants={variants}
        className={cn(className)}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedWrapper.displayName = 'AnimatedWrapper';

export default Animated;
