'use client';

import React from 'react';
import GalleryInfinite from '@/components/gallery/GalleryInfinite';
import Footer from '@/components/layouts/Footer';
import { motion } from 'framer-motion';

/**
 * Gallery Client Component
 *
 * Client-side component for the Gallery page that manages animations and layout.
 * This allows the page.tsx file to be a server component for SEO.
 * Now using infinite scroll for better performance.
 */
export default function GalleryClient() {
  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Tattoo Gallery</h1>
          <p className="text-lg text-gray-600">
            Explore Ink 37 Tattoos&apos; custom tattoo artwork and get inspired for your next piece.
          </p>
        </div>
        <GalleryInfinite showFilters={true} gridCols={3} itemsPerPage={24} />
      </motion.div>
      <Footer />
    </div>
  );
}
