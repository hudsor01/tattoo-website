'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [scrollEnabled, setScrollEnabled] = useState(false);
  
  useEffect(() => {
    // By default, prevent scrolling on this page
    if (!scrollEnabled) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    }
    
    return () => {
      // Clean up when component unmounts
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, [scrollEnabled]);
  
  return (
    <div className={scrollEnabled ? "bg-black" : "fixed inset-0 overflow-hidden bg-black"}>
      {/* Main container with two columns */}
      <div className={scrollEnabled ? "min-h-screen flex flex-col md:flex-row" : "h-full flex"}>
        {/* Left side - Content (Logo removed) */}
        <div className="flex-1 flex flex-col justify-between p-12 relative">
          {/* Center content */}
          <div className="relative z-10 max-w-2xl animate-slide-up mt-20">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
              TATTOOS BY<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                FERNANDO GOVEA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Crafting exceptional custom tattoo artistry in Dallas/Fort Worth
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
            
            {/* Scroll toggle (for accessibility) */}
            <button 
              onClick={() => setScrollEnabled(!scrollEnabled)}
              className="mt-8 text-sm text-gray-400 hover:text-white transition flex items-center"
            >
              {scrollEnabled ? "Disable Scrolling" : "Enable Scrolling"} 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                {scrollEnabled ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>

          {/* Bottom spacing */}
          <div className="h-12"></div>
        </div>

        {/* Center blend effect */}
        <div className="absolute md:fixed left-1/2 top-0 bottom-0 w-[200px] -translate-x-1/2 bg-gradient-to-r from-transparent via-black to-transparent blur-[15px]"></div>

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
          </div>
        </div>
      </div>

      {/* Background texture/noise for quality feel */}
      <div className="fixed inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px),repeating-linear-gradient(-45deg,transparent,transparent_1px,rgba(255,255,255,0.03)_1px,rgba(255,255,255,0.03)_2px)] before:bg-[length:3px_3px]"></div>
    </div>
  );
}