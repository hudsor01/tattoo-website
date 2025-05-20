'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import Image from 'next/image';

// Images for the carousel - preload all for better performance
const tattooImages = [
  '/images/japanese.jpg',
  '/images/traditional.jpg',
  '/images/realism.jpg',
  '/images/leg-piece.jpg',
  '/images/clock-lion-left-arm.jpg',
  '/images/cover-ups.jpg',
];

export default function HomePage() {
  // For image carousel
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  // For loading animation
  const [isLoading, setIsLoading] = React.useState(false);
  // For carousel drag
  const dragX = useMotionValue(0);
  
  // Handle page transitions with loading state
  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate loading for 800ms before navigating
    setTimeout(() => {
      window.location.href = path;
    }, 800);
  };
  
  // Auto-advance carousel with very slow transition (12 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === tattooImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 12000); // 12 seconds between image transitions
    
    return () => clearInterval(interval);
  }, []);
  
  // Disable scrolling on the page
  React.useEffect(() => {
    // Disable scrolling on this page
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    
    return () => {
      // Clean up when component unmounts
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);
  
  // Preload images for better performance
  React.useEffect(() => {
    tattooImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);
  
  return (
    <>
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
              }}
              className="w-24 h-24 relative"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-orange-500 blur-md"></div>
              <div className="absolute inset-2 rounded-full bg-black"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl text-white">FG</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Persistent minimal navigation */}
      <nav className="fixed top-6 right-6 z-40 flex gap-6">
        <motion.button 
          onClick={(e) => handleNavigation(e, '/gallery')}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
        >
          Gallery
        </motion.button>
        <motion.button 
          onClick={(e) => handleNavigation(e, '/services')}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
        >
          Services
        </motion.button>
        <motion.button 
          onClick={(e) => handleNavigation(e, '/contact')}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="text-white/70 hover:text-white text-sm uppercase tracking-wide font-medium transition-colors"
        >
          Contact
        </motion.button>
      </nav>
    
      <div className="fixed inset-0 overflow-hidden bg-black">
        {/* Main container with improved spacing */}
        <div className="h-full w-full flex flex-col md:flex-row px-6 lg:px-8">
          {/* Left side - Content with vertical alignment and reduced width */}
          <div className="md:w-[45%] flex items-center justify-start py-12 md:py-0">
            <div className="w-full md:max-w-xl">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
                TATTOOS BY<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                  FERNANDO GOVEA
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
                Crafting exceptional custom tattoo artistry in Dallas/Fort Worth
              </p>

              {/* Enhanced CTAs with consistent styling */}
              <div className="flex flex-col sm:flex-row gap-6">
                <motion.button
                  onClick={(e) => handleNavigation(e, '/gallery')}
                  whileHover={{ 
                    y: -4,
                    boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-md transition-all text-center shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                  <span>See My Work</span>
                </motion.button>
                
                <motion.button
                  onClick={(e) => handleNavigation(e, '/booking')}
                  whileHover={{ 
                    y: -4,
                    boxShadow: "0 8px 30px rgba(239, 68, 68, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-md transition-all text-center shadow-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                  <span>Book a Consultation</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Remove center blend effect completely */}

          {/* Right side - Enhanced image carousel with fixed width */}
          <div className="md:w-[55%] flex items-center justify-center py-12 md:py-0">
            <div className="h-full w-full max-h-[800px] flex items-center justify-center">
              {/* Image carousel with improved sizing */}
              <div className="h-[calc(100%-40px)] aspect-[3/4] md:max-w-[90%] relative">
                <div 
                  className="w-full h-full relative overflow-hidden rounded-xl"
                  style={{ 
                    filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.25))",
                    maxWidth: "100%"
                  }}
                >
                  <AnimatePresence mode="wait">
                    {tattooImages.map((src, index) => (
                      index === currentImageIndex && (
                        <motion.div
                          key={src}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.5, ease: "easeInOut" }}
                          className="absolute inset-0"
                        >
                          {/* Efficient border gradient to reduce repaints */}
                          <div className="absolute inset-0" style={{
                            background: "linear-gradient(to right, #ef4444, #f97316)",
                            borderRadius: "0.75rem",
                            padding: "2px"
                          }}>
                            <div className="absolute inset-[2px] rounded-[calc(0.75rem-2px)] overflow-hidden z-10">
                              <Image
                                src={src}
                                alt={`Tattoo artwork by Fernando Govea ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 90vw, 50vw"
                                priority={index === 0}
                                quality={90}
                                className="object-cover"
                                draggable="false"
                                style={{ 
                                  objectFit: 'cover',
                                  willChange: 'transform' 
                                }}
                              />
                              
                              {/* Optimized overlay with opacity reduction */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optimized background texture/noise */}
        <div className="fixed inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_1px,rgba(255,255,255,0.05)_1px,rgba(255,255,255,0.05)_2px)] before:bg-[length:4px_4px]"></div>
      </div>
    </>
  );
}