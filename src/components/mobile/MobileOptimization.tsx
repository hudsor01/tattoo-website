/**
 * Mobile Optimization Component for Ink 37 Tattoos
 * 
 * Comprehensive mobile performance and UX optimization including:
 * - Touch-friendly interface enhancements
 * - Mobile-specific performance optimizations
 * - Progressive Web App features
 * - Mobile SEO optimizations
 * - Touch gesture support
 */

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface MobileOptimizationProps {
  enableTouchOptimizations?: boolean;
  enableMobileSEO?: boolean;
  enablePWAFeatures?: boolean;
  enablePerformanceOptimizations?: boolean;
}

export default function MobileOptimization({
  enableTouchOptimizations = true,
  enableMobileSEO = true,
  enablePWAFeatures = true,
  enablePerformanceOptimizations = true,
}: MobileOptimizationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const ios = /iPad|iPhone|iPod/.test(userAgent);
      const android = /Android/.test(userAgent);
      
      setIsMobile(mobile);
      setIsIOS(ios);
      setIsAndroid(android);

      // Add mobile class to body for mobile-specific styling
      if (mobile) {
        document.body.classList.add('mobile-device');
        if (ios) document.body.classList.add('ios-device');
        if (android) document.body.classList.add('android-device');
      }
    };

    checkMobileDevice();
  }, []);

  return (
    <>
      {/* Touch Optimization Script */}
      {enableTouchOptimizations && (
        <Script
          id="touch-optimization"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Touch optimization for mobile devices
              (function() {
                if (!('ontouchstart' in window)) return;
                
                // Prevent 300ms click delay
                let lastTouchEnd = 0;
                document.addEventListener('touchend', function(event) {
                  const now = (new Date()).getTime();
                  if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                  }
                  lastTouchEnd = now;
                }, false);
                
                // Enhanced touch feedback
                document.addEventListener('touchstart', function(e) {
                  const target = e.target.closest('button, a, [role="button"]');
                  if (target) {
                    target.classList.add('touch-active');
                  }
                });
                
                document.addEventListener('touchend', function(e) {
                  const target = e.target.closest('button, a, [role="button"]');
                  if (target) {
                    setTimeout(() => {
                      target.classList.remove('touch-active');
                    }, 150);
                  }
                });
                
                // Swipe gesture detection for gallery
                let touchStartX = null;
                let touchStartY = null;
                
                document.addEventListener('touchstart', function(e) {
                  if (e.target.closest('.gallery-container, .image-carousel')) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                  }
                });
                
                document.addEventListener('touchmove', function(e) {
                  if (!touchStartX || !touchStartY) return;
                  
                  const touchEndX = e.touches[0].clientX;
                  const touchEndY = e.touches[0].clientY;
                  
                  const diffX = touchStartX - touchEndX;
                  const diffY = touchStartY - touchEndY;
                  
                  // Prevent vertical scroll interference
                  if (Math.abs(diffX) > Math.abs(diffY)) {
                    e.preventDefault();
                  }
                });
                
                document.addEventListener('touchend', function(e) {
                  if (!touchStartX || !touchStartY) return;
                  
                  const touchEndX = e.changedTouches[0].clientX;
                  const diffX = touchStartX - touchEndX;
                  
                  if (Math.abs(diffX) > 50) {
                    const galleryContainer = e.target.closest('.gallery-container, .image-carousel');
                    if (galleryContainer) {
                      const swipeEvent = new CustomEvent('gallery-swipe', {
                        detail: { direction: diffX > 0 ? 'left' : 'right' }
                      });
                      galleryContainer.dispatchEvent(swipeEvent);
                    }
                  }
                  
                  touchStartX = null;
                  touchStartY = null;
                });
                
                // Optimize text selection on mobile
                document.addEventListener('selectstart', function(e) {
                  const target = e.target;
                  if (target.closest('button, .gallery-item, .touch-action')) {
                    e.preventDefault();
                  }
                });
                
                // Mobile-optimized scroll behavior
                let ticking = false;
                function updateScrollPosition() {
                  const scrollY = window.pageYOffset;
                  
                  // Hide/show navigation on scroll
                  const nav = document.querySelector('.mobile-nav');
                  if (nav) {
                    if (scrollY > 100) {
                      nav.classList.add('nav-hidden');
                    } else {
                      nav.classList.remove('nav-hidden');
                    }
                  }
                  
                  ticking = false;
                }
                
                window.addEventListener('scroll', function() {
                  if (!ticking) {
                    requestAnimationFrame(updateScrollPosition);
                    ticking = true;
                  }
                });
              })();
            `,
          }}
        />
      )}

      {/* Mobile Performance Optimization */}
      {enablePerformanceOptimizations && (
        <Script
          id="mobile-performance"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Mobile performance optimizations
              (function() {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (!isMobile) return;
                
                // Lazy load images with Intersection Observer
                const imageObserver = new IntersectionObserver((entries, observer) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      const img = entry.target;
                      const src = img.getAttribute('data-src');
                      if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                      }
                    }
                  });
                }, {
                  threshold: 0.1,
                  rootMargin: '50px'
                });
                
                // Observe all lazy images
                document.querySelectorAll('img[data-src]').forEach(img => {
                  imageObserver.observe(img);
                });
                
                // Optimize video loading for mobile
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                  // Disable autoplay on mobile to save bandwidth
                  video.autoplay = false;
                  video.preload = 'metadata';
                  
                  // Add play button overlay
                  const playButton = document.createElement('button');
                  playButton.className = 'video-play-button';
                  playButton.innerHTML = '▶️';
                  playButton.addEventListener('click', () => {
                    video.play();
                    playButton.style.display = 'none';
                  });
                  
                  video.parentNode?.insertBefore(playButton, video.nextSibling);
                });
                
                // Mobile-specific font loading optimization
                if ('fonts' in document) {
                  document.fonts.ready.then(() => {
                    document.body.classList.add('fonts-loaded');
                  });
                }
                
                // Reduce motion for users who prefer it
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                  document.body.classList.add('reduce-motion');
                }
                
                // Battery API optimization (where supported)
                if ('getBattery' in navigator) {
                  navigator.getBattery().then(battery => {
                    if (battery.level < 0.2 || !battery.charging) {
                      // Reduce animations and effects for low battery
                      document.body.classList.add('power-save-mode');
                    }
                  });
                }
                
                // Network-aware loading
                if ('connection' in navigator) {
                  const connection = navigator.connection;
                  if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                    document.body.classList.add('slow-connection');
                    // Disable video autoplay and reduce image quality
                    videos.forEach(video => {
                      video.style.display = 'none';
                    });
                  }
                }
              })();
            `,
          }}
        />
      )}

      {/* PWA Installation Prompt */}
      {enablePWAFeatures && (
        <Script
          id="pwa-features"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // PWA installation and features
              (function() {
                let deferredPrompt;
                
                window.addEventListener('beforeinstallprompt', (e) => {
                  e.preventDefault();
                  deferredPrompt = e;
                  
                  // Show install button
                  const installButton = document.createElement('button');
                  installButton.className = 'pwa-install-button';
                  installButton.textContent = 'Install App';
                  installButton.style.cssText = \`
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #000;
                    color: white;
                    border: none;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  \`;
                  
                  installButton.addEventListener('click', async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const result = await deferredPrompt.userChoice;
                      deferredPrompt = null;
                      installButton.remove();
                    }
                  });
                  
                  document.body.appendChild(installButton);
                  
                  // Auto-hide after 10 seconds
                  setTimeout(() => {
                    if (installButton.parentNode) {
                      installButton.remove();
                    }
                  }, 10000);
                });
                
                // Handle app installation
                window.addEventListener('appinstalled', () => {
                  const installButton = document.querySelector('.pwa-install-button');
                  if (installButton) {
                    installButton.remove();
                  }
                });
                
                // Add to homescreen prompt for iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isInStandaloneMode = window.navigator.standalone;
                
                if (isIOS && !isInStandaloneMode) {
                  const iosPrompt = document.createElement('div');
                  iosPrompt.className = 'ios-install-prompt';
                  iosPrompt.innerHTML = \`
                    <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #000; color: white; padding: 16px; text-align: center; z-index: 1000;">
                      <p>Add to Home Screen for the best experience</p>
                      <p style="font-size: 12px; opacity: 0.8;">Tap Share button, then "Add to Home Screen"</p>
                      <button onclick="this.parentNode.parentNode.remove()" style="margin-top: 8px; background: white; color: black; border: none; padding: 8px 16px; border-radius: 4px;">Close</button>
                    </div>
                  \`;
                  
                  // Show prompt after 5 seconds
                  setTimeout(() => {
                    document.body.appendChild(iosPrompt);
                  }, 5000);
                }
                
                // Track PWA usage
                if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
                  // User is using PWA mode
                  document.body.classList.add('pwa-mode');
                  
                  // Track PWA launch
                  if (typeof window.gtag === 'function') {
                    window.gtag('event', 'pwa_launch', {
                      event_category: 'PWA',
                      event_label: 'app_launched',
                    });
                  }
                }
              })();
            `,
          }}
        />
      )}

      {/* Mobile SEO Optimization */}
      {enableMobileSEO && (
        <Script
          id="mobile-seo"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Mobile SEO optimizations
              (function() {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (!isMobile) return;
                
                // Mobile-specific structured data
                const mobileSchema = {
                  "@context": "https://schema.org",
                  "@type": "MobileApplication",
                  "name": "Ink 37 Tattoos",
                  "operatingSystem": "iOS, Android",
                  "applicationCategory": "LifestyleApplication",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                };
                
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(mobileSchema);
                document.head.appendChild(script);
                
                // Mobile performance tracking for SEO
                let mobileMetrics = {
                  touchResponsiveness: 0,
                  scrollPerformance: 0,
                  loadTime: performance.now()
                };
                
                // Track touch responsiveness
                let touchStartTime = 0;
                document.addEventListener('touchstart', () => {
                  touchStartTime = performance.now();
                });
                
                document.addEventListener('touchend', () => {
                  if (touchStartTime) {
                    const responseTime = performance.now() - touchStartTime;
                    mobileMetrics.touchResponsiveness = responseTime;
                    
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'mobile_touch_response', {
                        event_category: 'Mobile Performance',
                        value: Math.round(responseTime),
                        custom_map: {
                          metric_id: 'touch_response_time',
                          metric_value: responseTime
                        }
                      });
                    }
                  }
                });
                
                // Track scroll performance
                let scrollStartTime = 0;
                let scrolling = false;
                
                window.addEventListener('scroll', () => {
                  if (!scrolling) {
                    scrollStartTime = performance.now();
                    scrolling = true;
                  }
                });
                
                // Detect scroll end
                let scrollTimer;
                window.addEventListener('scroll', () => {
                  clearTimeout(scrollTimer);
                  scrollTimer = setTimeout(() => {
                    if (scrolling) {
                      const scrollDuration = performance.now() - scrollStartTime;
                      mobileMetrics.scrollPerformance = scrollDuration;
                      scrolling = false;
                      
                      if (typeof window.gtag === 'function') {
                        window.gtag('event', 'mobile_scroll_performance', {
                          event_category: 'Mobile Performance',
                          value: Math.round(scrollDuration),
                        });
                      }
                    }
                  }, 150);
                });
                
                // Report mobile metrics after page load
                window.addEventListener('load', () => {
                  mobileMetrics.loadTime = performance.now();
                  
                  if (typeof window.gtag === 'function') {
                    window.gtag('event', 'mobile_page_performance', {
                      event_category: 'Mobile Performance',
                      custom_map: {
                        load_time: mobileMetrics.loadTime,
                        touch_responsiveness: mobileMetrics.touchResponsiveness,
                        scroll_performance: mobileMetrics.scrollPerformance
                      }
                    });
                  }
                });
                
                // Track mobile-specific interactions
                document.addEventListener('click', (e) => {
                  const target = e.target.closest('a[href^="tel:"], a[href^="mailto:"], a[href*="maps.google.com"]');
                  if (target) {
                    let actionType = 'unknown';
                    if (target.href.startsWith('tel:')) actionType = 'phone_call';
                    else if (target.href.startsWith('mailto:')) actionType = 'email';
                    else if (target.href.includes('maps.google.com')) actionType = 'directions';
                    
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'mobile_contact_action', {
                        event_category: 'Mobile Interaction',
                        event_label: actionType,
                        action_type: actionType
                      });
                    }
                  }
                });
              })();
            `,
          }}
        />
      )}

      {/* Mobile-specific CSS injection */}
      <style jsx>{`
        :global(.mobile-device) {
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        :global(.mobile-device button),
        :global(.mobile-device a),
        :global(.mobile-device [role="button"]) {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        :global(.touch-active) {
          transform: scale(0.98);
          opacity: 0.8;
          transition: all 0.1s ease;
        }
        
        :global(.nav-hidden) {
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }
        
        :global(.power-save-mode *) {
          animation-duration: 0.1s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.1s !important;
        }
        
        :global(.slow-connection img) {
          filter: blur(2px);
          transition: filter 0.3s ease;
        }
        
        :global(.slow-connection img.loaded) {
          filter: none;
        }
        
        :global(.reduce-motion *) {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        :global(.pwa-mode) {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        :global(.ios-device .ios-install-prompt) {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        :global(.video-play-button) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          font-size: 20px;
          color: white;
          cursor: pointer;
          z-index: 10;
        }
        
        @media (hover: none) and (pointer: coarse) {
          :global(button:hover),
          :global(a:hover) {
            transform: none;
          }
        }
      `}</style>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px',
            fontSize: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>iOS: {isIOS ? 'Yes' : 'No'}</div>
          <div>Android: {isAndroid ? 'Yes' : 'No'}</div>
          <div>Viewport: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown'}</div>
        </div>
      )}
    </>
  );
}
