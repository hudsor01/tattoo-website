import { test } from '@playwright/test';

interface NextWindow extends Window {
  __NEXT_DATA__?: object;
  React?: object;
  __webpack_require__?: object;
}

test.describe('Network and Script Loading Debug', () => {
  test('Check script loading and network requests', async ({ page }) => {
    console.log('Starting network and script debug...');

    // Track all network requests
    const requests: Array<{ url: string; status: number; type: string; size: number }> = [];
    
    page.on('response', async (response) => {
      try {
        const body = await response.body();
        requests.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType(),
          size: body.length
        });
      } catch {
        requests.push({
          url: response.url(),
          status: response.status(),
          type: response.request().resourceType(),
          size: 0
        });
      }
    });

    // Navigate to page
    console.log('Navigating to home page...');
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.waitForTimeout(2000);

    // Analyze script requests
    const scriptRequests = requests.filter(req => req.type === 'script');
    console.log('=== SCRIPT REQUESTS ===');
    console.log(`Total scripts loaded: ${scriptRequests.length}`);
    scriptRequests.forEach((req, index) => {
      const name = req.url.split('/').pop() ?? req.url;
      console.log(`${index + 1}. ${req.status} - ${name} (${(req.size / 1024).toFixed(1)}KB)`);
    });

    // Check for React-related scripts
    const reactScripts = scriptRequests.filter(req => 
      req.url.includes('react') || 
      req.url.includes('next') || 
      req.url.includes('chunk') ||
      req.url.includes('webpack')
    );
    console.log('=== REACT/NEXT.JS SCRIPTS ===');
    console.log(`React-related scripts: ${reactScripts.length}`);
    reactScripts.forEach((req, index) => {
      const name = req.url.split('/').pop() ?? req.url;
      console.log(`${index + 1}. ${req.status} - ${name} (${(req.size / 1024).toFixed(1)}KB)`);
    });

    // Check for framer-motion in scripts
    const motionScripts = scriptRequests.filter(req => 
      req.url.includes('motion') || 
      req.url.includes('framer')
    );
    console.log('=== FRAMER-MOTION SCRIPTS ===');
    console.log(`Motion-related scripts: ${motionScripts.length}`);
    motionScripts.forEach((req, index) => {
      const name = req.url.split('/').pop() ?? req.url;
      console.log(`${index + 1}. ${req.status} - ${name} (${(req.size / 1024).toFixed(1)}KB)`);
    });

    // Check HTML content for script tags
    const htmlContent = await page.content();
    const scriptTags = htmlContent.match(/<script[^>]*>/g) ?? [];
    console.log('=== HTML SCRIPT TAGS ===');
    console.log(`Script tags in HTML: ${scriptTags.length}`);
    scriptTags.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag}`);
    });

    // Check if __NEXT_DATA__ exists in HTML
    const nextDataExists = htmlContent.includes('__NEXT_DATA__');
    console.log(`__NEXT_DATA__ in HTML: ${nextDataExists}`);

    // Check for any failed requests
    const failedRequests = requests.filter(req => req.status >= 400);
    console.log('=== FAILED REQUESTS ===');
    console.log(`Failed requests: ${failedRequests.length}`);
    failedRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.status} - ${req.url}`);
    });

    // Check window object after scripts load
    const windowStatus = await page.evaluate(() => {
      const nextWindow = window as NextWindow;
      return {
        hasNext: typeof window !== 'undefined' && typeof nextWindow.__NEXT_DATA__ !== 'undefined',
        hasReact: typeof window !== 'undefined' && nextWindow.React !== undefined,
        hasWebpack: typeof window !== 'undefined' && nextWindow.__webpack_require__ !== undefined,
        location: window.location.href,
        userAgent: navigator.userAgent,
        errors: window.onerror ? 'Error handler exists' : 'No error handler'
      };
    });

    console.log('=== WINDOW STATUS ===');
    Object.entries(windowStatus).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });

    // Check if CSS is loading
    const cssRequests = requests.filter(req => req.type === 'stylesheet');
    console.log('=== CSS REQUESTS ===');
    console.log(`CSS files loaded: ${cssRequests.length}`);
    cssRequests.forEach((req, index) => {
      const name = req.url.split('/').pop() ?? req.url;
      console.log(`${index + 1}. ${req.status} - ${name} (${(req.size / 1024).toFixed(1)}KB)`);
    });

    // Take screenshot
    await page.screenshot({ path: 'test-results/network-debug.png', fullPage: true });

    console.log('✅ Network and script debug completed');
  });
});