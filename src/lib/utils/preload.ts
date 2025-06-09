'use client';

import { logger } from '@/lib/logger';

/**
 * React 19 Resource Preloading Utilities
 * 
 * Leverages new React 19 APIs for optimal resource loading
 */

declare global {
  function preload(href: string, options?: { as: string; crossOrigin?: string }): void;
  function prefetchDNS(href: string): void;
  function preconnect(href: string, options?: { crossOrigin?: string }): void;
  function preloadModule(href: string): void;
  function preinit(href: string, options?: { as: string; precedence?: string; crossOrigin?: string }): void;
}

/**
 * Preload critical resources using React 19 APIs
 */
export function preloadCriticalResources() {
  try {
    // Preload critical fonts
    if (typeof preload !== 'undefined') {
      preload('/fonts/montserrat.woff2', { as: 'font' });
      preload('/fonts/inter.woff2', { as: 'font' });
    }

    // Preconnect to external domains
    if (typeof preconnect !== 'undefined') {
      preconnect('https://fonts.googleapis.com', { crossOrigin: 'anonymous' });
      preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' });
      preconnect('https://cal.com', { crossOrigin: 'anonymous' });
      preconnect('https://api.cal.com', { crossOrigin: 'anonymous' });
    }

    // DNS prefetch for other domains
    if (typeof prefetchDNS !== 'undefined') {
      prefetchDNS('https://vercel.com');
      prefetchDNS('https://analytics.vercel.com');
      prefetchDNS('https://vitals.vercel-analytics.com');
    }

    // Preinit critical CSS
    if (typeof preinit !== 'undefined') {
      preinit('/globals.css', { as: 'style', precedence: 'high' });
    }
  } catch (error) {
    void logger.warn('Resource preloading not supported:', error);
  }
}

/**
 * Preload gallery images on demand
 */
export function preloadGalleryImages(imageUrls: string[]) {
  try {
    if (typeof preload !== 'undefined') {
      imageUrls.slice(0, 6).forEach(url => {
        preload(url, { as: 'image' });
      });
    }
  } catch (error) {
    void logger.warn('Image preloading failed:', error);
  }
}

/**
 * Preload Cal.com resources when booking page is likely to be visited
 */
export function preloadCalResources() {
  try {
    if (typeof preloadModule !== 'undefined') {
      preloadModule('https://app.cal.com/embed/embed.js');
    }
    
    if (typeof preconnect !== 'undefined') {
      preconnect('https://app.cal.com');
      preconnect('https://cal.com');
    }
  } catch (error) {
    void logger.warn('Cal.com resource preloading failed:', error);
  }
}