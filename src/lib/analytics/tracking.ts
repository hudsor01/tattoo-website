// Google Analytics tracking utilities
// Use these functions throughout the app to track user interactions

// Get GA measurement ID from environment
const getGAMeasurementId = (): string | null => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;
  }
  return null;
};

// Safe error logging without exposing sensitive information
const logAnalyticsError = (action: string, error: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[Analytics] Failed to track ${action}:`, error instanceof Error ? error.message : 'Unknown error');
  }
};

// Helper functions for tracking events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  try {
    if (typeof window !== 'undefined' && window.gtag && getGAMeasurementId()) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  } catch (error) {
    logAnalyticsError(`event: ${action}`, error);
  }
};

export const trackPageView = (url: string, title?: string) => {
  try {
    const measurementId = getGAMeasurementId();
    if (typeof window !== 'undefined' && window.gtag && measurementId) {
      window.gtag('config', measurementId, {
        page_title: title ?? document.title,
        page_location: url,
      });
    }
  } catch (error) {
    logAnalyticsError('page view', error);
  }
};

export const trackConversion = (conversionId: string, value?: number, currency = 'USD') => {
  try {
    if (typeof window !== 'undefined' && window.gtag && getGAMeasurementId()) {
      window.gtag('event', 'conversion', {
        send_to: conversionId,
        value: value,
        currency: currency,
      });
    }
  } catch (error) {
    logAnalyticsError(`conversion: ${conversionId}`, error);
  }
};

// Contact form events
export const trackContactForm = {
  start: () => trackEvent('form_start', 'contact', 'contact_form'),
  complete: () => trackEvent('form_submit', 'contact', 'contact_form'),
  error: (error: string) => trackEvent('form_error', 'contact', error),
};

// Booking events
export const trackBooking = {
  start: () => trackEvent('booking_start', 'booking', 'appointment_booking'),
  complete: () => {
    trackEvent('booking_complete', 'booking', 'appointment_booking');
    trackConversion('booking_conversion'); // You can add a conversion ID later
  },
  cancel: () => trackEvent('booking_cancel', 'booking', 'appointment_booking'),
  calEmbed: () => trackEvent('cal_embed_interact', 'booking', 'cal_com_widget'),
};

// Gallery events
export const trackGallery = {
  view: (designId: string) => trackEvent('design_view', 'gallery', designId),
  share: (designId: string) => trackEvent('design_share', 'gallery', designId),
  download: (designId: string) => trackEvent('design_download', 'gallery', designId),
  lightbox: (designId: string) => trackEvent('lightbox_open', 'gallery', designId),
};

// Navigation events
export const trackNavigation = {
  menuOpen: () => trackEvent('menu_open', 'navigation', 'mobile_menu'),
  menuClose: () => trackEvent('menu_close', 'navigation', 'mobile_menu'),
  pageView: (page: string) => trackEvent('page_view', 'navigation', page),
  externalLink: (url: string) => trackEvent('external_link', 'navigation', url),
};

// Admin events (for internal tracking)
export const trackAdmin = {
  login: () => trackEvent('admin_login', 'admin', 'dashboard_access'),
  customerView: (customerId: string) => trackEvent('customer_view', 'admin', customerId),
  bookingManage: (action: string) => trackEvent('booking_manage', 'admin', action),
  galleryManage: (action: string) => trackEvent('gallery_manage', 'admin', action),
};

// Business goals tracking
export const trackBusinessGoals = {
  // Lead generation
  inquirySubmit: () => {
    trackEvent('lead_generation', 'business_goal', 'inquiry_form');
    trackConversion('lead_conversion');
  },
  
  // Engagement metrics
  timeOnSite: (duration: number) => trackEvent('engagement', 'time_on_site', 'minutes', duration),
  scrollDepth: (percentage: number) => trackEvent('engagement', 'scroll_depth', 'percentage', percentage),
  
  // Social media
  socialClick: (platform: string) => trackEvent('social_media', 'click', platform),
  
  // Services
  serviceView: (service: string) => trackEvent('service_interest', 'services', service),
};