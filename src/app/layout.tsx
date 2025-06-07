import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { ENV } from '@/lib/utils/env';
import { inter, montserrat, pacifico, satisfy } from '../styles/fonts';
import { seoConfig, generateBusinessStructuredData } from '@/lib/seo/seo-config';
import Providers from './providers';
import NavigationSystem from '../components/layouts/NavigationSystem';
import { ClientOnly } from '@/components/ClientOnly';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(typeof seoConfig.siteUrl === 'string' ? seoConfig.siteUrl : 'https://ink37tattoos.com'),
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
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  keywords: seoConfig.defaultKeywords,
  creator: seoConfig.businessName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: typeof seoConfig.siteUrl === 'string' ? seoConfig.siteUrl : 'https://ink37tattoos.com',
    siteName: seoConfig.businessName,
    images: [
      {
        url: `${seoConfig.siteUrl}/images/japanese.jpg`,
        width: 1200,
        height: 630,
        alt: `Professional custom tattoo artwork by ${seoConfig.businessName} - Japanese style tattoo design`,
        type: 'image/jpeg',
      },
      {
        url: `${seoConfig.siteUrl}/images/traditional.jpg`,
        width: 1200,
        height: 630,
        alt: `Traditional style tattoo work by ${seoConfig.businessName} tattoo artist`,
        type: 'image/jpeg',
      },
      {
        url: `${seoConfig.siteUrl}/images/realism.jpg`,
        width: 1200,
        height: 630,
        alt: `Realistic tattoo artwork by professional tattoo artist ${seoConfig.businessName}`,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: seoConfig.social.twitter,
    creator: seoConfig.social.twitter,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: {
      url: `${seoConfig.siteUrl}/images/japanese.jpg`,
      alt: `Professional custom tattoo artwork by ${seoConfig.businessName} - Japanese style tattoo design`,
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Generate structured data using centralized configuration
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
        <meta name="emotion-insertion-point" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#8B5A2B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="google-site-verification"
          content="qv1_HzbLkbp9qF_TxoQryposrxfe8HsgyrM_erp-pCs"
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        
        {/* Note: Splash screen images can be generated using the tool at /icons/splash/generator.html */}
        
        <link rel="canonical" href="https://ink37tattoos.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} ${pacifico.variable} ${satisfy.variable} font-sans bg-black text-white antialiased`}>
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

        {/* Structured data for business */}
        <script
          type="application/ld+json"
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
        
        {/* Next.js App Router root element for React hydration */}
        <div id="__next">
          {/* Providers system */}
          <Providers>
            <ClientOnly>
              <NavigationSystem />
            </ClientOnly>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
