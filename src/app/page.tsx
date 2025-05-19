'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  useEffect(() => {
    // Prevent scrolling on this page
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Main container with two columns */}
      <div className="h-full flex">
        {/* Left side - Logo and content */}
        <div className="flex-1 flex flex-col justify-between p-12 relative">
          {/* Logo at top left */}
          <div className="relative z-10">
            <Image
              src="/logo.png"
              alt="Ink 37"
              width={150}
              height={150}
              className="mb-8"
              priority
            />
          </div>

          {/* Center content */}
          <div className="relative z-10 max-w-2xl animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              TATTOOS BY<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                FERNANDO GOVEA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Crafting exceptional Japanese-inspired artistry in Dallas/Fort Worth
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/gallery"
                className="px-8 py-4 bg-white text-black font-semibold text-lg rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 text-center"
              >
                See My Work
              </Link>
              <Link
                href="/booking"
                className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-full hover:bg-white hover:text-black transition-all transform hover:scale-105 text-center"
              >
                Book a Consultation
              </Link>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-12"></div>
        </div>

        {/* Center blend effect */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[200px] -translate-x-1/2 bg-gradient-to-r from-transparent via-black to-transparent blur-[15px]"></div>

        {/* Right side - Image */}
        <div className="flex-1 flex items-center justify-center p-12 relative">
          <div className="relative w-full max-w-xl before:content-[''] before:absolute before:inset-[-20px] before:bg-[radial-gradient(circle,rgba(239,68,68,0.2),rgba(251,146,60,0.2))] before:blur-[40px] before:-z-10 before:animate-pulse">
            {/* Glow effect behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 to-orange-500/30 blur-2xl animate-pulse"></div>
            
            {/* Image container with effects */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500 group">
              {/* Border gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity p-[2px] rounded-2xl">
                <div className="bg-black h-full w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/japanese.jpg"
                    alt="Japanese Tattoo by Fernando Govea"
                    width={600}
                    height={800}
                    className="object-cover w-full h-full"
                    style={{ imageRendering: 'crisp-edges' }}
                    priority
                    quality={100}
                  />
                </div>
              </div>
              
              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Caption */}
            <p className="text-gray-400 text-sm text-center mt-4">
              Japanese-inspired artistry
            </p>
          </div>
        </div>
      </div>

      {/* Background texture/noise for quality feel */}
      <div className="fixed inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px),repeating-linear-gradient(-45deg,transparent,transparent_1px,rgba(255,255,255,0.03)_1px,rgba(255,255,255,0.03)_2px)] before:bg-[length:3px_3px]"></div>
    </div>
  );
}