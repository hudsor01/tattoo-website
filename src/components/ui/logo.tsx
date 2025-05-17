'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils';
import { motion } from 'framer-motion';
import type { LogoProps } from '@/types/component-types';

export function Logo({
  className,
  href = '/',
  size = 'md',
  onClick,
  variant = 'text',
  isLinked = true,
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-4xl md:text-5xl',
  };

  const sizePixels = {
    sm: { width: 80, height: 40 },
    md: { width: 120, height: 60 },
    lg: { width: 160, height: 80 },
  };

  const content =
    variant === 'image' ? (
      <motion.div
        className={cn('relative', className)}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
      >
        <Image
          src="/logo.png"
          alt="Ink 37 Logo"
          width={sizePixels[size].width}
          height={sizePixels[size].height}
          priority
        />
      </motion.div>
    ) : (
      <motion.span
        className={cn('font-satisfy tracking-wide inline-block', sizeClasses[size], className)}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-tattoo-white">Ink</span>{' '}
        <span className="text-tattoo-red relative">
          37
          <motion.span
            className="absolute -bottom-1 -left-1 -right-1 h-0.5 bg-tattoo-red/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          />
        </span>
      </motion.span>
    );

  if (onClick) {
    return (
      <button className="focus:outline-none" onClick={onClick}>
        {content}
      </button>
    );
  }

  // Only wrap in Link if isLinked is true and href is provided
  return isLinked && href ? <Link href={href}>{content}</Link> : content;
}

export default Logo;