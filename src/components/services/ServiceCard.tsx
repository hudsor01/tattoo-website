'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Service } from '@/types/component-types';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  // Alternate the layout for even/odd items
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}>
      {/* Service Image */}
      <motion.div 
        className="relative w-full md:w-1/2 aspect-video overflow-hidden rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-70 mix-blend-overlay z-10"></div>
        <img
          src={service.imageUrl || '/images/placeholder.jpg'} 
          alt={service.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      {/* Service Content */}
      <motion.div 
        className="w-full md:w-1/2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h2>
        <p className="text-lg text-gray-300 mb-6">{service.description}</p>
        
        {service.features && service.features.length > 0 && (
          <ul className="space-y-3 mb-8">
            {service.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-red-500 mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        
        <Link href="/booking" className="inline-block">
          <motion.button
            whileHover={{ 
              y: -4,
              boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
            }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 border-2 border-white text-white font-semibold rounded-md transition-all text-center shadow-lg relative overflow-hidden group"
          >
            <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-300">
              Book Now
            </span>
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0 bg-gradient-to-r from-red-600 to-orange-500 group-hover:h-full transition-all duration-300"
              style={{ height: '0%' }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Book Now
            </span>
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}