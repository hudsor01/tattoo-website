import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ENV } from '@/lib/utils/env';
import { inter, montserrat, pacifico, satisfy } from '../styles/fonts';
import { seoConfig, generateBusinessStructuredData } from '@/lib/seo/seo-config';
import Providers from './providers';
import NavigationSystem from '../components/layouts/NavigationSystem';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://ink37tattoos.com'),
  title: {
    default: seoConfig.defaultTitle,
    template: '%s | Ink 37 Tattoos'
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: '/icons/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  keywords: seoConfig.defaultKeywords,
  creator: seoConfig.businessName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ink37tattoos.com',
    siteName: seoConfig.businessName,
    images: [
      {
        url: '/images/japanese.jpg',
        width: 1200,
        height: 630,
        alt: `Professional custom tattoo artwork by ${seoConfig.businessName} - Japanese style tattoo design`,
        type: 'image/jpeg',
      },
      {
        url: '/images/traditional.jpg',
        width: 1200,
        height: 630,
        alt: `Traditional style tattoo work by ${seoConfig.businessName} tattoo artist`,
        type: 'image/jpeg',
      },
      {
        url: '/images/realism.jpg',
        width: 1200,
        height: 630,
        alt: `Realistic tattoo artwork by professional tattoo artist ${seoConfig.businessName}`,
        type: 'image/jpeg',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const businessSchema = generateBusinessStructuredData();

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} ${satisfy.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Critical performance and SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#8B5A2B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="google-site-verification"
          content="qv1_HzbLkbp9qF_TxoQryposrxfe8HsgyrM_erp-pCs"
        />
        
        {/* React 19 Resource Preloading */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // React 19 resource preloading
              if (typeof preconnect !== 'undefined') {
                preconnect('https://fonts.googleapis.com', { crossOrigin: 'anonymous' });
                preconnect('https://fonts.gstatic.com', { crossOrigin: 'anonymous' });
                preconnect('https://cal.com', { crossOrigin: 'anonymous' });
                preconnect('https://api.cal.com', { crossOrigin: 'anonymous' });
              }
              if (typeof prefetchDNS !== 'undefined') {
                prefetchDNS('https://vercel.com');
                prefetchDNS('https://analytics.vercel.com');
                prefetchDNS('https://vitals.vercel-analytics.com');
              }
            `,
          }}
        />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Ink 37 Tattoos" />
        <meta name="apple-mobile-web-app-title" content="Ink 37 Tattoos" />
        <meta name="msapplication-TileColor" content="#8B5A2B" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        
        {/* Error Handling for Development */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress custom element definition errors (dev tools)
              if (typeof window !== 'undefined') {
                const originalDefine = window.customElements?.define;
                if (originalDefine) {
                  window.customElements.define = function(name, constructor, options) {
                    try {
                      return originalDefine.call(this, name, constructor, options);
                    } catch (error) {
                      if (error.message && error.message.includes('already been defined')) {
                        console.warn('Custom element already defined:', name);
                        return;
                      }
                      throw error;
                    }
                  };
                }
                
                // Suppress common development errors
                window.addEventListener('error', function(e) {
                  if (e.message && (
                    e.message.includes('mcp-autocomplete') ||
                    e.message.includes('already been defined') ||
                    e.message.includes('dailyvideo') ||
                    e.message.includes('Failed to load resource')
                  )) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                });
                
                // Suppress resource loading errors (404s for missing icons)
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  return originalFetch.apply(this, args).catch(error => {
                    if (args[0] && typeof args[0] === 'string' && 
                        (args[0].includes('dailyvideo') || args[0].includes('store'))) {
                      console.warn('Suppressed 404 for non-critical resource:', args[0]);
                      return new Response('', { status: 404 });
                    }
                    throw error;
                  });
                };
              }
            `,
          }}
        />
        
        {/* Note: Splash screen images can be generated using the tool at /icons/splash/generator.html */}
        
        <link rel="canonical" href="https://ink37tattoos.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
            <NavigationSystem />
            <main className="flex-grow">{children}</main>
        </Providers>
        
        {/* Enhanced SEO Components */}
        <Script
          id="enhanced-local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['TattooShop', 'LocalBusiness', 'HealthAndBeautyBusiness'],
              '@id': `${seoConfig.siteUrl}#business`,
              name: seoConfig.businessName,
              alternateName: ['Ink 37', 'Ink37 Tattoos'],
              description: seoConfig.defaultDescription,
              url: seoConfig.siteUrl,
              logo: `${seoConfig.siteUrl}${seoConfig.logo}`,
              image: [
                `${seoConfig.siteUrl}/images/japanese.jpg`,
                `${seoConfig.siteUrl}/images/traditional.jpg`,
                `${seoConfig.siteUrl}/images/realism.jpg`,
              ],
              telephone: seoConfig.contact.phone || undefined,
              email: seoConfig.contact.email,
              address: {
                '@type': 'PostalAddress',
                streetAddress: seoConfig.location.address,
                addressLocality: seoConfig.location.city,
                addressRegion: seoConfig.location.state,
                postalCode: seoConfig.location.zipCode,
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 32.5639,
                longitude: -97.2983,
              },
              openingHours: ['Mo-Sa 10:00-18:00'],
              priceRange: '$$',
              paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Venmo', 'Zelle'],
              currenciesAccepted: 'USD',
              areaServed: [
                { '@type': 'City', name: 'Crowley', containedInPlace: { '@type': 'State', name: 'Texas' } },
                { '@type': 'City', name: 'Fort Worth', containedInPlace: { '@type': 'State', name: 'Texas' } },
                { '@type': 'City', name: 'Arlington', containedInPlace: { '@type': 'State', name: 'Texas' } },
                { '@type': 'City', name: 'Burleson', containedInPlace: { '@type': 'State', name: 'Texas' } },
                { '@type': 'City', name: 'Mansfield', containedInPlace: { '@type': 'State', name: 'Texas' } },
                { '@type': 'City', name: 'Grand Prairie', containedInPlace: { '@type': 'State', name: 'Texas' } },
              ],
              sameAs: [
                seoConfig.social.instagram,
                seoConfig.social.facebook,
              ],
              founder: {
                '@type': 'Person',
                name: seoConfig.artistName,
                jobTitle: 'Professional Tattoo Artist',
                knowsAbout: [
                  'Traditional Tattoos',
                  'Japanese Tattoos', 
                  'Realism Tattoos',
                  'Cover-up Tattoos',
                  'Custom Tattoo Design',
                ],
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Tattoo Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Custom Tattoo Design',
                      description: 'Personalized tattoo artwork created specifically for each client',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Cover-up Tattoos',
                      description: 'Professional cover-up work for existing tattoos',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Traditional Tattoos',
                      description: 'Classic American traditional style tattoos',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Japanese Tattoos',
                      description: 'Traditional Japanese style tattoo artwork',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Realism Tattoos',
                      description: 'Photorealistic tattoo artwork',
                    },
                  },
                ],
              },
            }, null, 2),
          }}
        />
        
        {/* Core Web Vitals Optimization */}
        <Script
          id="core-web-vitals-optimization"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Critical resource preloading for Core Web Vitals
              if (typeof window !== 'undefined') {
                // Preload critical fonts for CLS prevention
                const criticalFonts = [
                  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
                  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap'
                ];
                
                criticalFonts.forEach(fontUrl => {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'style';
                  link.href = fontUrl;
                  link.onload = function() { this.rel = 'stylesheet'; };
                  document.head.appendChild(link);
                });
                
                // Intersection Observer for lazy loading optimization
                if ('IntersectionObserver' in window) {
                  const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                          img.src = img.dataset.src;
                          img.classList.remove('lazy');
                          imageObserver.unobserve(img);
                        }
                      }
                    });
                  }, { rootMargin: '50px 0px', threshold: 0.01 });
                  
                  // Observe lazy images when they're added to DOM
                  const observeLazyImages = () => {
                    document.querySelectorAll('img[data-src]').forEach(img => {
                      imageObserver.observe(img);
                    });
                  };
                  
                  // Initial observation
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', observeLazyImages);
                  } else {
                    observeLazyImages();
                  }
                  
                  // Re-observe when new content is added
                  const bodyObserver = new MutationObserver(observeLazyImages);
                  bodyObserver.observe(document.body, { childList: true, subtree: true });
                }
                
                // Performance monitoring for debugging
                if ('PerformanceObserver' in window) {
                  // Track Long Tasks (affects FID)
                  try {
                    const longTaskObserver = new PerformanceObserver((list) => {
                      list.getEntries().forEach((entry) => {
                        if (entry.duration > 50) {
                          console.warn('Long task detected:', entry.duration + 'ms');
                        }
                      });
                    });
                    longTaskObserver.observe({ entryTypes: ['longtask'] });
                  } catch (e) {
                    // Longtask API not supported
                  }
                  
                  // Track Layout Shifts (CLS)
                  try {
                    let clsValue = 0;
                    const clsObserver = new PerformanceObserver((list) => {
                      list.getEntries().forEach((entry) => {
                        if (!entry.hadRecentInput) {
                          clsValue += entry.value;
                        }
                      });
                      if (clsValue > 0.1) {
                        console.warn('High CLS detected:', clsValue);
                      }
                    });
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                  } catch (e) {
                    // Layout shift API not supported
                  }
                }
              }
            `,
          }}
        />
        {/* Google Analytics */}
        {typeof ENV.NEXT_PUBLIC_GA_MEASUREMENT_ID === 'string' && ENV.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ENV.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                if (typeof window !== 'undefined') {
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ENV.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
                }
              `}
            </Script>
          </>
        )}


        <Script
          type="application/ld+json"
          id="business-schema"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        
        {/* PWA Service Worker Registration */}
        <Script
          id="register-service-worker"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      // Service worker registered successfully
                    })
                    .catch(function(error) {
                      // Service worker registration failed silently
                    });
                });
              }
            `,
          }}
        />
        <Script
          id='google-tag-manager-init'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${ENV.NEXT_PUBLIC_GTM_ID}');
            `,
          }}
        />
      </body>
    </html>
  );
}
