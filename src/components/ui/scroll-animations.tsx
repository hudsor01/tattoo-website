'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface AnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, className = '', delay = 0, duration = 0.6 }: AnimationProps) {
  const { ref, isInView } = useScrollAnimation();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ 
        duration: isMobile ? duration * 0.8 : duration, 
        delay, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, className = '', delay = 0, duration = 0.6 }: AnimationProps) {
  const { ref, isInView } = useScrollAnimation();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const yOffset = isMobile ? 30 : 50;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : yOffset
      }}
      transition={{ 
        duration: isMobile ? duration * 0.8 : duration, 
        delay, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.6,
  direction = 'left' 
}: AnimationProps & { direction?: 'left' | 'right' }) {
  const { ref, isInView } = useScrollAnimation();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const xOffset = isMobile ? 30 : 50;
  const finalXOffset = direction === 'left' ? -xOffset : xOffset;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: finalXOffset }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        x: isInView ? 0 : finalXOffset
      }}
      transition={{ 
        duration: isMobile ? duration * 0.8 : duration, 
        delay, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className = '', delay = 0, duration = 0.6 }: AnimationProps) {
  const { ref, isInView } = useScrollAnimation();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const scale = isMobile ? 0.9 : 0.8;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale }}
      animate={{ 
        opacity: isInView ? 1 : 0,
        scale: isInView ? 1 : scale
      }}
      transition={{ 
        duration: isMobile ? duration * 0.8 : duration, 
        delay, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

export function StaggerContainer({ 
  children, 
  className = '', 
  staggerDelay = 0.1,
  delay = 0 
}: StaggerContainerProps) {
  const { ref, isInView } = useScrollAnimation();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: isMobile ? staggerDelay * 0.8 : staggerDelay,
            delayChildren: delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const yOffset = isMobile ? 15 : 20;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: isMobile ? 0.4 : 0.5, 
            ease: 'easeOut' 
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className = '', speed = 0.5 }: ParallaxProps) {
  const { ref, isInView } = useScrollAnimation({ triggerOnce: false });
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  if (reducedMotion || isMobile) {
    // Disable parallax on mobile for performance
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{
        y: isInView ? 0 : speed * 100
      }}
      transition={{ ease: 'linear' }}
    >
      {children}
    </motion.div>
  );
}