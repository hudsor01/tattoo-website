'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

// Navigation links for main site
const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/booking', label: 'Book Now', isButton: true },
];

// Client portal links
const clientLinks = [
  { href: '/customer', label: 'Dashboard' },
  { href: '/customer/appointments', label: 'Appointments' },
  { href: '/customer/designs', label: 'Designs' },
  { href: '/', label: 'Exit Portal', isButton: true },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Determine which navigation to use based on path
  const isClientPortal = pathname.startsWith('/customer');
  const isAdminDashboard = pathname.startsWith('/admin-dashboard');
  
  // Skip rendering navbar on admin dashboard (uses DashboardLayout instead)
  if (isAdminDashboard) {
    return null;
  }
  
  // Use appropriate navigation links based on path
  const links = isClientPortal ? clientLinks : navigationLinks;

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Set initial state
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Spacer div to prevent content from being hidden under navbar */}
      <div className="h-[70px] sm:h-[78px] w-full"></div>
      
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isClientPortal 
            ? 'bg-tattoo-black shadow-md py-3'
            : scrolled 
              ? 'bg-black/90 backdrop-blur-sm shadow-md py-3' 
              : 'bg-black/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href={isClientPortal ? '/customer' : '/'} className="relative z-20">
              {isClientPortal ? (
                <div className="font-satisfy text-lg sm:text-2xl text-tattoo-red">
                  Ink 37 Client Portal
                </div>
              ) : (
                <Image
                  src="/logo.png"
                  alt="Ink 37 Logo"
                  width={90}
                  height={42}
                  className="h-auto w-auto max-h-10 sm:max-h-12"
                  priority
                />
              )}
            </Link>

            {/* Desktop Navigation - hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {links.map((link) => 
                link.isButton ? (
                  <Button
                    key={link.href}
                    asChild
                    variant="default"
                    className="bg-tattoo-red hover:bg-tattoo-red-dark text-white ml-2 text-sm lg:text-base"
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

            {/* Mobile menu button - visible only on mobile */}
            <button 
              className="md:hidden p-2 text-white focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
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
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-white py-2 px-4 rounded-md ${
                      pathname === link.href 
                        ? 'bg-tattoo-red/20 font-medium' 
                        : 'hover:bg-white/5'
                    } ${link.isButton ? 'bg-tattoo-red text-center' : ''}`}
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