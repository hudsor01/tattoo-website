import { test } from '@playwright/test';

test.describe('Animation and Carousel Debug', () => {
  test('Deep dive into framer-motion and carousel behavior', async ({ page }) => {
    console.log('Starting animation and carousel debug...');

    // Track all network requests
    const networkRequests: { url: string; status: number; type: string }[] = [];
    page.on('response', (response) => {
      if (response.url().includes('localhost')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType()
        });
      }
    });

    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for React hydration
    await page.waitForTimeout(2000);

    console.log('=== CHECKING FRAMER-MOTION ELEMENTS ===');
    
    // Check for any motion elements by different selectors
    const motionDivs = await page.locator('div[style*="transform"]').count();
    console.log(`Elements with transform styles: ${motionDivs}`);

    const animatedElements = await page.locator('[data-framer-motion]').count();
    console.log(`Elements with data-framer-motion: ${animatedElements}`);

    // Check for motion components specifically
    const navMotionElements = await page.locator('nav motion-div, nav [style*="transform"]').count();
    console.log(`Motion elements in navigation: ${navMotionElements}`);

    // Check the navigation links specifically
    const navLinks = await page.locator('nav a').count();
    console.log(`Navigation links found: ${navLinks}`);

    for (let i = 0; i < navLinks; i++) {
      const link = page.locator('nav a').nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      const styles = await link.evaluate(el => {
        const computed = getComputedStyle(el);
        const parent = el.parentElement;
        const parentStyles = parent ? getComputedStyle(parent) : null;
        return {
          transform: computed.transform,
          transition: computed.transition,
          parentTransform: parentStyles?.transform ?? 'none'
        };
      });
      console.log(`Nav link ${i + 1}: "${text}" href="${href}"`, styles);
    }

    console.log('=== CHECKING CAROUSEL ELEMENTS ===');

    // Check for the carousel container
    const carouselContainer = page.locator('.overflow-hidden.rounded-xl');
    const carouselCount = await carouselContainer.count();
    console.log(`Carousel containers found: ${carouselCount}`);

    if (carouselCount > 0) {
      // Check images in carousel
      const imagesInCarousel = await carouselContainer.locator('img').count();
      console.log(`Images in carousel container: ${imagesInCarousel}`);

      // Check AnimatePresence content
      const animatePresenceContent = await carouselContainer.locator('> div').count();
      console.log(`Direct children of carousel (AnimatePresence): ${animatePresenceContent}`);

      // Check for motion divs inside carousel
      const motionDivsInCarousel = await carouselContainer.locator('div[style*="opacity"]').count();
      console.log(`Motion divs with opacity in carousel: ${motionDivsInCarousel}`);

      // Check current image that should be visible
      const visibleImage = carouselContainer.locator('img[alt*="Tattoo artwork"]').first();
      if (await visibleImage.count() > 0) {
        const imgSrc = await visibleImage.getAttribute('src');
        const imgAlt = await visibleImage.getAttribute('alt');
        const isVisible = await visibleImage.isVisible();
        console.log(`Current visible image: src="${imgSrc}", alt="${imgAlt}", visible=${isVisible}`);
      }

      // Check carousel controls
      const carouselDots = await carouselContainer.locator('button[aria-label*="Go to slide"]').count();
      const carouselArrows = await carouselContainer.locator('button[aria-label*="Previous"], button[aria-label*="Next"]').count();
      console.log(`Carousel dots: ${carouselDots}, arrows: ${carouselArrows}`);
    }

    console.log('=== CHECKING FRAMER-MOTION INITIALIZATION ===');

    // Check if framer-motion is loaded by looking for its presence
    const framerMotionLoaded = await page.evaluate(() => {
      if (typeof window === 'undefined' || !window.React) return false;
      
      // Check for framer-motion components in React fiber
      const hasFramerMotionId = document.querySelector('[data-framer-motion-id]') !== null;
      const hasTransformStyles = document.querySelector('[style*="transform: translateX"], [style*="transform: translateY"]') !== null;
      
      // Check if motion components have rendered
      const hasMotionElements = Array.from(document.querySelectorAll('*')).some(el => {
        const hasTransform = el.getAttribute('style')?.includes('transform') ?? false;
        const hasFramerMotion = el.getAttribute('data-framer-motion') !== null;
        return hasTransform || hasFramerMotion;
      });
      
      return hasFramerMotionId || hasTransformStyles || hasMotionElements;
    });
    console.log(`Framer Motion appears to be loaded: ${framerMotionLoaded}`);

    // Check React hydration state
    const reactHydrated = await page.evaluate(() => {
      if (typeof window === 'undefined' || !window.React) return false;
      
      const hasReactRoot = document.querySelector('[data-reactroot]') !== null;
      const hasNextRoot = document.getElementById('__next') !== null;
      
      return hasReactRoot || hasNextRoot;
    });
    console.log(`React appears to be hydrated: ${reactHydrated}`);

    console.log('=== TESTING HOVER INTERACTIONS ===');

    // Test navigation hover
    const firstNavLink = page.locator('nav a').first();
    if (await firstNavLink.count() > 0) {
      const beforeHover = await firstNavLink.evaluate(el => getComputedStyle(el).transform);
      await firstNavLink.hover();
      await page.waitForTimeout(500); // Wait for animation
      const afterHover = await firstNavLink.evaluate(el => getComputedStyle(el).transform);
      console.log(`Nav hover transform - Before: "${beforeHover}", After: "${afterHover}"`);
    }

    // Test CTA button hover
    const ctaButton = page.locator('a[href="/gallery"]').first();
    if (await ctaButton.count() > 0) {
      const beforeHover = await ctaButton.evaluate(el => getComputedStyle(el).transform);
      await ctaButton.hover();
      await page.waitForTimeout(500);
      const afterHover = await ctaButton.evaluate(el => getComputedStyle(el).transform);
      console.log(`CTA hover transform - Before: "${beforeHover}", After: "${afterHover}"`);
    }

    console.log('=== TESTING CAROUSEL FUNCTIONALITY ===');

    // Test carousel dots if they exist
    const carouselDots = page.locator('button[aria-label*="Go to slide"]');
    const dotCount = await carouselDots.count();
    console.log(`Testing ${dotCount} carousel dots...`);

    if (dotCount > 1) {
      // Click second dot and check for image change
      const secondDot = carouselDots.nth(1);
      await secondDot.click();
      await page.waitForTimeout(3000); // Wait for transition
      
      const newImageAfterClick = await page.locator('img[alt*="Tattoo artwork"]').first().getAttribute('src');
      console.log(`Image after clicking second dot: ${newImageAfterClick}`);
    }

    // Take screenshots after interactions
    await page.screenshot({ path: 'test-results/after-interactions.png', fullPage: true });

    console.log('=== NETWORK REQUESTS SUMMARY ===');
    const imageRequests = networkRequests.filter(req => req.type === 'image');
    console.log(`Image requests: ${imageRequests.length}`);
    imageRequests.forEach(req => {
      console.log(`  ${req.status} - ${req.url}`);
    });

    const scriptRequests = networkRequests.filter(req => req.type === 'script');
    console.log(`Script requests: ${scriptRequests.length}`);
    
    console.log('✅ Animation and carousel debug completed');
  });
});