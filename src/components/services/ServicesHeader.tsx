'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ServicesHeaderProps {
  title?: string;
  description?: string;
}

/**
 * Services Header Component
 * 
 * Displays the header section for the services page with animated title and description.
 */
export function ServicesHeader({
  title = "Tattoo Services",
  description = "From custom designs to portrait work, I offer a range of specialized tattooing services to bring your vision to life. Each service is delivered with meticulous attention to detail and artistic excellence."
}: ServicesHeaderProps) {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      ref={headerRef}
      className="max-w-3xl mx-auto text-center mb-16"
      initial="hidden"
      animate={isHeaderInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-white mb-4" 
        variants={fadeInUp}
      >
        {title.split(' ').map((word, i) => 
          i === 1 ? <span key={i} className="text-tattoo-blue">{word} </span> : `${word} `
        )}
      </motion.h1>
      
      <motion.p 
        className="text-lg text-white/70 mx-auto"
        variants={fadeInUp}
      >
        {description}
      </motion.p>
    </motion.div>
  );
}