/**
 * Enhanced Performance tests for critical user flows
 * Measures and tracks performance metrics across key user journeys
 */
import { test, expect, Page } from '@playwright/test';
import { EnhancedHomePage } from './page-objects/enhanced-home-page';
import { EnhancedServicesPage } from './page-objects/enhanced-services-page';
import { EnhancedGalleryPage } from './page-objects/enhanced-gallery-page';
import { EnhancedBookingPage } from './page-objects/enhanced-booking-page';
import { EnhancedContactPage } from './page-objects/enhanced-contact-page';
import { EnhancedFAQPage } from './page-objects/enhanced-faq-page';
import { EnhancedAdminPage } from './page-objects/enhanced-admin-page';
import { VisualTesting } from './helpers/visual-testing';
import { PERFORMANCE } from './test-constants';

// Helper function to measure performance
async function measurePerformance(
  page: Page,
  action: () => Promise<void>,
  options: {
    name: string;
    allowedLoadTime?: number;
    visualTesting?: VisualTesting;
  },
): Promise<{
  navigationTime: number;
  loadTime: number;
  domContentLoadedTime: number;
  largestContentfulPaintTime: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}> {
  const { name, allowedLoadTime = PERFORMANCE.pageLoad, visualTesting } = options;

  // Clear the browser's performance entries
  await page.evaluate(() => {
    performance.clearResourceTimings();
    performance.clearMarks();
    performance.clearMeasures();
  });

  // Add a mark before the action
  await page.evaluate(() => {
    performance.mark('start-action');
  });

  // Start timer
  const startTime = Date.now();

  // Perform the action
  await action();

  // Calculate navigation time
  const navigationTime = Date.now() - startTime;

  // Take a screenshot if visual testing is enabled
  if (visualTesting) {
    await visualTesting.captureScreenshot(
      `performance_test_${name.toLowerCase().replace(/\s+/g, '_')}`,
    );
  }

  // Get detailed performance metrics from the browser
  const performanceMetrics = await page.evaluate(() => {
    // Mark the end of the action
    performance.mark('end-action');
    performance.measure('action-duration', 'start-action', 'end-action');

    // Get navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    // Get paint metrics
    const paintMetrics = performance.getEntriesByType('paint');
    const firstPaint = paintMetrics.find(entry => entry.name === 'first-paint');
    const firstContentfulPaint = paintMetrics.find(
      entry => entry.name === 'first-contentful-paint',
    );

    // Get LCP if available
    let largestContentfulPaintTime = 0;
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      largestContentfulPaintTime = lcpEntries[0].startTime;
    }

    // Get CLS if available
    let cumulativeLayoutShift = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    if (layoutShiftEntries.length > 0) {
      cumulativeLayoutShift = layoutShiftEntries.reduce(
        (sum, entry: unknown) => sum + entry.value,
        0,
      );
    }

    // Get FID if available (approximation, as it requires user interaction)
    let firstInputDelay = 0;
    const fidEntries = performance.getEntriesByType('first-input');
    if (fidEntries.length > 0) {
      firstInputDelay = (fidEntries[0] as any).processingStart - (fidEntries[0] as any).startTime;
    }

    return {
      // Navigation timing
      navigationStart: navigation ? navigation.startTime : 0,
      loadTime: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
      domContentLoadedTime: navigation
        ? navigation.domContentLoadedEventEnd - navigation.startTime
        : 0,

      // Paint metrics
      firstPaintTime: firstPaint ? firstPaint.startTime : 0,
      firstContentfulPaintTime: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
      largestContentfulPaintTime,

      // Layout and interaction metrics
      cumulativeLayoutShift,
      firstInputDelay,
    };
  });

  // Log the performance metrics
  console.log(`Performance metrics for ${name}:`);
  console.log(`- Navigation Time: ${navigationTime}ms`);
  console.log(`- Load Time: ${performanceMetrics.loadTime}ms`);
  console.log(`- DOM Content Loaded: ${performanceMetrics.domContentLoadedTime}ms`);
  console.log(`- Largest Contentful Paint: ${performanceMetrics.largestContentfulPaintTime}ms`);
  console.log(`- Cumulative Layout Shift: ${performanceMetrics.cumulativeLayoutShift}`);
  console.log(`- First Input Delay: ${performanceMetrics.firstInputDelay}ms`);

  // Check if navigation time is within allowed limits
  expect(navigationTime).toBeLessThan(
    allowedLoadTime,
    `${name} should load within ${allowedLoadTime}ms, but took ${navigationTime}ms`,
  );

  return {
    navigationTime,
    loadTime: performanceMetrics.loadTime,
    domContentLoadedTime: performanceMetrics.domContentLoadedTime,
    largestContentfulPaintTime: performanceMetrics.largestContentfulPaintTime,
    cumulativeLayoutShift: performanceMetrics.cumulativeLayoutShift,
    firstInputDelay: performanceMetrics.firstInputDelay,
  };
}

