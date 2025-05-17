/**
 * Visual baselines for critical UI components
 * Captures screenshots for visual regression testing
 */
import { test } from '@playwright/test';
import { EnhancedHomePage } from './page-objects/enhanced-home-page';
import { EnhancedServicesPage } from './page-objects/enhanced-services-page';
import { EnhancedGalleryPage } from './page-objects/enhanced-gallery-page';
import { EnhancedBookingPage } from './page-objects/enhanced-booking-page';
import { EnhancedContactPage } from './page-objects/enhanced-contact-page';
import { EnhancedFAQPage } from './page-objects/enhanced-faq-page';
import { EnhancedAdminPage } from './page-objects/enhanced-admin-page';
import { VisualTesting } from './helpers/visual-testing';

// Home page visual baselines
test('Home page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'home_baselines');
  const homePage = new EnhancedHomePage(page).setVisualTesting(visualTesting);
  
  // Navigate to home page
  await homePage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('home_full_page', null, { fullPage: true });
  
  // Capture hero section
  await visualTesting.captureScreenshot('home_hero_section', '.hero, [data-testid="hero-section"]');
  
  // Capture services section
  await visualTesting.captureScreenshot('home_services_section', '.services-section, [data-testid="services-section"]');
  
  // Capture gallery preview section
  await visualTesting.captureScreenshot('home_gallery_preview', '.gallery-preview, [data-testid="gallery-preview"]');
  
  // Capture testimonials section
  await visualTesting.captureScreenshot('home_testimonials', '.testimonials, [data-testid="testimonials-section"]');
  
  // Capture CTA section
  await visualTesting.captureScreenshot('home_cta', '.cta-section, [data-testid="cta-section"]');
  
  // Capture header and navigation
  await visualTesting.captureScreenshot('home_header', 'header, [data-testid="header"]');
  
  // Capture footer
  await visualTesting.captureScreenshot('home_footer', 'footer, [data-testid="footer"]');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('home_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Services page visual baselines
test('Services page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'services_baselines');
  const servicesPage = new EnhancedServicesPage(page).setVisualTesting(visualTesting);
  
  // Navigate to services page
  await servicesPage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('services_full_page', null, { fullPage: true });
  
  // Capture services header section
  await visualTesting.captureScreenshot('services_header', 'h1, .page-header, [data-testid="services-header"]');
  
  // Capture service categories
  await visualTesting.captureScreenshot('services_categories', '.service-categories, [data-testid="service-categories"]');
  
  // Capture service items
  await visualTesting.captureScreenshot('services_items', '.services-list, [data-testid="services-list"]');
  
  // Capture a service item
  await visualTesting.captureScreenshot('services_item', '.service-item:first-child, [data-testid="service-item"]:first-child');
  
  // Click on a service to open modal (if available)
  try {
    await servicesPage.clickServiceItem(0);
    // Capture service modal
    await visualTesting.captureScreenshot('services_modal', '.service-modal, [data-testid="service-modal"]');
    // Close modal
    await servicesPage.closeServiceModal();
  } catch (error) {
    console.log('No service modal available for visual baseline');
  }
  
  // Capture pricing table if available
  await visualTesting.captureScreenshot('services_pricing_table', '.pricing-table, [data-testid="pricing-table"]');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('services_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Gallery page visual baselines
test('Gallery page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'gallery_baselines');
  const galleryPage = new EnhancedGalleryPage(page).setVisualTesting(visualTesting);
  
  // Navigate to gallery page
  await galleryPage.goto();
  
  // Wait for images to load
  await page.waitForTimeout(2000);
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('gallery_full_page', null, { fullPage: true });
  
  // Capture gallery header
  await visualTesting.captureScreenshot('gallery_header', 'h1, .page-header, [data-testid="gallery-header"]');
  
  // Capture gallery grid
  await visualTesting.captureScreenshot('gallery_grid', '.gallery-grid, [data-testid="gallery-grid"]');
  
  // Capture a gallery item
  await visualTesting.captureScreenshot('gallery_item', '.gallery-item:first-child, [data-testid="gallery-item"]:first-child');
  
  // Click on a gallery item to open lightbox (if available)
  try {
    await galleryPage.clickGalleryItem(0);
    // Capture lightbox
    await visualTesting.captureScreenshot('gallery_lightbox', '.lightbox, [data-testid="lightbox"]');
    // Close lightbox
    await galleryPage.closeLightbox();
  } catch (error) {
    console.log('No gallery lightbox available for visual baseline');
  }
  
  // Capture filters if available
  await visualTesting.captureScreenshot('gallery_filters', '.gallery-filters, [data-testid="gallery-filters"]');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await page.waitForTimeout(2000); // Wait for images to load
  await visualTesting.captureScreenshot('gallery_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Booking page visual baselines
test('Booking page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'booking_baselines');
  const bookingPage = new EnhancedBookingPage(page).setVisualTesting(visualTesting);
  
  // Navigate to booking page
  await bookingPage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('booking_full_page', null, { fullPage: true });
  
  // Capture booking header
  await visualTesting.captureScreenshot('booking_header', 'h1, .page-header, [data-testid="booking-header"]');
  
  // Capture booking form
  await visualTesting.captureScreenshot('booking_form', 'form, .booking-form, [data-testid="booking-form"]');
  
  // Capture form step indicators
  await visualTesting.captureScreenshot('booking_steps', '.booking-steps, [data-testid="booking-steps"]');
  
  // Fill form with test data
  await bookingPage.fillBookingForm({
    name: 'Visual Test User',
    email: 'visual-test@example.com',
    phone: '5551234567',
  });
  
  // Capture filled form
  await visualTesting.captureScreenshot('booking_form_filled');
  
  // Test form validation (don't submit, just trigger validation)
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(500);
  
  // Capture validation state
  await visualTesting.captureScreenshot('booking_form_validation');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('booking_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Contact page visual baselines
test('Contact page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'contact_baselines');
  const contactPage = new EnhancedContactPage(page).setVisualTesting(visualTesting);
  
  // Navigate to contact page
  await contactPage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('contact_full_page', null, { fullPage: true });
  
  // Capture contact header
  await visualTesting.captureScreenshot('contact_header', 'h1, .page-header, [data-testid="contact-header"]');
  
  // Capture contact form
  await visualTesting.captureScreenshot('contact_form', 'form, .contact-form, [data-testid="contact-form"]');
  
  // Capture contact info section
  await visualTesting.captureScreenshot('contact_info', '.contact-info, [data-testid="contact-info"]');
  
  // Capture map if available
  await visualTesting.captureScreenshot('contact_map', '.map-container, [data-testid="map-container"]');
  
  // Fill form with test data
  await contactPage.fillContactForm({
    name: 'Visual Test User',
    email: 'visual-test@example.com',
    message: 'This is a test message for visual baseline capture',
  });
  
  // Capture filled form
  await visualTesting.captureScreenshot('contact_form_filled');
  
  // Test form validation (don't submit, just trigger validation)
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(500);
  
  // Capture validation state
  await visualTesting.captureScreenshot('contact_form_validation');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('contact_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// FAQ page visual baselines
test('FAQ page visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'faq_baselines');
  const faqPage = new EnhancedFAQPage(page).setVisualTesting(visualTesting);
  
  // Navigate to FAQ page
  await faqPage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('faq_full_page', null, { fullPage: true });
  
  // Capture FAQ header
  await visualTesting.captureScreenshot('faq_header', 'h1, .page-header, [data-testid="faq-header"]');
  
  // Capture search section
  await visualTesting.captureScreenshot('faq_search', '.faq-search, input[type="search"]');
  
  // Capture category navigation
  await visualTesting.captureScreenshot('faq_categories', '.category-navigation, [data-testid="faq-categories"]');
  
  // Capture accordion container
  await visualTesting.captureScreenshot('faq_accordion', '.accordion, [data-testid="faq-accordion"]');
  
  // Open an accordion item
  try {
    await faqPage.openQuestion(0);
    // Capture open accordion item
    await visualTesting.captureScreenshot('faq_accordion_open');
    // Close accordion item
    await faqPage.closeQuestion(0);
  } catch (error) {
    console.log('No FAQ accordion available for visual baseline');
  }
  
  // Capture CTA section
  await visualTesting.captureScreenshot('faq_cta', '.cta-section, section:has-text("Still Have Questions?")');
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('faq_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Admin dashboard visual baselines
test('Admin dashboard visual baselines', async ({ page }) => {
  // This test requires authentication, so we need to log in first
  // For simplicity, we'll use the test admin credentials
  
  const visualTesting = new VisualTesting(page, 'admin_baselines');
  const adminPage = new EnhancedAdminPage(page).setVisualTesting(visualTesting);
  
  // Log in first (this is just a placeholder, actual login would depend on the auth implementation)
  await page.goto('/auth/login');
  
  // Assuming there are input fields for email and password
  await page.fill('input[type="email"]', 'test-admin@example.com');
  await page.fill('input[type="password"]', 'Test-Password123!');
  await page.click('button[type="submit"]');
  
  // Navigate to admin dashboard
  await adminPage.goto();
  
  // Capture full page screenshot
  await visualTesting.captureScreenshot('admin_full_page', null, { fullPage: true });
  
  // Capture admin header
  await visualTesting.captureScreenshot('admin_header', 'header, .app-header, [data-testid="admin-header"]');
  
  // Capture sidebar
  await visualTesting.captureScreenshot('admin_sidebar', 'aside, .sidebar, nav.admin-nav, [data-testid="admin-sidebar"]');
  
  // Capture dashboard cards
  await visualTesting.captureScreenshot('admin_dashboard_cards', '.dashboard-card, [data-testid="dashboard-card"]');
  
  // Capture stats cards
  await visualTesting.captureScreenshot('admin_stats_cards', '.stats-card, [data-testid="stats-card"]');
  
  // Capture charts
  await visualTesting.captureScreenshot('admin_charts', '.chart-container, [data-testid="chart"]');
  
  // Capture recent activity
  await visualTesting.captureScreenshot('admin_recent_activity', '.recent-activity, [data-testid="recent-activity"]');
  
  // Navigate to different sections and capture
  try {
    // Navigate to customers section
    await adminPage.navigateToSection('Customers');
    await visualTesting.captureScreenshot('admin_customers_section');
    
    // Navigate to appointments section
    await adminPage.navigateToSection('Appointments');
    await visualTesting.captureScreenshot('admin_appointments_section');
    
    // Navigate to gallery management
    await adminPage.navigateToSection('Gallery');
    await visualTesting.captureScreenshot('admin_gallery_section');
    
    // Navigate to services management
    await adminPage.navigateToSection('Services');
    await visualTesting.captureScreenshot('admin_services_section');
  } catch (error) {
    console.log('Error during admin section navigation for visual baselines:', error);
  }
  
  // Capture table
  await visualTesting.captureScreenshot('admin_data_table', 'table, [role="table"], [data-testid="data-table"]');
  
  // Try to capture a modal if possible
  try {
    await adminPage.clickCreateNew();
    await visualTesting.captureScreenshot('admin_create_modal', '[role="dialog"], .modal, [data-testid="modal"]');
    await adminPage.closeModal();
  } catch (error) {
    console.log('No modal available for visual baseline');
  }
  
  // Capture mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload();
  await visualTesting.captureScreenshot('admin_mobile_view');
  
  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 800 });
});

// Common UI component visual baselines
test('Common UI component visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'ui_components');
  
  // Navigate to home page first
  await page.goto('/');
  
  // Capture navigation
  await visualTesting.captureScreenshot('ui_navigation', 'nav, [data-testid="navigation"]');
  
  // Capture logo
  await visualTesting.captureScreenshot('ui_logo', '.logo, [data-testid="logo"]');
  
  // Capture footer
  await visualTesting.captureScreenshot('ui_footer', 'footer, [data-testid="footer"]');
  
  // Capture buttons
  await visualTesting.captureScreenshot('ui_primary_button', 'button.primary, .btn-primary, [data-testid="primary-button"]');
  await visualTesting.captureScreenshot('ui_secondary_button', 'button.secondary, .btn-secondary, [data-testid="secondary-button"]');
  
  // Capture form elements
  await page.goto('/contact'); // Navigate to a page with a form
  await visualTesting.captureScreenshot('ui_input', 'input[type="text"], [data-testid="text-input"]');
  await visualTesting.captureScreenshot('ui_textarea', 'textarea, [data-testid="textarea"]');
  await visualTesting.captureScreenshot('ui_select', 'select, [data-testid="select"]');
  
  // Capture cards
  await page.goto('/');
  await visualTesting.captureScreenshot('ui_card', '.card, [data-testid="card"]');
  
  // Capture modals if available
  try {
    // Find a button that might open a modal
    await page.click('button:has-text("Book Now"), button:has-text("Contact"), a:has-text("Book Now")');
    await page.waitForTimeout(500);
    await visualTesting.captureScreenshot('ui_modal', '[role="dialog"], .modal, [data-testid="modal"]');
  } catch (error) {
    console.log('No modal available for visual baseline');
  }
  
  // Capture icons
  await visualTesting.captureScreenshot('ui_icons', '.icon, svg, [data-testid="icon"]');
  
  // Capture dark mode vs light mode (if theme toggle exists)
  try {
    const themeToggle = page.locator('.theme-toggle, [data-testid="theme-toggle"]');
    if (await themeToggle.count() > 0) {
      await visualTesting.captureScreenshot('ui_light_mode');
      await themeToggle.click();
      await visualTesting.captureScreenshot('ui_dark_mode');
    }
  } catch (error) {
    console.log('No theme toggle available for visual baseline');
  }
});

// Responsive visual baselines
test('Responsive visual baselines', async ({ page }) => {
  const visualTesting = new VisualTesting(page, 'responsive');
  
  // Test responsive layouts at different breakpoints
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'laptop', width: 1280, height: 800 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];
  
  // Test each breakpoint on key pages
  for (const breakpoint of breakpoints) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    
    // Home page
    await page.goto('/');
    await visualTesting.captureScreenshot(`responsive_home_${breakpoint.name}`);
    
    // Services page
    await page.goto('/services');
    await visualTesting.captureScreenshot(`responsive_services_${breakpoint.name}`);
    
    // Gallery page
    await page.goto('/gallery');
    await page.waitForTimeout(1000); // Wait for images to load
    await visualTesting.captureScreenshot(`responsive_gallery_${breakpoint.name}`);
    
    // Booking page
    await page.goto('/booking');
    await visualTesting.captureScreenshot(`responsive_booking_${breakpoint.name}`);
    
    // Contact page
    await page.goto('/contact');
    await visualTesting.captureScreenshot(`responsive_contact_${breakpoint.name}`);
  }
  
  // Reset to desktop
  await page.setViewportSize({ width: 1280, height: 800 });
});