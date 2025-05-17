'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  /**
   * Container content
   */
  children: React.ReactNode;

  /**
   * Maximum width class
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Container padding
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Container component for client layouts
 *
 * A responsive container with configurable max-width and padding
 */
export function Container({
  children,
  maxWidth = 'xl',
  className = '',
  padding = 'md',
}: ContainerProps) {
  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
    none: '',
  };

  // Map padding to Tailwind classes
  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Container;