// Helper function to check resource loading
async function analyzeResourceLoading(page: Page): Promise<{
  totalResources: number;
  totalTransferSize: number;
  resourcesByType: Record<string, number>;
  largestResources: Array<{ name: string; size: number; type: string }>;
}> {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Count resources by type
    const resourcesByType: Record<string, number> = {};
    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      resourcesByType[type] = (resourcesByType[type] || 0) + 1;
    });

    // Calculate total transfer size
    const totalTransferSize = resources.reduce(
      (sum, resource) => sum + (resource.transferSize || 0),
      0,
    );

    // Get largest resources
    const largestResources = resources
      .map(resource => ({
        name: resource.name.split('?')[0], // Remove query params for clarity
        size: resource.transferSize || 0,
        type: resource.initiatorType || 'other',
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    return {
      totalResources: resources.length,
      totalTransferSize,
      resourcesByType,
      largestResources,
    };
  });
}

// Initialize visual testing
const setupVisualTesting = (page: Page, testName: string) => {
  return new VisualTesting(page, testName);
};

// Performance test for the home page
test('Home page performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'home_performance');
  const homePage = new EnhancedHomePage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await homePage.goto();
      await homePage.verifyHomePage();
    },
    { name: 'Home Page Initial Load', visualTesting },
  );

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Home page resource stats:', resourceStats);

  // Verify key performance expectations
  expect(resourceStats.totalResources).toBeLessThan(
    100,
    'Home page should have fewer than 100 resources',
  );
  expect(resourceStats.totalTransferSize).toBeLessThan(
    5 * 1024 * 1024,
    'Home page should be less than 5MB in size',
  );
});

// Performance test for the services page
test('Services page performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'services_performance');
  const servicesPage = new EnhancedServicesPage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await servicesPage.goto();
      await servicesPage.verifyServicesPage();
    },
    { name: 'Services Page Initial Load', visualTesting },
  );

  // Test category switching performance if categories exist
  try {
    const categories = await servicesPage.getServiceCategories();
    if (categories.length > 0) {
      // Measure performance of switching to first category
      await measurePerformance(
        page,
        async () => {
          await servicesPage.switchCategory(categories[0]);
        },
        { name: 'Services Category Switch', allowedLoadTime: PERFORMANCE.animation, visualTesting },
      );
    }
  } catch (error) {
    console.log('No service categories found for performance testing');
  }

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Services page resource stats:', resourceStats);
});

// Performance test for the gallery page
test('Gallery page performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'gallery_performance');
  const galleryPage = new EnhancedGalleryPage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await galleryPage.goto();
      // Wait for images to load
      await page.waitForTimeout(2000);
    },
    {
      name: 'Gallery Page Initial Load',
      allowedLoadTime: PERFORMANCE.pageLoad * 1.5,
      visualTesting,
    },
  );

  // Analyze resource loading, with focus on image loading
  const resourceStats = await analyzeResourceLoading(page);

  // Log image-specific stats
  const imageResources = resourceStats.resourcesByType['img'] || 0;
  console.log(`Gallery page image resources: ${imageResources}`);
  console.log('Largest resources:', resourceStats.largestResources);

  // Check if images have proper lazy loading attributes
  const lazyLoadedImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.filter(img => img.loading === 'lazy').length;
  });

  console.log(`Images with lazy loading: ${lazyLoadedImages}`);

  // Verify that images are optimized
  const imagePerformance = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));

    return {
      totalImages: images.length,
      imagesWithWidth: images.filter(img => img.width > 0).length,
      imagesWithHeight: images.filter(img => img.height > 0).length,
      imagesWithSrcSet: images.filter(img => img.srcset).length,
      imagesWithLazyLoading: images.filter(img => img.loading === 'lazy').length,
    };
  });

  console.log('Gallery image optimization metrics:', imagePerformance);

  // Verify expectations for images
  if (imagePerformance.totalImages > 0) {
    const lazyLoadPercentage =
      (imagePerformance.imagesWithLazyLoading / imagePerformance.totalImages) * 100;
    expect(lazyLoadPercentage).toBeGreaterThan(
      50,
      'At least 50% of images should use lazy loading',
    );
  }
});

