'use client';

import React from 'react';
import { TattooGallery } from "@/components/gallery/tattoo-gallery";
import SharedLayout from "@/components/layouts/SharedLayout";
import { motion } from "framer-motion";

/**
 * Gallery Client Component
 * 
 * Client-side component for the Gallery page that manages animations and layout.
 * This allows the page.tsx file to be a server component for SEO.
 */
export default function GalleryClient() {
  return (
    <SharedLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TattooGallery />
      </motion.div>
    </SharedLayout>
  );
}