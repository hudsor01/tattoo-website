'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { motion } from '@/components/performance/LazyMotion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

import type { NavigationLink } from '@prisma/client';

// Navigation links for main site
const navigationLinks: NavigationLink[] = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/booking', label: 'Book Now', isButton: true },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll events - client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 20;
        setScrolled(isScrolled);
      };

      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Set initial state

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
    return undefined;
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Spacer div to prevent content from being hidden under navbar */}
      <div className="nav-spacer"></div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-sm shadow-md py-3'
            : 'bg-black/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Brand/Logo Space */}
            <Link href="/" className="relative z-20">
              <div className="font-satisfy text-lg sm:text-2xl text-red-500">
                Ink 37 Tattoos
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navigationLinks.map((link) =>
                link.isButton ? (
                  <Button
                    key={link.href}
                    asChild
                    variant="default"
                    className="bg-red-500 hover:bg-red-600 text-white ml-2 text-sm lg:text-base"
                    size="sm"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ) : (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className={`text-white hover:text-white/80 text-sm lg:text-base ${
                      pathname === link.href ? 'bg-white/10' : ''
                    }`}
                    size="sm"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                )
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-black/95 backdrop-blur-md shadow-lg"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-white py-2 px-4 rounded-md ${
                    pathname === link.href ? 'bg-red-500/20 font-medium' : 'hover:bg-white/5'
                    } ${link.isButton ? 'bg-red-500 text-center' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Navbar;
