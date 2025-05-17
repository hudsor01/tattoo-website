'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { TATTOO_BLUE_PLACEHOLDER } from '@/lib/utils/image';

// Import the Services section component
import { ServicesSection } from '@/components/home/ServicesSection';

export default function HomeClient() {
  // State to track if component is mounted (for client-side animations)
  const [, setIsMounted] = useState(false); // We only need the setter

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <>
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
          <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
            <Link href="/services">Services</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
            <Link href="/about">About</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </header>

      {/* Hero content */}
      <div className="flex-1 flex flex-col justify-center max-w-xl lg:max-w-3xl">
        <div className="space-y-2">
          <p className="text-white/80 font-medium tracking-widest text-sm uppercase mb-1">
            CUSTOM TATTOOS BY
          </p>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none">
            FERNANDO
          </h2>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6">
            GOVEA
          </h2>
        </div>

        <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-10">
          Experience tattoo artistry in a comfortable, home-like environment in the Dallas/Fort
          Worth metroplex, where your vision comes to life through skilled craftsmanship.
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Clean Environment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Custom Designs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
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
          loading="lazy"
          placeholder="blur"
          blurDataURL={TATTOO_BLUE_PLACEHOLDER}
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      {/* Add the Services section */}
      <ServicesSection />
    </>
  );
}