// Performance test for the booking flow
test('Booking flow performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'booking_performance');
  const bookingPage = new EnhancedBookingPage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await bookingPage.goto();
      await bookingPage.verifyBookingPage();
    },
    { name: 'Booking Page Initial Load', visualTesting },
  );

  // Test form interaction performance
  await measurePerformance(
    page,
    async () => {
      // Fill first step of booking form with test data
      await bookingPage.fillBookingForm({
        name: 'Performance Test User',
        email: 'performance-test@example.com',
        phone: '5551234567',
      });
    },
    { name: 'Booking Form Input', allowedLoadTime: PERFORMANCE.animation, visualTesting },
  );

  // Test form submission performance (don't actually submit to avoid creating test data)
  // Just measure the client-side validation speed
  await measurePerformance(
    page,
    async () => {
      // Attempt to proceed to next step, which will trigger validation
      await page.locator('button:has-text("Next"), button:has-text("Continue")').click();
      await page.waitForTimeout(500);
    },
    { name: 'Booking Form Validation', allowedLoadTime: PERFORMANCE.animation, visualTesting },
  );

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Booking page resource stats:', resourceStats);
});

// Performance test for the contact page
test('Contact page performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'contact_performance');
  const contactPage = new EnhancedContactPage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await contactPage.goto();
      await contactPage.verifyContactPage();
    },
    { name: 'Contact Page Initial Load', visualTesting },
  );

  // Test map loading performance if map exists
  try {
    const hasMap = await contactPage.isMapDisplayed();
    if (hasMap) {
      console.log('Map is displayed on contact page');

      // Take screenshot of map for visual comparison
      if (visualTesting) {
        await visualTesting.captureScreenshot('contact_page_map');
      }
    }
  } catch (error) {
    console.log('No map found on contact page');
  }

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Contact page resource stats:', resourceStats);
});

// Performance test for the FAQ page
test('FAQ page performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'faq_performance');
  const faqPage = new EnhancedFAQPage(page).setVisualTesting(visualTesting);

  // Measure initial load performance
  await measurePerformance(
    page,
    async () => {
      await faqPage.goto();
      await faqPage.verifyFAQPage();
    },
    { name: 'FAQ Page Initial Load', visualTesting },
  );

  // Test accordion performance
  try {
    const questionCount = await faqPage.getAccordionItemCount();
    if (questionCount > 0) {
      // Measure performance of opening first question
      await measurePerformance(
        page,
        async () => {
          await faqPage.openQuestion(0);
        },
        { name: 'FAQ Accordion Open', allowedLoadTime: PERFORMANCE.animation, visualTesting },
      );

      // Measure performance of closing first question
      await measurePerformance(
        page,
        async () => {
          await faqPage.closeQuestion(0);
        },
        { name: 'FAQ Accordion Close', allowedLoadTime: PERFORMANCE.animation, visualTesting },
      );
    }
  } catch (error) {
    console.log('No FAQ questions found for performance testing');
  }

  // Test category navigation performance if categories exist
  try {
    const categories = await faqPage.getCategoryNames();
    if (categories.length > 0) {
      // Measure performance of navigating to first category
      await measurePerformance(
        page,
        async () => {
          await faqPage.navigateToCategory(categories[0]);
        },
        { name: 'FAQ Category Navigation', allowedLoadTime: PERFORMANCE.animation, visualTesting },
      );
    }
  } catch (error) {
    console.log('No FAQ categories found for performance testing');
  }

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('FAQ page resource stats:', resourceStats);
});

// Performance test for the admin dashboard
test('Admin dashboard performance', async ({ page }) => {
  // This test requires authentication, so we need to log in first
  // For simplicity, we'll use the test admin credentials from test-constants

  const visualTesting = setupVisualTesting(page, 'admin_performance');
  const adminPage = new EnhancedAdminPage(page).setVisualTesting(visualTesting);

  // Log in first (this is just a placeholder, actual login would depend on the auth implementation)
  await page.goto('/auth/login');

  // Assuming there are input fields for email and password
  await page.fill('input[type="email"]', 'test-admin@example.com');
  await page.fill('input[type="password"]', 'Test-Password123!');
  await page.click('button[type="submit"]');

  // Measure admin dashboard load performance
  await measurePerformance(
    page,
    async () => {
      await adminPage.goto();
      await adminPage.verifyAdminDashboard();
    },
    {
      name: 'Admin Dashboard Initial Load',
      allowedLoadTime: PERFORMANCE.pageLoad * 1.5,
      visualTesting,
    },
  );

  // Test navigation to different sections
  try {
    // Measure performance of navigating to customers section
    await measurePerformance(
      page,
      async () => {
        await adminPage.navigateToSection('Customers');
      },
      { name: 'Admin Navigation to Customers', visualTesting },
    );

    // Measure performance of navigating to appointments section
    await measurePerformance(
      page,
      async () => {
        await adminPage.navigateToSection('Appointments');
      },
      { name: 'Admin Navigation to Appointments', visualTesting },
    );
  } catch (error) {
    console.log('Error during admin section navigation tests:', error);
  }

  // Analyze resource loading
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Admin dashboard resource stats:', resourceStats);

  // Additional checks for admin-specific resources
  expect(resourceStats.totalResources).toBeLessThan(
    150,
    'Admin dashboard should have fewer than 150 resources',
  );
  expect(resourceStats.totalTransferSize).toBeLessThan(
    8 * 1024 * 1024,
    'Admin dashboard should be less than 8MB in size',
  );
});

