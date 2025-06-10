/**
 * SEO Performance Monitoring and Analytics for Ink 37 Tattoos
 * 
 * Provides comprehensive SEO tracking, performance monitoring, and analytics
 * to measure the effectiveness of SEO optimizations and guide future improvements.
 */

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface SEOAnalyticsProps {
  enableTracking?: boolean;
  debugMode?: boolean;
  trackingId?: string;
}

export default function SEOAnalytics({
  enableTracking = true,
  debugMode = false,
  trackingId,
}: SEOAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    if (!enableTracking) return;

    // Initialize SEO performance tracking
    initializeSEOTracking();
    
    // Track Core Web Vitals for SEO
    trackCoreWebVitals();
    
    // Monitor search-related interactions
    trackSearchInteractions();
    
    // Track local SEO interactions
    trackLocalSEOInteractions();

  }, [enableTracking]);

  return (
    <>
      {/* Enhanced Google Analytics with SEO tracking */}
      {enableTracking && trackingId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
            strategy="afterInteractive"
          />
          <Script
            id="seo-analytics-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${trackingId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  custom_map: {
                    'custom_metric_1': 'seo_engagement_score',
                    'custom_metric_2': 'local_search_interactions',
                    'custom_metric_3': 'tattoo_style_interest',
                  }
                });
                
                // Track SEO-specific events
                window.trackSEOEvent = function(eventName, parameters) {
                  gtag('event', eventName, {
                    event_category: 'SEO',
                    ...parameters
                  });
                };
                
                // Track local business interactions
                window.trackLocalInteraction = function(type, details) {
                  gtag('event', 'local_interaction', {
                    event_category: 'Local SEO',
                    interaction_type: type,
                    details: details,
                    city: '${getLocationFromURL()}',
                  });
                };
                
                // Track tattoo style interests
                window.trackStyleInterest = function(style, engagement_type) {
                  gtag('event', 'style_interest', {
                    event_category: 'Content Engagement',
                    tattoo_style: style,
                    engagement_type: engagement_type,
                    page_path: window.location.pathname,
                  });
                };
              `,
            }}
          />
        </>
      )}

      {/* SEO Performance Monitoring */}
      <Script
        id="seo-performance-monitoring"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // SEO Performance Monitoring
            (function() {
              let seoMetrics = {
                pageLoadTime: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                cumulativeLayoutShift: 0,
                firstInputDelay: 0,
                timeToInteractive: 0,
              };
              
              // Track page load performance
              window.addEventListener('load', function() {
                seoMetrics.pageLoadTime = performance.now();
                
                // Track FCP
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                      seoMetrics.firstContentfulPaint = entry.startTime;
                    }
                  });
                }).observe({ entryTypes: ['paint'] });
                
                // Track LCP
                new PerformanceObserver((entryList) => {
                  const entries = entryList.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  seoMetrics.largestContentfulPaint = lastEntry.startTime;
                  
                  // Send LCP data for SEO analysis
                  if (typeof window.trackSEOEvent === 'function') {
                    window.trackSEOEvent('core_web_vital', {
                      metric_name: 'LCP',
                      metric_value: lastEntry.startTime,
                      rating: lastEntry.startTime < 2500 ? 'good' : 
                             lastEntry.startTime < 4000 ? 'needs_improvement' : 'poor'
                    });
                  }
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                // Track CLS
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                  entryList.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                      clsValue += entry.value;
                    }
                  });
                  
                  seoMetrics.cumulativeLayoutShift = clsValue;
                  
                  if (typeof window.trackSEOEvent === 'function') {
                    window.trackSEOEvent('core_web_vital', {
                      metric_name: 'CLS',
                      metric_value: clsValue,
                      rating: clsValue < 0.1 ? 'good' : 
                             clsValue < 0.25 ? 'needs_improvement' : 'poor'
                    });
                  }
                }).observe({ entryTypes: ['layout-shift'] });
                
                // Track FID
                new PerformanceObserver((entryList) => {
                  entryList.getEntries().forEach((entry) => {
                    seoMetrics.firstInputDelay = entry.processingStart - entry.startTime;
                    
                    if (typeof window.trackSEOEvent === 'function') {
                      window.trackSEOEvent('core_web_vital', {
                        metric_name: 'FID',
                        metric_value: seoMetrics.firstInputDelay,
                        rating: seoMetrics.firstInputDelay < 100 ? 'good' : 
                               seoMetrics.firstInputDelay < 300 ? 'needs_improvement' : 'poor'
                      });
                    }
                  });
                }).observe({ entryTypes: ['first-input'] });
              });
              
              // Track scroll depth for content engagement
              let maxScroll = 0;
              window.addEventListener('scroll', function() {
                const scrollPercent = Math.round(
                  (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                if (scrollPercent > maxScroll) {
                  maxScroll = scrollPercent;
                  
                  // Track milestone scroll depths
                  if ([25, 50, 75, 90].includes(scrollPercent)) {
                    if (typeof window.trackSEOEvent === 'function') {
                      window.trackSEOEvent('scroll_depth', {
                        scroll_percentage: scrollPercent,
                        page_type: getPageType(),
                        content_category: getContentCategory(),
                      });
                    }
                  }
                }
              });
              
              // Track time on page for SEO engagement
              let timeOnPage = 0;
              const startTime = Date.now();
              
              window.addEventListener('beforeunload', function() {
                timeOnPage = Date.now() - startTime;
                
                if (typeof window.trackSEOEvent === 'function') {
                  window.trackSEOEvent('time_on_page', {
                    duration_seconds: Math.round(timeOnPage / 1000),
                    page_type: getPageType(),
                    engagement_quality: timeOnPage > 30000 ? 'high' : 
                                       timeOnPage > 10000 ? 'medium' : 'low'
                  });
                }
              });
              
              // Helper functions
              function getPageType() {
                const path = window.location.pathname;
                if (path === '/') return 'homepage';
                if (path.includes('/gallery')) return 'gallery';
                if (path.includes('/booking')) return 'booking';
                if (path.includes('/services')) return 'services';
                if (path.includes('/contact')) return 'contact';
                if (path.includes('/guides')) return 'guide';
                if (path.includes('/tattoo-artist-')) return 'location';
                return 'other';
              }
              
              function getContentCategory() {
                const path = window.location.pathname;
                if (path.includes('traditional')) return 'traditional';
                if (path.includes('japanese')) return 'japanese';
                if (path.includes('realism')) return 'realism';
                if (path.includes('cover-up')) return 'coverup';
                if (path.includes('aftercare')) return 'aftercare';
                return 'general';
              }
              
              // Expose SEO metrics globally for debugging
              window.getSEOMetrics = function() {
                return seoMetrics;
              };
            })();
          `,
        }}
      />

      {/* Local SEO Interaction Tracking */}
      <Script
        id="local-seo-tracking"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Track local business interactions
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a, button');
              if (!target) return;
              
              // Track phone number clicks
              if (target.href && target.href.startsWith('tel:')) {
                if (typeof window.trackLocalInteraction === 'function') {
                  window.trackLocalInteraction('phone_click', {
                    phone_number: target.href.replace('tel:', ''),
                    source_page: window.location.pathname,
                  });
                }
              }
              
              // Track email clicks
              if (target.href && target.href.startsWith('mailto:')) {
                if (typeof window.trackLocalInteraction === 'function') {
                  window.trackLocalInteraction('email_click', {
                    email: target.href.replace('mailto:', ''),
                    source_page: window.location.pathname,
                  });
                }
              }
              
              // Track directions/map clicks
              if (target.href && (target.href.includes('maps.google.com') || target.href.includes('directions'))) {
                if (typeof window.trackLocalInteraction === 'function') {
                  window.trackLocalInteraction('directions_click', {
                    source_page: window.location.pathname,
                  });
                }
              }
              
              // Track booking button clicks
              if (target.textContent && target.textContent.toLowerCase().includes('book')) {
                if (typeof window.trackLocalInteraction === 'function') {
                  window.trackLocalInteraction('booking_intent', {
                    button_text: target.textContent,
                    source_page: window.location.pathname,
                  });
                }
              }
              
              // Track gallery style interactions
              if (target.closest('.gallery-style-filter') || target.getAttribute('data-style')) {
                const style = target.getAttribute('data-style') || target.textContent.toLowerCase();
                if (typeof window.trackStyleInterest === 'function') {
                  window.trackStyleInterest(style, 'filter_click');
                }
              }
              
              // Track guide/content interactions
              if (target.href && target.href.includes('/guides/')) {
                const guideType = target.href.split('/guides/')[1].split('/')[0];
                if (typeof window.trackSEOEvent === 'function') {
                  window.trackSEOEvent('guide_click', {
                    guide_type: guideType,
                    source_page: window.location.pathname,
                  });
                }
              }
            });
            
            // Track form interactions for lead generation
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (!form || form.tagName !== 'FORM') return;
              
              let formType = 'unknown';
              if (form.action.includes('contact')) formType = 'contact';
              if (form.action.includes('booking')) formType = 'booking';
              if (form.action.includes('consultation')) formType = 'consultation';
              
              if (typeof window.trackLocalInteraction === 'function') {
                window.trackLocalInteraction('form_submission', {
                  form_type: formType,
                  source_page: window.location.pathname,
                });
              }
            });
            
            // Track search query interactions (if site search is implemented)
            function trackSiteSearch(query, results) {
              if (typeof window.trackSEOEvent === 'function') {
                window.trackSEOEvent('site_search', {
                  search_term: query,
                  results_count: results,
                  source_page: window.location.pathname,
                });
              }
            }
            
            // Expose search tracking function
            window.trackSiteSearch = trackSiteSearch;
          `,
        }}
      />

      {/* Schema.org Validation and Monitoring */}
      <Script
        id="schema-validation"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Validate structured data implementation
            (function() {
              if (!${JSON.stringify(debugMode)}) return;
              
              const structuredDataElements = document.querySelectorAll('script[type="application/ld+json"]');
              let validSchemas = 0;
              let invalidSchemas = 0;
              
              structuredDataElements.forEach((element, index) => {
                try {
                  const data = JSON.parse(element.textContent);
                  console.log('Schema ' + (index + 1) + ':', data);
                  
                  // Basic validation
                  if (data['@context'] && data['@type']) {
                    validSchemas++;
                  } else {
                    invalidSchemas++;
                    console.warn('Invalid schema detected:', data);
                  }
                } catch (error) {
                  invalidSchemas++;
                  console.error('Schema parsing error:', error);
                }
              });
              
              console.log('SEO Schema Summary:', {
                total: structuredDataElements.length,
                valid: validSchemas,
                invalid: invalidSchemas
              });
              
              // Track schema implementation status
              if (typeof window.trackSEOEvent === 'function') {
                window.trackSEOEvent('schema_validation', {
                  total_schemas: structuredDataElements.length,
                  valid_schemas: validSchemas,
                  invalid_schemas: invalidSchemas,
                });
              }
            })();
          `,
        }}
      />

      {/* SEO Recommendations Engine */}
      <Script
        id="seo-recommendations"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Generate SEO recommendations based on page analysis
            (function() {
              if (!${JSON.stringify(debugMode)}) return;
              
              const recommendations = [];
              
              // Check page title
              const title = document.title;
              if (!title || title.length < 30) {
                recommendations.push('Title tag is too short (< 30 characters)');
              }
              if (title.length > 60) {
                recommendations.push('Title tag is too long (> 60 characters)');
              }
              
              // Check meta description
              const metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) {
                recommendations.push('Missing meta description');
              } else if (metaDesc.content.length < 120) {
                recommendations.push('Meta description is too short (< 120 characters)');
              } else if (metaDesc.content.length > 160) {
                recommendations.push('Meta description is too long (> 160 characters)');
              }
              
              // Check heading structure
              const h1s = document.querySelectorAll('h1');
              if (h1s.length === 0) {
                recommendations.push('Missing H1 tag');
              } else if (h1s.length > 1) {
                recommendations.push('Multiple H1 tags detected');
              }
              
              // Check images for alt text
              const images = document.querySelectorAll('img');
              const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
              if (imagesWithoutAlt.length > 0) {
                recommendations.push(imagesWithoutAlt.length + ' images missing alt text');
              }
              
              // Check for canonical URL
              const canonical = document.querySelector('link[rel="canonical"]');
              if (!canonical) {
                recommendations.push('Missing canonical URL');
              }
              
              // Check for schema markup
              const schemas = document.querySelectorAll('script[type="application/ld+json"]');
              if (schemas.length === 0) {
                recommendations.push('No structured data found');
              }
              
              // Log recommendations
              if (recommendations.length > 0) {
                console.warn('SEO Recommendations:', recommendations);
              } else {
                console.log('SEO Analysis: No issues detected');
              }
              
              // Track SEO audit results
              if (typeof window.trackSEOEvent === 'function') {
                window.trackSEOEvent('seo_audit', {
                  issues_count: recommendations.length,
                  page_type: window.location.pathname,
                  recommendations: recommendations.join('; '),
                });
              }
            })();
          `,
        }}
      />

      {debugMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            fontSize: '12px',
            zIndex: 9999,
            maxWidth: '300px',
          }}
        >
          <div>SEO Debug Mode Active</div>
          <div>Check console for detailed metrics</div>
          {performanceData && (
            <div>
              <div>LCP: {Math.round(performanceData.lcp)}ms</div>
              <div>CLS: {performanceData.cls?.toFixed(3)}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Helper function to extract location from URL
 */
function getLocationFromURL(): string {
  if (typeof window === 'undefined') return '';
  
  const path = window.location.pathname;
  const locationMatch = path.match(/tattoo-artist-([^\/]+)/);
  
  if (locationMatch) {
    return locationMatch[1].replace('-', ' ');
  }
  
  return 'crowley'; // Default location
}

/**
 * SEO Performance Dashboard Component (for admin use)
 */
export function SEOPerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading SEO metrics
    setTimeout(() => {
      setMetrics({
        coreWebVitals: {
          lcp: { value: 2.1, rating: 'good' },
          fid: { value: 85, rating: 'good' },
          cls: { value: 0.08, rating: 'good' },
        },
        searchVisibility: {
          impressions: 12500,
          clicks: 890,
          ctr: 7.1,
          avgPosition: 8.2,
        },
        localSEO: {
          gmb_views: 1250,
          gmb_clicks: 89,
          direction_requests: 34,
          phone_clicks: 23,
        },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4">Loading SEO metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={`font-bold ${metrics.coreWebVitals.lcp.rating === 'good' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.coreWebVitals.lcp.value}s
            </span>
          </div>
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={`font-bold ${metrics.coreWebVitals.fid.rating === 'good' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.coreWebVitals.fid.value}ms
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={`font-bold ${metrics.coreWebVitals.cls.rating === 'good' ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.coreWebVitals.cls.value}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Search Performance</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Impressions:</span>
            <span className="font-bold">{metrics.searchVisibility.impressions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Clicks:</span>
            <span className="font-bold">{metrics.searchVisibility.clicks}</span>
          </div>
          <div className="flex justify-between">
            <span>CTR:</span>
            <span className="font-bold">{metrics.searchVisibility.ctr}%</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Position:</span>
            <span className="font-bold">{metrics.searchVisibility.avgPosition}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Local SEO</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>GMB Views:</span>
            <span className="font-bold">{metrics.localSEO.gmb_views}</span>
          </div>
          <div className="flex justify-between">
            <span>GMB Clicks:</span>
            <span className="font-bold">{metrics.localSEO.gmb_clicks}</span>
          </div>
          <div className="flex justify-between">
            <span>Directions:</span>
            <span className="font-bold">{metrics.localSEO.direction_requests}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone Clicks:</span>
            <span className="font-bold">{metrics.localSEO.phone_clicks}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
