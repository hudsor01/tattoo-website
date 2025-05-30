'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Footer from '@/components/layouts/Footer';
import { ServicesHeader } from '@/components/services/ServicesHeader';
import { ServiceList } from '@/components/services/ServiceList';
import { services } from '@/data/services-data';

/**
 * ServicesClient Component
 *
 * Client-side component for the Services page that manages animations and layout.
 * This allows the page.tsx file to be a server component for SEO.
 */
export default function ServicesClient() {
  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <ServicesHeader
          title="Tattoo Services"
          description="From custom designs to portrait work, I offer a range of specialized tattooing 
            services to bring your vision to life. Each service is delivered with meticulous 
            attention to detail and artistic excellence."
        />
        <ServiceList services={services} />
      </motion.div>
      <Footer />
    </div>
  );
}
