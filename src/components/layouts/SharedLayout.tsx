'use client';

import React from 'react';
import { Navbar } from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import type { SharedLayoutProps } from '@/types/component-types';

/**
 * Shared Layout Component 
 * 
 * Provides a consistent layout with navbar and footer for client-facing pages.
 * Applies consistent background gradient and spacing used in gallery page.
 */
export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="w-full max-w-none px-6 py-16 pt-24">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}