// Performance test for end-to-end booking flow
test('End-to-end booking flow performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'booking_flow_e2e');
  const homePage = new EnhancedHomePage(page).setVisualTesting(visualTesting);
  const servicesPage = new EnhancedServicesPage(page).setVisualTesting(visualTesting);
  const bookingPage = new EnhancedBookingPage(page).setVisualTesting(visualTesting);

  // Start at home page
  await measurePerformance(
    page,
    async () => {
      await homePage.goto();
    },
    { name: 'E2E Flow - Home Page Load', visualTesting },
  );

  // Navigate to services page
  await measurePerformance(
    page,
    async () => {
      await page.click('a:has-text("Services"), [href="/services"]');
      await servicesPage.verifyServicesPage();
    },
    { name: 'E2E Flow - Navigation to Services', visualTesting },
  );

  // Click on a service to view details
  try {
    const serviceCount = await servicesPage.getServiceItemCount();
    if (serviceCount > 0) {
      await measurePerformance(
        page,
        async () => {
          await servicesPage.clickServiceItem(0);
        },
        {
          name: 'E2E Flow - View Service Details',
          allowedLoadTime: PERFORMANCE.animation,
          visualTesting,
        },
      );
    }
  } catch (error) {
    console.log('No service items found for performance testing');
  }

  // Navigate to booking page
  await measurePerformance(
    page,
    async () => {
      await page.click('a:has-text("Book"), button:has-text("Book"), [href="/booking"]');
      await bookingPage.verifyBookingPage();
    },
    { name: 'E2E Flow - Navigation to Booking', visualTesting },
  );

  // Fill booking form
  await measurePerformance(
    page,
    async () => {
      await bookingPage.fillBookingForm({
        name: 'E2E Performance Test',
        email: 'e2e-test@example.com',
        phone: '5551234567',
        description: 'This is an end-to-end performance test',
      });
    },
    { name: 'E2E Flow - Fill Booking Form', allowedLoadTime: PERFORMANCE.animation, visualTesting },
  );

  // Analyze overall resource loading for the flow
  const resourceStats = await analyzeResourceLoading(page);
  console.log('End-to-end flow resource stats:', resourceStats);
});

// Performance test for mobile responsiveness
test('Mobile responsiveness performance', async ({ page }) => {
  const visualTesting = setupVisualTesting(page, 'mobile_performance');
  const homePage = new EnhancedHomePage(page).setVisualTesting(visualTesting);

  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });

  // Measure home page load on mobile
  await measurePerformance(
    page,
    async () => {
      await homePage.goto();
      await homePage.verifyHomePage();
    },
    { name: 'Mobile Home Page Load', visualTesting },
  );

  // Test mobile menu performance if it exists
  try {
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"], .mobile-menu-button');
    if ((await mobileMenuButton.count()) > 0) {
      // Measure performance of opening mobile menu
      await measurePerformance(
        page,
        async () => {
          await mobileMenuButton.click();
          // Wait for menu animation
          await page.waitForTimeout(300);
        },
        { name: 'Mobile Menu Open', allowedLoadTime: PERFORMANCE.animation, visualTesting },
      );
    }
  } catch (error) {
    console.log('No mobile menu found for performance testing');
  }

  // Analyze resource loading on mobile
  const resourceStats = await analyzeResourceLoading(page);
  console.log('Mobile performance resource stats:', resourceStats);

  // Verify mobile-specific optimizations
  expect(resourceStats.totalTransferSize).toBeLessThan(
    2.5 * 1024 * 1024,
    'Mobile page should be less than 2.5MB in size',
  );

  // Reset viewport to desktop
  await page.setViewportSize({ width: 1280, height: 800 });
});
