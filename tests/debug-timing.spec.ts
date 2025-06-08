import { test } from '@playwright/test';

// Add type declarations for webpack
declare global {
  interface Window {
    __webpack_require__?: {
      cache?: Record<string, unknown>;
    };
  }
}

test.describe('Hydration Timing Debug', () => {
  test('Wait for React hydration with extended timing', async ({ page }) => {
    console.log('Starting hydration timing debug...');

    // Navigate to page
    console.log('Navigating to home page...');
    await page.goto('/');

    // Check React status at different time intervals
    const checkTimes = [1000, 3000, 5000, 10000, 15000];
    
    for (const waitTime of checkTimes) {
      await page.waitForTimeout(waitTime);
      
      const reactStatus = await page.evaluate(() => {
        return {
          timestamp: Date.now(),
          hasReact: typeof window !== 'undefined' && window.React !== undefined,
          hasReactDOM: typeof window !== 'undefined' && window.ReactDOM !== undefined,
          documentReady: document.readyState,
          visibilityState: document.visibilityState,
          // Check for motion components specifically
          motionElements: document.querySelectorAll('[data-framer-motion]').length,
          transformElements: document.querySelectorAll('[style*="transform"]').length,
          // Check for Next.js hydration indicators
          nextScripts: document.querySelectorAll('script[src*="_next"]').length,
          bodyChildren: document.body ? document.body.children.length : 0,
        };
      });

      console.log(`=== STATUS AT ${waitTime}ms ===`);
      Object.entries(reactStatus).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });

      // If React is detected, try to interact with motion elements
      if (reactStatus.hasReact) {
        console.log('🎉 React detected! Testing interactions...');
        
        // Try hover on navigation
        const navLink = page.locator('nav a').first();
        if (await navLink.count() > 0) {
          await navLink.hover();
          await page.waitForTimeout(1000);
          
          const hoverResult = await navLink.evaluate(el => ({
            transform: getComputedStyle(el).transform,
            transition: getComputedStyle(el).transition
          }));
          
          console.log('Nav hover result:', hoverResult);
        }
        
        break; // Exit loop if React is found
      }
    }

    // Try direct frame-motion detection
    const framerMotionDetection = await page.evaluate(() => {
      // Look for framer-motion in webpack modules
      if (typeof window !== 'undefined' && window.__webpack_require__) {
        try {
          // Check if framer-motion is in the module cache
          const webpackRequire = window.__webpack_require__;
          const moduleCache = webpackRequire.cache ?? {};
          
          let framerModules = 0;
          let motionModules = 0;
          
          Object.keys(moduleCache).forEach(moduleId => {
            const moduleString = moduleId.toString();
            if (moduleString.includes('framer')) framerModules++;
            if (moduleString.includes('motion')) motionModules++;
          });
          
          return {
            webpackExists: true,
            totalModules: Object.keys(moduleCache).length,
            framerModules,
            motionModules,
            cacheKeys: Object.keys(moduleCache).slice(0, 10) // First 10 for debugging
          };
        } catch (e) {
          return { error: e.toString() };
        }
      }
      
      return { webpackExists: false };
    });

    console.log('=== FRAMER-MOTION DETECTION ===');
    Object.entries(framerMotionDetection).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Check if there are any unexecuted inline scripts
    const inlineScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script:not([src])'));
      return scripts.map(script => ({
        content: script.textContent?.substring(0, 100) + '...',
        executed: script.getAttribute('data-executed') !== null
      }));
    });

    console.log('=== INLINE SCRIPTS ===');
    console.log(`Found ${inlineScripts.length} inline scripts`);
    inlineScripts.forEach((script, index) => {
      console.log(`${index + 1}. Executed: ${script.executed}, Content: ${script.content}`);
    });

    // Take final screenshot
    await page.screenshot({ path: 'test-results/timing-debug.png', fullPage: true });

    console.log('✅ Hydration timing debug completed');
  });
});