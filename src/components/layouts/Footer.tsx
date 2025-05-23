'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = 2025;

  return (
    <footer className="bg-black border-t border-zinc-800 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Quick Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/gallery" className="text-zinc-400 hover:text-white transition-colors">Gallery</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact</Link>
            <Link href="/booking" className="text-zinc-400 hover:text-orange-400 transition-colors">Book Consultation</Link>
          </div>
          
          {/* Footer Info */}
          <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4 text-xs text-zinc-500">
            <span>© {currentYear} Ink 37. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Dallas-Fort Worth, Texas</span>
            <span className="hidden md:inline">•</span>
            <span>By appointment only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;