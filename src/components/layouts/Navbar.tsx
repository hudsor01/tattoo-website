'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { motion } from '@/components/performance/LazyMotion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

// Define navigation link type locally
interface NavigationLink {
  href: string;
  label: string;
  isButton?: boolean;
}

// Navigation links for main site - reordered per user request
const navigationLinks: NavigationLink[] = [
{ href: '/about', label: 'About' },
{ href: '/gallery', label: 'Gallery' },
{ href: '/services', label: 'Services' },
{ href: '/contact', label: 'Contact' },
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
      <div className="nav-spacer h-20 sm:h-24 md:h-28 lg:h-32"></div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-sm shadow-md py-3'
            : 'bg-black/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Brand/Logo */}
            <Link href="/" className="relative z-20 shrink-0">
            <img
            src="/logo.png"
            alt="Logo"
            className="h-16 sm:h-20 md:h-24 w-auto"
            />
            </Link>
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-3 lg:space-x-4">
            {navigationLinks.map((link) => (
            <Button
            key={link.href}
            asChild
            variant="ghost"
            className={`text-white hover:text-white hover:bg-white/10 text-sm lg:text-base transition-all duration-300 ${
            pathname === link.href 
            ? 'bg-fernando-gradient hover:opacity-90' 
            : ''
            }`}
            size="sm"
            >
            <Link href={link.href}>{link.label}</Link>
            </Button>
            ))}
            </nav>
            
            {/* Book Now Button - Right side */}
            <div className="hidden md:block shrink-0">
            <Button
            asChild
            variant="default"
            className="bg-fernando-gradient hover:opacity-90 text-white text-sm lg:text-base" // Changed class here
            size="sm"
            >
            <Link href="/booking">Book Now</Link>
            </Button>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-white focus:outline-none shrink-0"
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
              className={`text-white py-2 px-4 rounded-md transition-all duration-300 ${
              pathname === link.href
              ? 'bg-fernando-gradient font-medium' // Changed class here
              : 'hover:bg-white/5'
              }`}
              onClick={() => setMobileMenuOpen(false)}
              >
              {link.label}
              </Link>
              ))}
              {/* Book Now button in mobile menu */}
              <Link
              href="/booking"
              className="text-white py-2 px-4 rounded-md bg-fernando-gradient text-center font-medium" // Changed class here
              onClick={() => setMobileMenuOpen(false)}
              >
              Book Now
              </Link>
              </nav>            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export default Navbar;
