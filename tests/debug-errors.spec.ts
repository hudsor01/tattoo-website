import { test } from '@playwright/test';

// Add type declarations
declare global {
  interface Window {
    next?: {
      router?: unknown;
    };
  }
}

test.describe('JavaScript Error Debug', () => {
  test('Capture JavaScript execution errors', async ({ page }) => {
    console.log('Starting JavaScript error debug...');

    const errors: string[] = [];
    const unhandledPromises: string[] = [];
    const consoleErrors: string[] = [];

    // Capture all types of errors
    page.on('pageerror', (error) => {
      errors.push(`PAGE ERROR: ${error.message}\nStack: ${error.stack}`);
      console.log(`💥 PAGE ERROR: ${error.message}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`🔥 CONSOLE ERROR: ${msg.text()}`);
      }
    });

    // Listen for unhandled promise rejections
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('UNHANDLED PROMISE REJECTION:', event.reason);
      });
    });

    console.log('Navigating to home page...');
    try {
      await page.goto('/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
    } catch (error) {
      console.log(`Navigation error: ${error}`);
    }

    // Wait for potential React hydration
    await page.waitForTimeout(5000);

    // Try to execute React hydration manually if it hasn't happened
    const manualHydrationCheck = await page.evaluate(() => {
      try {
        // Check if React is available but not hydrated
        if (typeof window !== 'undefined') {
          const nextElement = document.getElementById('__next');
          const hasReactRoot = document.querySelector('[data-reactroot]');
          
          return {
            nextElement: nextElement ? 'exists' : 'missing',
            hasReactRoot: hasReactRoot ? 'exists' : 'missing',
            windowReact: typeof window.React,
            windowNext: typeof window.next,
            documentReadyState: document.readyState,
            bodyHTML: document.body ? document.body.innerHTML.substring(0, 500) + '...' : 'no body'
          };
        }
        return { error: 'window undefined' };
      } catch (e) {
        return { error: e.toString() };
      }
    });

    console.log('=== MANUAL HYDRATION CHECK ===');
    Object.entries(manualHydrationCheck).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Check specific Next.js dev issues
    const nextDevCheck = await page.evaluate(() => {
      try {
        // Look for Next.js specific issues
        const scripts = Array.from(document.querySelectorAll('script[src]')) as HTMLScriptElement[];
        const nextScripts = scripts.filter(script => script.src.includes('_next'));
        
        return {
          totalScripts: scripts.length,
          nextScripts: nextScripts.length,
          nextScriptSrcs: nextScripts.map(s => s.src).slice(0, 5), // First 5
          hasWebpackHMR: typeof window.__webpack_require__ !== 'undefined',
          hasNextRouter: typeof window.next !== 'undefined' && window.next.router !== undefined,
          currentURL: window.location.href
        };
      } catch (e) {
        return { error: e.toString() };
      }
    });

    console.log('=== NEXT.JS DEV CHECK ===');
    Object.entries(nextDevCheck).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Summary
    console.log('=== ERROR SUMMARY ===');
    console.log(`Page errors: ${errors.length}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Unhandled promises: ${unhandledPromises.length}`);

    if (errors.length > 0) {
      console.log('\n=== PAGE ERRORS ===');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Final screenshot
    await page.screenshot({ path: 'test-results/error-debug.png', fullPage: true });

    console.log('✅ JavaScript error debug completed');
  });
});