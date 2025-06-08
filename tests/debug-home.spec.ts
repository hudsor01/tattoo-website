import { test, expect } from '@playwright/test';

test.describe('Home Page Debug', () => {
  test('Debug home page loading, animations, and console errors', async ({ page }) => {
    console.log('Starting home page debug test...');

    // Set up console error tracking
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
        console.log('⚠️ Console Warning:', msg.text());
      }
    });

    page.on('response', (response) => {
      if (!response.ok() && response.url().includes('localhost')) {
        networkErrors.push(`${response.status()} ${response.statusText()} - ${response.url()}`);
        console.log('🌐 Network Error:', response.status(), response.url());
      }
    });

    // Navigate to home page
    console.log('Navigating to home page...');
    await page.goto('/');

    // Wait 3 seconds for full page load
    console.log('Waiting 3 seconds for full page load...');
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/home-page-loaded.png', fullPage: true });
    console.log('📸 Screenshot saved: home-page-loaded.png');

    // Check for framer-motion elements
    console.log('Checking for framer-motion elements...');
    
    // Look for any motion-related elements
    const motionElements = await page.locator('[data-framer-motion-initial]').count();
    console.log(`Found ${motionElements} framer-motion elements with initial props`);

    // Check for carousel elements
    const carouselElements = await page.locator('[data-carousel]').count();
    const emblaCarousel = await page.locator('.embla__container').count();
    console.log(`Found ${carouselElements} carousel elements, ${emblaCarousel} embla containers`);

    // Check for images in the carousel
    const carouselImages = await page.locator('img[src*="/images/"]').count();
    console.log(`Found ${carouselImages} images with /images/ src`);

    // Check if images are actually loaded
    const imageElements = page.locator('img');
    const imageCount = await imageElements.count();
    console.log(`Total images on page: ${imageCount}`);

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = imageElements.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);
      
      console.log(`Image ${i + 1}: src="${src}", alt="${alt}", size=${naturalWidth}x${naturalHeight}`);
    }

    // Check for specific animation classes or styles
    const animatedElements = await page.locator('[class*="animate"], [style*="transform"], [style*="opacity"]').count();
    console.log(`Found ${animatedElements} potentially animated elements`);

    // Check for framer-motion specific classes
    const framerClasses = await page.locator('[class*="motion"], [class*="framer"]').count();
    console.log(`Found ${framerClasses} elements with motion/framer classes`);

    // Wait a bit more and take another screenshot to see if anything changed
    console.log('Waiting 2 more seconds to check for animations...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/home-page-after-5s.png', fullPage: true });
    console.log('📸 Screenshot saved: home-page-after-5s.png');

    // Check if the page title is correct
    const title = await page.title();
    console.log(`Page title: "${title}"`);

    // Check for specific content
    const hasNavigation = await page.locator('nav').count() > 0;
    const hasHeader = await page.locator('h1, h2, header').count() > 0;
    const hasFooter = await page.locator('footer').count() > 0;
    
    console.log(`Navigation present: ${hasNavigation}`);
    console.log(`Header content present: ${hasHeader}`);
    console.log(`Footer present: ${hasFooter}`);

    // Check for specific components that should be animated
    const heroSection = page.locator('section, div').filter({ hasText: /tattoo/i }).first();
    if ((await heroSection.count()) > 0) {
      const heroStyles = await heroSection.evaluate(el => getComputedStyle(el).transform);
      console.log(`Hero section transform: ${heroStyles}`);
    }

    // Report summary
    console.log('\n=== DEBUG SUMMARY ===');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    console.log(`Framer Motion Elements: ${motionElements}`);
    console.log(`Carousel Elements: ${carouselElements + emblaCarousel}`);
    console.log(`Images Found: ${imageCount}`);
    console.log(`Animated Elements: ${animatedElements}`);

    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    if (consoleWarnings.length > 0) {
      console.log('\n⚠️ Console Warnings:');
      consoleWarnings.forEach(warning => console.log(`  - ${warning}`));
    }

    if (networkErrors.length > 0) {
      console.log('\n🌐 Network Errors:');
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }

    // Basic assertions to ensure page loaded
    expect(title).toBeTruthy();
    expect(title).not.toBe('');
    
    // Allow the test to pass even with console errors for debugging
    console.log('\n✅ Debug test completed - check console output and screenshots for details');
  });
});