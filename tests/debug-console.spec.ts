import { test } from '@playwright/test';

// Add type declarations
declare global {
  interface Window {
    FramerMotion?: unknown;
  }
}

test.describe('Console and Hydration Debug', () => {
  test('Check for hydration errors and warnings', async ({ page }) => {
    console.log('Starting console and hydration debug...');

    // Capture all console messages
    const consoleMessages: Array<{ type: string; text: string; location?: string }> = [];
    
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url || 'unknown'
      });
      
      // Log hydration-related messages immediately
      if (msg.text().toLowerCase().includes('hydrat') || 
          msg.text().toLowerCase().includes('mismatch') ||
          msg.text().toLowerCase().includes('server') ||
          msg.text().toLowerCase().includes('client')) {
        console.log(`🔍 HYDRATION RELATED: [${msg.type()}] ${msg.text()}`);
      }
      
      // Log framer-motion related messages
      if (msg.text().toLowerCase().includes('motion') || 
          msg.text().toLowerCase().includes('frame') ||
          msg.text().toLowerCase().includes('animation')) {
        console.log(`🎬 ANIMATION RELATED: [${msg.type()}] ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      console.log(`💥 PAGE ERROR: ${error.message}`);
      console.log(`Stack: ${error.stack}`);
    });

    // Navigate to page
    console.log('Navigating to home page...');
    await page.goto('/');

    // Wait for network to be idle and React to potentially hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check React hydration status in more detail
    const detailedReactStatus = await page.evaluate(() => {
      return {
        hasReact: typeof window !== 'undefined' && window.React !== undefined,
        hasReactDOM: typeof window !== 'undefined' && window.ReactDOM !== undefined,
        nextDataExists: document.getElementById('__NEXT_DATA__') !== null,
        nextRootExists: document.getElementById('__next') !== null,
        reactRootExists: document.querySelector('[data-reactroot]') !== null,
        framerMotionExists: typeof window !== 'undefined' && window.FramerMotion !== undefined,
        documentReadyState: document.readyState,
        windowLoaded: window.performance && window.performance.timing.loadEventEnd > 0
      };
    });

    console.log('=== DETAILED REACT STATUS ===');
    Object.entries(detailedReactStatus).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Check for motion elements in DOM
    const motionElementsDetailed = await page.evaluate(() => {
      const motionElements = document.querySelectorAll('[data-framer-motion], [style*="transform"], [class*="motion"]');
      return Array.from(motionElements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        style: el.getAttribute('style'),
        dataFramerMotion: el.getAttribute('data-framer-motion'),
        id: el.id,
        children: el.children.length
      }));
    });

    console.log('=== MOTION ELEMENTS IN DOM ===');
    console.log(`Found ${motionElementsDetailed.length} potential motion elements:`);
    motionElementsDetailed.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName}.${el.className} - style: "${el.style}" - children: ${el.children}`);
    });

    // Check if JavaScript errors prevent motion from working
    const jsErrors = consoleMessages.filter(msg => msg.type === 'error');
    const jsWarnings = consoleMessages.filter(msg => msg.type === 'warning');

    console.log('=== JAVASCRIPT ERRORS ===');
    console.log(`Total errors: ${jsErrors.length}`);
    jsErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.text}`);
    });

    console.log('=== JAVASCRIPT WARNINGS ===');
    console.log(`Total warnings: ${jsWarnings.length}`);
    jsWarnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.text}`);
    });

    // Take a final screenshot
    await page.screenshot({ path: 'test-results/console-debug.png', fullPage: true });

    console.log('✅ Console and hydration debug completed');
  });
});