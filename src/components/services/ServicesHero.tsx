'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * ServicesHero Component
 * 
 * Purpose: Hero section for services page with Fernando gradient
 */
export function ServicesHero() {
  return (
    <motion.div 
      className="text-center mb-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-5xl md:text-6xl font-bold mb-6 fernando-gradient">
        Tattoo Services
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        From custom designs to portrait work, I offer specialized tattooing services 
        to bring your vision to life. Each service is delivered with meticulous 
        attention to detail and artistic excellence.
      </p>
    </motion.div>
  );
}