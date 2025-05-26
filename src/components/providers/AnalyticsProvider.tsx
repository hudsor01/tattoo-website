'use client'

import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Google Analytics tracking
export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Google Tag Manager
export function GoogleTagManager() {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

  if (!GTM_ID) {
    return null
  }

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

// Page view tracking hook
export function usePageTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      const url = pathname + searchParams.toString()
      ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }, [pathname, searchParams])
}

// Track custom events
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    ;(window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, {
      event_category: 'engagement',
      event_label: eventName,
      ...parameters,
    })
  }
}

// Track business events
export const trackBusinessEvent = {
  // Contact form submission
  contactFormSubmission: (method: string) => {
    trackEvent('contact_form_submission', {
      event_category: 'lead_generation',
      contact_method: method,
      value: 1,
    })
  },

  // Gallery interaction
  galleryImageView: (imageId: string, category: string) => {
    trackEvent('gallery_image_view', {
      event_category: 'content_engagement',
      image_id: imageId,
      image_category: category,
    })
  },

  // Booking interaction
  bookingStarted: () => {
    trackEvent('booking_started', {
      event_category: 'conversion',
      value: 1,
    })
  },

  // Service page view
  servicePageView: (serviceName: string) => {
    trackEvent('service_page_view', {
      event_category: 'service_interest',
      service_name: serviceName,
    })
  },

  // External link clicks
  externalLinkClick: (url: string, linkText: string) => {
    trackEvent('external_link_click', {
      event_category: 'external_engagement',
      link_url: url,
      link_text: linkText,
    })
  },
}

export function AnalyticsProvider() {
  return (
    <>
      <Analytics />
      <GoogleAnalytics />
      <GoogleTagManager />
    </>
  )
}