/**
 * Mobile Layout Component for Ink 37 Tattoos
 * 
 * Optimized mobile layout with:
 * - Safe area handling for notched devices
 * - Performance optimizations
 * - Touch-friendly spacing
 * - Mobile-first responsive design
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import MobileNavigation from './MobileNavigation';
import MobileOptimization from './MobileOptimization';

// Extend Navigator interface for PWA standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  enableOptimizations?: boolean;
  className?: string;
}

export default function MobileLayout({
  children,
  showBottomNav = true,
  enableOptimizations = true,
  className = '',
}: MobileLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Track scroll position for performance optimizations
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`mobile-layout ${isStandalone ? 'standalone' : ''} ${className}`}>
      {/* Mobile Optimization Scripts */}
      {enableOptimizations && (
        <MobileOptimization 
          enableTouchOptimizations={true}
          enableMobileSEO={true}
          enablePWAFeatures={true}
          enablePerformanceOptimizations={true}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onToggle={handleMenuToggle}
      />

      {/* Main Content Area */}
      <main className={`main-content ${isMobileMenuOpen ? 'menu-open' : ''}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Spacing */}
      {showBottomNav && <div className="bottom-nav-spacer" />}

      {/* Scroll to Top Button */}
      {scrollPosition > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}

      <style jsx>{`
        .mobile-layout {
          min-height: 100vh;
          background: #000;
          color: white;
          overflow-x: hidden;
        }

        .standalone {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }

        .main-content {
          padding-top: 60px; /* Account for mobile nav header */
          min-height: calc(100vh - 60px);
          transition: filter 0.3s ease;
        }

        .main-content.menu-open {
          filter: blur(2px);
          pointer-events: none;
        }

        .content-wrapper {
          width: 100%;
          max-width: 100vw;
          margin: 0 auto;
          padding: 0;
        }

        .bottom-nav-spacer {
          height: 80px; /* Space for bottom navigation */
        }

        .scroll-to-top {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 48px;
          height: 48px;
          background: rgba(255, 107, 53, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          z-index: 40;
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
          touch-action: manipulation;
        }

        .scroll-to-top:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
        }

        @media (min-width: 768px) {
          .mobile-layout {
            display: none; /* Hide on desktop */
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .mobile-layout {
            background: #000;
            color: #fff;
          }
          
          .scroll-to-top {
            background: #fff;
            color: #000;
            border: 2px solid #000;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .main-content,
          .scroll-to-top {
            transition: none;
          }
          
          .scroll-to-top:hover {
            transform: none;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .mobile-layout {
            background: #000;
            color: #fff;
          }
        }

        /* Safe area support for newer devices */
        @supports (padding: env(safe-area-inset-top)) {
          .standalone .main-content {
            padding-top: calc(60px + env(safe-area-inset-top));
          }
          
          .scroll-to-top {
            bottom: calc(100px + env(safe-area-inset-bottom));
            right: calc(20px + env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
}
