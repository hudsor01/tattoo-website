'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { ServicesHeaderProps } from '@/types/component-types';

/**
 * Services Header Component
 *
 * Displays the header section for the services page with animated title and description.
 * Updated to match gallery page design system.
 */
export function ServicesHeader({
  title = 'Tattoo Services',
  description = 'From custom designs to portrait work, I offer a range of specialized tattooing services to bring your vision to life. Each service is delivered with meticulous attention to detail and artistic excellence.',
}: ServicesHeaderProps) {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

  // Animation variants matching gallery animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={headerRef}
      className="max-w-3xl mx-auto text-center mb-16"
      initial="hidden"
      animate={isHeaderInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      <motion.h1 className="heading-large gradient-text-muted mb-4" variants={fadeInUp}>
        {title}
      </motion.h1>

      <motion.p className="paragraph-medium mx-auto" variants={fadeInUp}>
        {description}
      </motion.p>

      <motion.div
        className="mt-8 h-1 w-24 mx-auto bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"
        variants={fadeInUp}
      />
    </motion.div>
  );
}
