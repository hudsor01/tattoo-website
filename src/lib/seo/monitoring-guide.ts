/**
 * SEO Monitoring and Action Guide
 * Step-by-step instructions for tracking and improving SEO performance
 */

export interface SEOMonitoringConfig {
  tools: {
    webVitals: string[];
    rankings: string[];
    analytics: string[];
    freeTools: string[];
  };
  metrics: {
    coreWebVitals: Record<string, { good: number; poor: number; action: string }>;
    rankings: Record<string, string>;
    traffic: Record<string, string>;
  };
  actionPlans: Record<string, string[]>;
}

export const seoMonitoringGuide: SEOMonitoringConfig = {
  tools: {
    webVitals: [
      'Google Search Console (Free)',
      'PageSpeed Insights (Free)',
      'GTmetrix (Free tier)',
      'WebPageTest (Free)',
      'Chrome DevTools (Free)'
    ],
    rankings: [
      'Google Search Console (Free)',
      'Google My Business Insights (Free)',
      'Ubersuggest (Free tier)',
      'SEMrush (Paid)',
      'Ahrefs (Paid)',
      'BrightLocal (Local SEO - Paid)'
    ],
    analytics: [
      'Google Analytics 4 (Free)',
      'Google Search Console (Free)',
      'Vercel Analytics (Free with hosting)',
      'Hotjar (Free tier)',
      'Microsoft Clarity (Free)'
    ],
    freeTools: [
      'Google My Business',
      'Google Search Console',
      'Google Analytics',
      'PageSpeed Insights',
      'Mobile-Friendly Test',
      'Rich Results Test'
    ]
  },
  metrics: {
    coreWebVitals: {
      lcp: {
        good: 2.5,
        poor: 4.0,
        action: 'Optimize images, remove render-blocking resources, improve server response time'
      },
      fid: {
        good: 100,
        poor: 300,
        action: 'Reduce JavaScript execution time, break up long tasks, optimize third-party code'
      },
      cls: {
        good: 0.1,
        poor: 0.25,
        action: 'Set image dimensions, avoid inserting content above existing content, use transform animations'
      }
    },
    rankings: {
      'tattoo artist Crowley TX': 'Track weekly - Target: Top 3',
      'custom tattoo DFW': 'Track weekly - Target: Top 5',
      'tattoo shop near me': 'Track daily - Target: Map pack',
      'Fernando Govea tattoo': 'Track monthly - Target: #1',
      'Ink 37 Tattoos': 'Track monthly - Target: #1'
    },
    traffic: {
      'organic_sessions': 'Month-over-month growth target: 25%',
      'local_sessions': 'Track sessions from target cities',
      'conversion_rate': 'Consultation bookings / sessions target: 3%',
      'bounce_rate': 'Target: Under 60%',
      'pages_per_session': 'Target: Over 2.5'
    }
  },
  actionPlans: {
    'poor_lcp': [
      '1. Check largest element on page (usually hero image)',
      '2. Preload critical images with <link rel="preload">',
      '3. Optimize image formats (WebP/AVIF)',
      '4. Use proper image sizing',
      '5. Minimize render-blocking CSS/JS',
      '6. Consider lazy loading for below-fold content',
      '7. Improve server response time'
    ],
    'poor_fid': [
      '1. Audit JavaScript bundles',
      '2. Remove unused JavaScript',
      '3. Code split and lazy load non-critical JS',
      '4. Minimize main thread work',
      '5. Optimize third-party scripts',
      '6. Use web workers for heavy computations'
    ],
    'poor_cls': [
      '1. Set width/height on images and videos',
      '2. Reserve space for ads and embeds',
      '3. Avoid inserting content above existing content',
      '4. Use transform instead of changing layout properties',
      '5. Ensure web fonts don\'t cause layout shift'
    ],
    'dropping_rankings': [
      '1. Check for technical SEO issues',
      '2. Analyze competitor content and backlinks',
      '3. Update and improve content quality',
      '4. Build more local citations',
      '5. Encourage more Google reviews',
      '6. Optimize for new keyword variations',
      '7. Check for penalties in Search Console'
    ],
    'low_local_visibility': [
      '1. Optimize Google Business Profile completely',
      '2. Get more local citations and directory listings',
      '3. Encourage customer reviews',
      '4. Create location-specific content',
      '5. Build local backlinks',
      '6. Ensure NAP consistency across web',
      '7. Use local schema markup'
    ]
  }
};

/**
 * Weekly SEO monitoring checklist
 */
