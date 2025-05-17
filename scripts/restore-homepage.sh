#!/bin/bash

# This script restores the homepage to its perfect high-quality state if it becomes corrupted
# To run: bash scripts/restore-homepage.sh

echo "🔄 Restoring homepage to verified high-quality state..."

# Create backup of current homepage
BACKUP_DIR="./backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp src/app/page.tsx "$BACKUP_DIR/page.tsx.bak"
echo "✅ Created backup at $BACKUP_DIR/page.tsx.bak"

# Note: This version provides a modern SaaS-style hero layout with premium styling
# It uses all the same assets but arranged in a more contemporary design

# Restore the homepage from this template
cat > src/app/page.tsx << 'HOMEPAGE'
'use client';

/**
 * Modern SaaS-style Hero Homepage for Ink 37
 * Inspired by premium design patterns seen in modern web applications
 * 
 * Last updated: $(date +"%Y-%m-%d")
 * 
 * Features:
 * - Full-screen hero layout with premium gradient background
 * - Split design with image on right, content on left
 * - Strategic use of blur, glow and gradient effects
 * - Animated elements for enhanced visual appeal
 * - Premium typography with optimal hierarchy
 * - Responsive design that works on all screen sizes
 */

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background effects for texture and visual interest */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.3)_0%,rgba(0,0,0,1)_80%)] z-0"></div>
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      
      {/* Subtle glow effects */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] -top-[100px] right-[10%] z-0"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-green-500/5 blur-[120px] bottom-[5%] left-[5%] z-0"></div>
      
      {/* Japanese artwork as large background element with very soft gradient edge */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-0 hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black z-10" style={{ width: 'calc(100% + 150px)', left: '-150px' }}></div>
        <Image
          src="/images/japanese.jpg"
          alt="Japanese tattoo artwork by Fernando Govea"
          fill
          priority
          className="object-cover opacity-30"
          sizes="50vw"
        />
      </div>
      
      {/* Main container */}
      <div className="container mx-auto relative z-10 h-screen flex flex-col px-6 lg:px-10">
        {/* Header navigation */}
        <header className="flex justify-between items-center py-6">
          <Link href="/" className="relative z-20">
            <Image
              src="/logo.png"
              alt="Ink 37 Logo"
              width={140}
              height={65}
              className="h-auto"
              priority
            />
          </Link>
          
          <div className="space-x-4">
            <Button 
              asChild 
              variant="ghost"
              className="text-white hover:text-white font-medium"
            >
              <Link href="/services">Services</Link>
            </Button>
            <Button 
              asChild 
              variant="ghost"
              className="text-white hover:text-white font-medium"
            >
              <Link href="/about">About</Link>
            </Button>
            <Button 
              asChild 
              variant="ghost"
              className="text-white hover:text-white font-medium"
            >
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </header>
        
        {/* Hero content */}
        <div className="flex-1 flex flex-col justify-center max-w-xl lg:max-w-3xl">
          <div className="space-y-2">
            <p className="text-white/80 font-medium tracking-widest text-sm uppercase mb-1">CUSTOM TATTOOS BY</p>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none">
              FERNANDO
            </h2>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6">
              GOVEA
            </h2>
          </div>
          
          <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-10">
            Experience tattoo artistry in a comfortable, home-like environment in the
            Dallas/Fort Worth metroplex, where your vision comes to life through skilled craftsmanship.
          </p>
          
          {/* CTA Buttons - placed between text and feature points */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              asChild 
              className="bg-blue-700 hover:bg-blue-600 text-white font-medium px-8 py-5 rounded-md h-auto min-w-44"
              style={{
                boxShadow: '0 4px 20px -3px rgba(30, 64, 175, 0.6)',
                background: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
              }}
            >
              <Link href="/gallery">View My Work</Link>
            </Button>
            
            <Button 
              asChild 
              className="bg-blue-700 hover:bg-blue-600 text-white font-medium px-8 py-5 rounded-md h-auto min-w-44"
              style={{
                boxShadow: '0 0 25px -3px rgba(30, 64, 175, 0.5)',
                background: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
              }}
            >
              <Link href="/booking">Book a Consultation</Link>
            </Button>
          </div>
          
          {/* Feature points with green checkmarks */}
          <div className="flex flex-wrap items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Clean Environment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Custom Designs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Personalized Experience</span>
            </div>
          </div>
        </div>
        
        {/* Visible on mobile only - image */}
        <div className="lg:hidden relative w-full h-64 mt-6 mb-8 rounded-xl overflow-hidden">
          <Image
            src="/images/japanese.jpg"
            alt="Japanese tattoo art by Fernando Govea"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
/**
 * IMPORTANT: This file provides metadata for the homepage
 * Since the homepage is a client component (with 'use client'), 
 * we need to store metadata in a separate server file
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ink 37 - Custom Tattoos by Fernando Govea',
  description: 'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
  keywords: 'tattoo, custom tattoos, Fernando Govea, Ink 37, Dallas, Fort Worth, tattoo artist, tattoo studio',
  authors: [{ name: 'Fernando Govea', url: 'https://ink37.com' }],
  creator: 'Fernando Govea',
  publisher: 'Ink 37 Tattoo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ink37.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ink 37 - Custom Tattoos by Fernando Govea',
    description: 'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
    url: 'https://ink37.com',
    siteName: 'Ink 37 Tattoo',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Ink 37 Tattoo by Fernando Govea',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ink 37 - Custom Tattoos by Fernando Govea',
    description: 'Experience custom tattoo artistry in a home-like environment in the Dallas/Fort Worth metroplex. Book your consultation today.',
    images: ['/logo.png'],
    creator: '@ink37tattoo',
  },
  robots: {
    index: true,
    follow: true,
  },
};
METADATA

# Fix the @variant error in theme.css
cat > src/styles/theme.css << 'THEME_CSS'
/**
 * Modern Theme System additional utilities
 * Using Tailwind CSS v4 directives and functions
 */

/* Glow effects using @property directive */
/* Fix for @variant hover::before error */
@utility glow-effect {
  position: relative;
  overflow: hidden;
}

.glow-effect::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(
    circle at center,
    color-mix(in oklch, var(--glow-color, var(--color-tattoo-red)), transparent calc((1 - var(--glow-opacity)) * 100%)),
    transparent 70%
  );
  transform: scale(1.5);
  opacity: 0;
  transition: opacity 0.5s var(--ease-fluid);
}

.glow-effect:hover::before {
  opacity: 1;
}

/* Container query components */
@utility responsive-grid {
  container-type: inline-size;
  container-name: grid;
}

/* Fix for nested @utility error */
@container grid (min-width: 640px) {
  .responsive-item {
    grid-column: span 1;
  }
}

@container grid (min-width: 768px) {
  .responsive-item {
    grid-column: span 2;
  }
}

/* Define as top-level utilities */
@utility responsive-item-sm {
  grid-column: span 1;
}

@utility responsive-item-md {
  grid-column: span 2;
}

/* Custom hover effects */
@utility hover-scale {
  transition: transform 0.3s var(--ease-fluid);
}

.hover-scale:hover {
  transform: scale(1.05);
}

@utility hover-lift {
  transition:
    transform 0.3s var(--ease-fluid),
    box-shadow 0.3s var(--ease-fluid);
}
    
.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Advanced masonry layout */
@utility masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  grid-gap: 1rem;
}

@utility masonry-item {
  grid-row-end: span var(--masonry-row-span, 30);
}

/* Theme variants */
@custom-variant theme-holiday (&:where([data-theme="holiday"] *));

@utility theme-holiday {
  --color-primary: oklch(0.6 0.25 142);
  --color-secondary: oklch(0.65 0.27 25);
}
THEME_CSS

echo "✅ Fixed CSS @variant error in theme.css"
echo "✨ Homepage restoration complete! Run 'npm run dev' to verify."