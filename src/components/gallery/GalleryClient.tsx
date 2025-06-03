'use client';

import React from 'react';
import { ModernGallery } from '@/components/gallery/ModernGallery';
import Footer from '@/components/layouts/Footer';

/**
 * Gallery Client Component
 *
 * Client-side component for the Gallery page that uses the modern Aceternity UI layout grid.
 * This allows the page.tsx file to be a server component for SEO.
 * Features a more engaging visual design with modern animations and interactions.
 */
export default function GalleryClient() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/90">
      <div className="container mx-auto px-4 py-8">
        <ModernGallery />
      </div>
      <Footer />
    </div>
  );
}
