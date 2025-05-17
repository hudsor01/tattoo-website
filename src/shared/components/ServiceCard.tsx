'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { TATTOO_RED_PLACEHOLDER, getImageSizes } from '@/lib/utils/image';
import { Service } from '@/types/component-types';

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

interface ServiceCardProps {
  service: Service;
  index: number;
}

/**
 * Service Card Component
 * 
 * Displays a single service with image, description, and process details.
 * Used on the full services page.
 */
export function ServiceCard({ service, index }: ServiceCardProps) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  
  // Determine directional animations based on index
  const imageVariants = {
    hidden: { 
      opacity: 0, 
      x: index % 2 === 0 ? -40 : 40 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: index % 2 === 0 ? 40 : -40 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Color mapping for service icons
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-500',
    red: 'bg-red-500/20 text-red-500',
    purple: 'bg-purple-500/20 text-purple-500', 
    teal: 'bg-teal-500/20 text-teal-500',
  };
  
  const iconColorClass = colorMap[service.color || 'blue'] || 'bg-tattoo-red/20 text-tattoo-red';

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      id={service.id}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
        index % 2 === 1 ? 'lg:grid-flow-dense' : ''
      }`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {/* Image section */}
      <motion.div 
        className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}
        variants={imageVariants}
      >
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes={getImageSizes('card')}
            className="object-cover"
            quality={85}
            loading="lazy"
            placeholder="blur"
            blurDataURL={TATTOO_RED_PLACEHOLDER}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60" />
        </div>
      </motion.div>

      {/* Content section */}
      <motion.div variants={contentVariants}>
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${iconColorClass} mr-4`}>
            <service.icon size={24} />
          </div>
          <h2 className="text-3xl font-bold text-tattoo-white">{service.title}</h2>
        </div>

        <p className="text-lg text-tattoo-white/80 mb-6 leading-relaxed">{service.description}</p>

        <motion.div 
          className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-white/10 shadow-lg"
          variants={staggerContainer}
        >
          <h3 className="text-xl font-semibold text-tattoo-white mb-4">My Process</h3>
          <ul className="space-y-3">
            {service.process.map((step, stepIndex) => (
              <motion.li 
                key={stepIndex} 
                className="flex items-start"
                variants={fadeInUp}
              >
                <span className="text-tattoo-red mr-2">•</span>
                <span className="text-tattoo-white/80">{step}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}