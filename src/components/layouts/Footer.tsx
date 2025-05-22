'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Music2, Mail, Map, MailOpen } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { cn } from '@/lib/utils/styling';
import type { FooterNavItem } from '@/types/component-types';

export function Footer() {
  const currentYear = 2025;
  const pathname = usePathname();
  
  // Footer navigation items
  const footerNavItems: FooterNavItem[] = [
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book Now', href: '/booking' },
  ];

  return (
    <footer className="bg-tattoo-black py-6 border-t border-tattoo-white/20">
      <div className="container mx-auto max-w-screen-lg px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          {/* Logo and Description */}
          <div className="flex-1 flex flex-col items-start">
            <Link 
              href="/" 
              className="mb-3 p-1 rounded-lg bg-transparent transition-all duration-300 
                hover:bg-gradient-to-r hover:from-tattoo-red hover:to-tattoo-orange"
            >
              <Logo size="md" variant="full" isLinked={false} />
            </Link>
            <p className="text-tattoo-white/60 text-sm max-w-xs mt-1 text-center md:text-left">
              Custom designed tattoos in a clean and comfortable environment.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 flex flex-col items-start">
            <h3 className="text-tattoo-white font-medium text-base mb-3">Quick Links</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <div className="flex-1 flex flex-col items-start">
            <h3 className="text-tattoo-white font-medium text-lg mb-4">Contact & Follow</h3>
            
            {/* Location */}
            <div className="flex items-center mb-3 text-tattoo-white/70">
              <Map className="mr-2 text-tattoo-blue" />
              <span className="text-sm">Dallas-Fort Worth, Texas</span>
            </div>

            {/* Email */}
            <Link 
              href="mailto:fennyg83@gmail.com" 
              className="text-sm text-tattoo-white/70 hover:text-tattoo-blue mb-4 transition-colors inline-flex items-center"
            >
              <MailOpen className="mr-2 text-tattoo-blue" />
              fennyg83@gmail.com
            </Link>
            
            {/* Social Links */}
            <div className="flex space-x-1">
              <a
                href="https://instagram.com/fennyg83"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
              <a
                href="https://tiktok.com/fennyg83"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="TikTok"
              >
                <Music2 className="h-4 w-4" />
              </a>
              <a
                href="mailto:fennyg83@gmail.com"
                className="w-10 h-10 rounded-lg bg-tattoo-white/5 flex items-center justify-center text-tattoo-white hover:bg-tattoo-blue hover:text-white transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-tattoo-white/10 to-transparent my-6"></div>

        {/* Copyright */}
        <div className="flex flex-col items-center md:flex-row justify-between">
          <p className="text-xs text-tattoo-white/40 mb-2 md:mb-0">
            © {currentYear} Ink 37. All rights reserved.
          </p>
          <p className="text-xs text-tattoo-white/40">
            By appointment only. Based in Dallas-Fort Worth Metroplex, Texas.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;