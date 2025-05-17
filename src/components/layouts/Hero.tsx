'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/logo';

export default function Hero() {
  // Use a constant value instead of state to avoid hydration mismatch
  const usePacifico = true;

  // Fade in animation for the entire page
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md md:max-w-xl">
        <motion.div className="flex justify-center mb-2" variants={itemVariants}>
          <Logo size="lg" variant="svg" />
        </motion.div>

        <motion.h2
          className={usePacifico ? 'tattoo-script' : 'tattoo-script-cursive'}
          variants={itemVariants}
          onClick={() => setUsePacifico(!usePacifico)}
        >
          Custom Tattoos
        </motion.h2>

        <motion.p
          className="uppercase text-sm mt-2 tracking-wide text-gray-400 font-montserrat"
          variants={itemVariants}
        >
          by Fernando Govea
        </motion.p>

        <motion.p className="tattoo-paragraph max-w-xl mt-4" variants={itemVariants}>
          Welcome to Ink 37, where artistic expression meets comfort in the heart of the Dallas/Fort
          Worth metroplex. Experience tattoos in a home-like environment, with focus on bringing
          your vision to life.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <Link href="/gallery" className="tattoo-button tattoo-button-blue">
            View My Work
          </Link>

          <Link href="/booking" className="tattoo-button tattoo-button-blue">
            Book a Consultation
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <Link href="/access" className="text-white/60 hover:text-white text-sm">
            Access Admin & Client Portals →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
