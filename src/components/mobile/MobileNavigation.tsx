/**
 * Mobile Navigation Component for Ink 37 Tattoos
 * 
 * Optimized mobile navigation with:
 * - Touch-friendly interface
 * - Gesture support
 * - Performance optimizations
 * - Accessibility features
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function MobileNavigation({ isOpen = false, onToggle }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(isOpen);
  const [scrollPosition, setScrollPosition] = useState(0);
  const pathname = usePathname();

  const navigationItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/gallery', label: 'Gallery', icon: '🎨' },
    { href: '/services', label: 'Services', icon: '⚡' },
    { href: '/booking', label: 'Book Now', icon: '📅', highlight: true },
    { href: '/contact', label: 'Contact', icon: '📞' },
    { href: '/about', label: 'About', icon: 'ℹ️' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPosition}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPosition);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isMenuOpen, scrollPosition]);

  const handleToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onToggle?.();
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
    onToggle?.();
  };

  return (
    <>
      {/* Mobile Navigation Header */}
      <nav className="mobile-nav-header md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            href="/" 
            className="text-white font-bold text-lg"
            onClick={handleMenuItemClick}
          >
            Ink 37
          </Link>
          
          <button
            onClick={handleToggle}
            className="mobile-menu-toggle text-white p-2 rounded-lg touch-action-manipulation"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <h2 id="mobile-menu-title" className="text-2xl font-bold text-white mb-6">
              Navigation
            </h2>
          </div>
          
          <nav className="mobile-menu-nav">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleMenuItemClick}
                    className={`mobile-nav-item ${
                      pathname === item.href ? 'active' : ''
                    } ${item.highlight ? 'highlight' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {pathname === item.href && (
                      <span className="nav-indicator" aria-label="Current page" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Quick Actions */}
          <div className="mobile-menu-actions mt-8 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="tel:+18172558857"
                className="mobile-action-button"
                onClick={handleMenuItemClick}
              >
                <span className="action-icon">📞</span>
                <span className="action-label">Call Now</span>
              </a>
              <a
                href="mailto:ink37tattoos@gmail.com"
                className="mobile-action-button"
                onClick={handleMenuItemClick}
              >
                <span className="action-icon">✉️</span>
                <span className="action-label">Email</span>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="mobile-social-links mt-6">
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.instagram.com/ink37tattoos/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Follow us on Instagram"
              >
                📸
              </a>
              <a
                href="https://www.facebook.com/ink37tattoos/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Like us on Facebook"
              >
                📘
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Alternative/Additional) */}
      <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-t border-gray-800 safe-area-bottom">
        <div className="flex justify-around items-center py-2">
          {navigationItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .mobile-nav-header {
          transition: transform 0.3s ease;
        }

        .mobile-nav-header.hidden {
          transform: translateY(-100%);
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          cursor: pointer;
        }

        .hamburger span {
          display: block;
          position: absolute;
          height: 2px;
          width: 100%;
          background: white;
          border-radius: 1px;
          opacity: 1;
          left: 0;
          transform: rotate(0deg);
          transition: 0.25s ease-in-out;
        }

        .hamburger span:nth-child(1) {
          top: 0px;
        }

        .hamburger span:nth-child(2) {
          top: 8px;
        }

        .hamburger span:nth-child(3) {
          top: 16px;
        }

        .hamburger.open span:nth-child(1) {
          top: 8px;
          transform: rotate(135deg);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
          left: -60px;
        }

        .hamburger.open span:nth-child(3) {
          top: 8px;
          transform: rotate(-135deg);
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 45;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #1a1a1a 0%, #000 100%);
          z-index: 50;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-menu.open {
          transform: translateX(0);
        }

        .mobile-menu-content {
          padding: 80px 24px 120px;
          height: 100%;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 16px 20px;
          color: #ccc;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
          min-height: 56px;
          touch-action: manipulation;
        }

        .mobile-nav-item:hover,
        .mobile-nav-item:focus {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(4px);
        }

        .mobile-nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .mobile-nav-item.highlight {
          background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
          color: white;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 20px;
          margin-right: 16px;
          min-width: 24px;
        }

        .nav-label {
          font-size: 16px;
          flex: 1;
        }

        .nav-indicator {
          width: 6px;
          height: 6px;
          background: #ff6b35;
          border-radius: 50%;
          margin-left: 8px;
        }

        .mobile-action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          text-decoration: none;
          transition: all 0.2s ease;
          min-height: 80px;
          touch-action: manipulation;
        }

        .mobile-action-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .action-label {
          font-size: 14px;
          font-weight: 500;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          font-size: 24px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          text-decoration: none;
          touch-action: manipulation;
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .mobile-bottom-nav {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 4px;
          color: #666;
          text-decoration: none;
          transition: color 0.2s ease;
          min-width: 44px;
          touch-action: manipulation;
        }

        .bottom-nav-item.active {
          color: #ff6b35;
        }

        .bottom-nav-icon {
          font-size: 20px;
          margin-bottom: 2px;
        }

        .bottom-nav-label {
          font-size: 10px;
          font-weight: 500;
        }

        @media (max-width: 320px) {
          .mobile-menu {
            width: 100vw;
          }
          
          .bottom-nav-label {
            font-size: 9px;
          }
        }

        @supports (padding: env(safe-area-inset-bottom)) {
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  );
}
