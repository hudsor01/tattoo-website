'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { ServiceCardProps } from '@/types/component-types';

export function ServiceCard({ service, index }: ServiceCardProps) {
  // Alternate the layout for even/odd items
  const isEven = index % 2 === 0;
  
  return (
    <motion.div 
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Service Image */}
      <motion.div 
        className="relative w-full md:w-1/2 aspect-video overflow-hidden rounded-lg shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-30 mix-blend-overlay z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
        <Image
          src={service.image || '/images/traditional.jpg'} 
          alt={service.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {service.featured !== null && service.featured && (
          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </motion.div>
      
      {/* Service Content */}
      <motion.div 
        className="w-full md:w-1/2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
          {service.title}
        </h2>
        <p className="text-lg text-white/70 mb-6">{service.description}</p>
        
        {/* Process Section */}
        <div className="mb-8 bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-white text-lg font-medium mb-3">Process</h3>
          <ul className="space-y-3">
            {service.process.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-white/80">{step}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Pricing/Time Estimate Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <h3 className="text-white text-lg font-medium mb-2">Pricing</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                $150-300+
              </span>
              <span className="text-white/60 text-sm">starting at</span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Price varies based on size, complexity, and time required
            </p>
          </div>
          
          <div className="flex-1 bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            <h3 className="text-white text-lg font-medium mb-2">Duration</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                1-5 hrs
              </span>
              <span className="text-white/60 text-sm">per session</span>
            </div>
            <p className="text-white/60 text-sm mt-1">
              Multiple sessions may be required for larger pieces
            </p>
          </div>
        </div>
        
        {Array.isArray(service.features) && service.features.length > 0 && (
          <ul className="space-y-3 mb-8 bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
            {service.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-red-500 mt-1 flex-shrink-0">•</span>
                <span className="text-white/80">{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        <motion.div className="mt-6" whileHover={{ y: -2 }}>
          <Button asChild className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:to-amber-600 group">
            <Link href="/booking" className="inline-flex items-center">
              Book a Consultation
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}