'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Section, SectionTitle, SectionDescription, SectionContent } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dynamically import framer-motion to prevent SSR issues
const motion = dynamic(() => import('framer-motion').then(mod => mod), { 
  ssr: false 
});

// Import shared services data
import { services } from '@/data/services-data';

/**
 * Services Section Component for Home Page
 * 
 * Displays a focused preview of services for the home page.
 */
export function ServicesSection() {
  // Card animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <Section bgColor="gradient" id="services">
      <SectionTitle>My Services</SectionTitle>
      <SectionDescription>
        I offer a range of professional tattooing services, each delivered with the highest
        standards of quality, creativity, and care.
      </SectionDescription>

      <SectionContent>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map(service => (
            <motion.div
              key={service.id}
              className="rounded-lg border border-white/10 bg-tattoo-black/30 p-6 shadow-lg hover:border-tattoo-red/30 transition-colors duration-300"
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-tattoo-red/20 text-tattoo-red mr-4">
                  <service.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-tattoo-white mb-2">{service.title}</h3>
                  <p className="text-tattoo-white/70">{service.shortDescription}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SectionContent>

      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Button variant="secondary" asChild>
          <Link href="/services">View All Services</Link>
        </Button>
      </motion.div>
    </Section>
  );
}

export default ServicesSection;