export function getWeeklySEOChecklist() {
  return {
    monday: [
      'Check Google Search Console for new issues',
      'Review Core Web Vitals report',
      'Monitor Google Business Profile insights',
      'Check for new Google reviews and respond'
    ],
    wednesday: [
      'Track local search rankings for primary keywords',
      'Review Google Analytics traffic trends',
      'Check website uptime and performance',
      'Monitor competitor Google Business profiles'
    ],
    friday: [
      'Analyze consultation booking conversions',
      'Review social media engagement',
      'Check for new backlinks or mentions',
      'Plan content for following week'
    ]
  };
}

/**
 * Monthly SEO audit checklist
 */
export function getMonthlySEOAudit() {
  return {
    technical: [
      'Run full site crawl for technical issues',
      'Check all pages for Core Web Vitals',
      'Audit structured data implementation',
      'Verify canonical URLs and redirects',
      'Test mobile-friendliness of all pages'
    ],
    content: [
      'Review and update outdated content',
      'Analyze top-performing pages',
      'Identify content gaps vs competitors',
      'Plan new location-specific content',
      'Update gallery with fresh work'
    ],
    local: [
      'Audit Google Business Profile completeness',
      'Check NAP consistency across directories',
      'Monitor local citation opportunities',
      'Track local keyword rankings',
      'Analyze local competitor activities'
    ],
    analytics: [
      'Review organic traffic trends',
      'Analyze conversion funnel performance',
      'Track consultation booking sources',
      'Monitor user behavior metrics',
      'Identify top-performing keywords'
    ]
  };
}

/**
 * What to do with local search ranking data
 */
export function getLocalRankingActions() {
  return {
    'ranking_up': [
      'Document what caused the improvement',
      'Double down on successful strategies',
      'Expand to similar keywords',
      'Create content around ranking keywords',
      'Build more topical authority'
    ],
    'ranking_down': [
      'Check for technical issues on affected pages',
      'Analyze what competitors are doing differently',
      'Update and improve content quality',
      'Build more relevant backlinks',
      'Optimize for user intent better',
      'Check for Google algorithm updates'
    ],
    'not_ranking': [
      'Ensure pages are indexed in Google',
      'Check keyword difficulty and competition',
      'Improve on-page SEO optimization',
      'Build topical authority with supporting content',
      'Get more local citations and backlinks',
      'Consider targeting long-tail variations first'
    ],
    'ranking_fluctuating': [
      'Check for technical instability',
      'Analyze user engagement metrics',
      'Look for content quality issues',
      'Monitor for algorithm updates',
      'Strengthen E-A-T signals',
      'Improve page experience metrics'
    ]
  };
}

/**
 * Free tools monitoring setup
 */
export function getFreeMonitoringSetup() {
  return {
    'google_search_console': {
      setup: [
        '1. Add and verify your website property',
        '2. Submit XML sitemap',
        '3. Set up email alerts for critical issues',
        '4. Configure data sharing with Google Analytics'
      ],
      monitor: [
        'Core Web Vitals report weekly',
        'Coverage issues daily',
        'Performance (search queries) weekly',
        'Manual actions monthly'
      ]
    },
    'google_analytics': {
      setup: [
        '1. Set up GA4 property',
        '2. Configure goals for consultation bookings',
        '3. Set up custom events for key actions',
        '4. Enable enhanced ecommerce if applicable'
      ],
      monitor: [
        'Organic traffic trends weekly',
        'Conversion rate weekly',
        'User behavior flow monthly',
        'Geographic performance monthly'
      ]
    },
    'google_business_profile': {
      setup: [
        '1. Claim and verify your business listing',
        '2. Complete all profile sections 100%',
        '3. Add high-quality photos regularly',
        '4. Enable messaging and booking'
      ],
      monitor: [
        'Profile views and engagement weekly',
        'Review new reviews and respond daily',
        'Insights and analytics weekly',
        'Competitor profiles monthly'
      ]
    }
  };
}

/**
 * Performance benchmarks for tattoo industry
 */
export function getIndustryBenchmarks() {
  return {
    'core_web_vitals': {
      lcp: 'Target: Under 2.0s (Industry avg: 3.2s)',
      fid: 'Target: Under 50ms (Industry avg: 120ms)',
      cls: 'Target: Under 0.05 (Industry avg: 0.15)'
    },
    'local_seo': {
      'google_business_views': 'Target: 1000+ monthly views',
      'website_clicks_from_gmb': 'Target: 15%+ CTR',
      'direction_requests': 'Target: 50+ monthly',
      'phone_calls': 'Target: 25+ monthly'
    },
    'organic_traffic': {
      'monthly_sessions': 'Target: 2000+ (Small business)',
      'organic_growth': 'Target: 20% month-over-month',
      'consultation_conversion': 'Target: 3-5%',
      'pages_per_session': 'Target: 2.5+'
    }
  };
}