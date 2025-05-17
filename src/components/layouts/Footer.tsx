'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaTiktok, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import Logo from '@/components/ui/logo';
import { cn } from '@/utils';

export function Footer() {
  const currentYear = 2025;
  const pathname = usePathname();

  // Footer navigation items
  const footerNavItems = [
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book Now', href: '/booking' },
  ];

  return (
    <footer className="bg-tattoo-black py-8 border-t border-tattoo-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <Link href="/" className="hover:opacity-90 transition-opacity mb-3">
              <Logo size="md" variant="image" isLinked={false} />
            </Link>
            <p className="text-tattoo-white/60 text-sm max-w-xs mt-2 text-center md:text-left">
              Custom tattoo design and professional tattooing services in a clean, comfortable environment.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-4">
            <h3 className="text-tattoo-white font-medium text-lg mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-2 text-center md:text-left">
              {footerNavItems.map(item => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className={cn(
                      "hover:text-tattoo-blue transition-colors text-sm py-1 inline-block",
                      pathname === item.href 
                        ? "text-tattoo-blue font-medium" 
                        : "text-tattoo-white/70"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start">
            <h3 className="text-tattoo-white font-medium text-lg mb-4">Contact & Follow</h3>
            
            {/* Location */}
            <div className="flex items-center mb-3 text-tattoo-white/70">
              <FaMapMarkerAlt className="mr-2 text-tattoo-blue" />
              <span className="text-sm">Houston, TX</span>
            </div>

            {/* Email */}
            <a 
              href="mailto:fennyg83@gmail.com" 
              className="text-sm text-tattoo-white/70 hover:text-tattoo-blue mb-4 transition-colors inline-flex items-center"
            >
              <FaEnvelope className="mr-2 text-tattoo-blue" />
              fennyg83@gmail.com
            </a>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/fennyg83"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://tiktok.com/@fennyg83"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="TikTok"
              >
                <FaTiktok size={16} />
              </a>
              <a
                href="mailto:fennyg83@gmail.com"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="Email"
              >
                <FaEnvelope size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-tattoo-white/10 to-transparent my-6"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-tattoo-white/40 mb-2 md:mb-0">
            © {currentYear} Ink 37. All rights reserved.
          </p>
          <p className="text-xs text-tattoo-white/40">
            By appointment only. Based in Houston, TX.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;