import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Google Analytics events for SEO tracking
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// SEO-specific tracking events
export const trackSEOEvents = {
  galleryView: (style: string) => {
    trackEvent('view_gallery_style', 'engagement', style);
  },
  
  bookingStarted: (source: string) => {
    trackEvent('booking_started', 'conversion', source);
  },
  
  bookingCompleted: () => {
    trackEvent('booking_completed', 'conversion');
  },
  
  contactFormSubmitted: (subject: string) => {
    trackEvent('contact_form_submitted', 'engagement', subject);
  },
  
  phoneClicked: () => {
    trackEvent('phone_number_clicked', 'engagement');
  },
  
  socialMediaClicked: (platform: string) => {
    trackEvent('social_media_clicked', 'engagement', platform);
  },
  
  downloadedAftercareGuide: () => {
    trackEvent('aftercare_guide_downloaded', 'engagement');
  },
  
  scrollDepth: (percentage: number) => {
    if (percentage % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      trackEvent('scroll_depth', 'engagement', `${percentage}%`, percentage);
    }
  },
  
  timeOnPage: (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1 || minutes === 3 || minutes === 5 || minutes === 10) {
      trackEvent('time_on_page', 'engagement', `${minutes} minutes`, seconds);
    }
  },
};

// Custom hook for page view tracking
export function usePageViewTracking() {
  const pathname = usePathname();
  
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}

// Scroll depth tracking
export function useScrollDepthTracking() {
  useEffect(() => {
    let maxScrolled = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);
      
      if (scrollPercent > maxScrolled) {
        maxScrolled = scrollPercent;
        trackSEOEvents.scrollDepth(scrollPercent);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Time on page tracking
export function useTimeOnPageTracking() {
  useEffect(() => {
    const startTime = Date.now();
    
    const trackTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackSEOEvents.timeOnPage(timeSpent);
    };
    
    // Track time at intervals
    const intervals = [60000, 180000, 300000, 600000]; // 1, 3, 5, 10 minutes
    const timers = intervals.map(interval => 
      setTimeout(() => trackTime(), interval)
    );
    
    // Track when user leaves
    const handleUnload = () => trackTime();
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
}

// Enhanced link tracking
export function trackLinkClick(href: string, type: 'internal' | 'external' | 'social') {
  trackEvent('link_clicked', type, href);
}

// Form tracking
export function trackFormInteraction(formName: string, action: 'started' | 'abandoned' | 'completed') {
  trackEvent(`form_${action}`, 'forms', formName);
}

// Image loading performance
export function trackImageLoadTime(imageName: string, loadTime: number) {
  if (loadTime > 3000) { // Track slow loading images
    trackEvent('slow_image_load', 'performance', imageName, loadTime);
  }
}

// 404 tracking
export function track404Page(url: string) {
  trackEvent('404_error', 'errors', url);
}

// Search tracking (if you add search functionality)
export function trackSiteSearch(query: string, resultsCount: number) {
  trackEvent('site_search', 'engagement', query, resultsCount);
}

// Conversion tracking with Google Ads (if using)
export function trackConversion(conversionLabel: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${conversionLabel}`,
      value: value,
      currency: 'USD',
    });
  }
}