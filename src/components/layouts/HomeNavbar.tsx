'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

// Navigation links
const navigationLinks = [
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/booking', label: 'Book Now', isButton: true },
];

export function HomeNavbar() {
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Show navbar after scrolling 150px down
      const shouldBeVisible = window.scrollY > 150;
      if (shouldBeVisible !== visible) {
        setVisible(shouldBeVisible);
      }
    };

    // Add scroll event listener
    void window.addEventListener('scroll', handleScroll);

    // Set initial state
    handleScroll();

    // Clean up
    return () => {
      void window.removeEventListener('scroll', handleScroll);
    };
  }, [visible]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Track the current path for client-side rendering
  const [path, setPath] = React.useState('/');

  // Set initial path value on component mount
  React.useEffect(() => {
    setPath(window.location.pathname);
    
    // Listen for route changes
    const handleRouteChange = () => {
      setPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  if (!visible && path === '/') {
    return null;
  }

  // Don't show home navbar on non-home pages
  if (path !== '/') {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md shadow-md py-3"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-20">
            <Image
              src="/logo.png"
              alt="Ink 37 Logo"
              width={90}
              height={42}
              className="h-auto w-auto max-h-10 sm:max-h-12"
              priority
            />
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
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
                  className="text-white hover:text-white/80 text-sm lg:text-base"
                  size="sm"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              )
            )}
            
            {/* Admin link if user is authenticated and has admin role */}
          </nav>

          {/* Mobile menu button - visible only on mobile */}
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
                  className={`text-white py-2 px-4 rounded-md hover:bg-white/5 ${
                    link.isButton ? 'bg-red-600 text-center' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Admin link for mobile */}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default HomeNavbar;
