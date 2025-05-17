// @ts-check
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Test report data
const report = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// Helper to add test results to the report
function addTestResult(name, status, details = '') {
  const result = { name, status, details };
  report.tests.push(result);
  report.summary[status === 'passed' ? 'passed' : 'failed']++;
  report.summary.total++;
  return result;
}

// Helper to save screenshots
async function takeScreenshot(page, name) {
  const filename = `${name.replace(/\s/g, '-').toLowerCase()}.png`;
  const filepath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  try {
    // Test 1: Navigate to homepage
    console.log('🔍 Testing homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.title();
    const homeScreenshot = await takeScreenshot(page, 'homepage');
    
    const homeResult = addTestResult(
      'Homepage navigation',
      homeTitle.includes('Tattoo') ? 'passed' : 'failed',
      `Page title: "${homeTitle}", Screenshot: ${homeScreenshot}`
    );
    console.log(`✅ Homepage test ${homeResult.status}`);
    
    // Test 2: Check critical homepage elements
    try {
      await page.waitForSelector('nav', { timeout: 5000 });
      await page.waitForSelector('footer', { timeout: 5000 });
      const ctaButton = await page.$('a[href="/booking"]') || await page.$('a:text("Book")');
      
      addTestResult(
        'Homepage critical elements',
        ctaButton ? 'passed' : 'failed',
        ctaButton ? 'Navigation, footer, and CTA button found' : 'Some critical elements missing'
      );
      console.log('✅ Homepage elements test passed');
    } catch (error) {
      addTestResult('Homepage critical elements', 'failed', `Error: ${error.message}`);
      console.log('❌ Homepage elements test failed');
    }
    
    // Test 3: Navigate to Gallery page
    console.log('🔍 Testing gallery page...');
    try {
      await page.click('a[href="/gallery"]');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('main', { timeout: 5000 });
      
      const galleryScreenshot = await takeScreenshot(page, 'gallery-page');
      const galleryTitle = await page.title();
      
      addTestResult(
        'Gallery page navigation',
        galleryTitle.includes('Gallery') ? 'passed' : 'failed',
        `Page title: "${galleryTitle}", Screenshot: ${galleryScreenshot}`
      );
      console.log('✅ Gallery navigation test passed');
      
      // Check for gallery items
      const galleryItems = await page.$$('.gallery-item, [data-testid="gallery-item"]');
      addTestResult(
        'Gallery content loaded',
        galleryItems.length > 0 ? 'passed' : 'failed',
        `Found ${galleryItems.length} gallery items`
      );
    } catch (error) {
      addTestResult('Gallery page navigation', 'failed', `Error: ${error.message}`);
      console.log('❌ Gallery navigation test failed');
    }
    
    // Test 4: Navigate to About page
    console.log('🔍 Testing about page...');
    try {
      await page.goto('http://localhost:3000/about');
      await page.waitForLoadState('networkidle');
      
      const aboutScreenshot = await takeScreenshot(page, 'about-page');
      const aboutTitle = await page.title();
      
      const aboutHeading = await page.textContent('h1, h2');
      const aboutContent = await page.$('p');
      
      addTestResult(
        'About page navigation',
        aboutTitle.includes('About') ? 'passed' : 'failed',
        `Page title: "${aboutTitle}", Screenshot: ${aboutScreenshot}`
      );
      
      addTestResult(
        'About page content',
        aboutContent ? 'passed' : 'failed',
        aboutContent ? 'About page content found' : 'About page content missing'
      );
      console.log('✅ About page test passed');
    } catch (error) {
      addTestResult('About page tests', 'failed', `Error: ${error.message}`);
      console.log('❌ About page test failed');
    }
    
    // Test 5: Navigate to Contact page
    console.log('🔍 Testing contact page...');
    try {
      await page.goto('http://localhost:3000/contact');
      await page.waitForLoadState('networkidle');
      
      const contactScreenshot = await takeScreenshot(page, 'contact-page');
      const contactTitle = await page.title();
      
      const contactForm = await page.$('form');
      
      addTestResult(
        'Contact page navigation',
        contactTitle.includes('Contact') ? 'passed' : 'failed',
        `Page title: "${contactTitle}", Screenshot: ${contactScreenshot}`
      );
      
      addTestResult(
        'Contact form availability',
        contactForm ? 'passed' : 'failed',
        contactForm ? 'Contact form found' : 'Contact form missing'
      );
      console.log('✅ Contact page test passed');
    } catch (error) {
      addTestResult('Contact page tests', 'failed', `Error: ${error.message}`);
      console.log('❌ Contact page test failed');
    }
    
    // Test 6: Test mobile responsiveness
    console.log('🔍 Testing mobile responsiveness...');
    try {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      const mobileScreenshot = await takeScreenshot(page, 'homepage-mobile');
      const mobileMenu = await page.$('button[aria-label*="menu" i], [aria-label*="navigation" i]');
      
      addTestResult(
        'Mobile responsiveness',
        mobileMenu ? 'passed' : 'failed',
        mobileMenu ? 'Mobile menu found' : 'Mobile menu not found',
        `Screenshot: ${mobileScreenshot}`
      );
      console.log('✅ Mobile responsiveness test passed');
    } catch (error) {
      addTestResult('Mobile responsiveness', 'failed', `Error: ${error.message}`);
      console.log('❌ Mobile responsiveness test failed');
    }

  } catch (error) {
    console.error('❌ Test suite error:', error);
    report.error = error.message;
  } finally {
    // Generate report
    report.summary.passRate = `${Math.round((report.summary.passed / report.summary.total) * 100)}%`;
    
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Pass Rate: ${report.summary.passRate}`);
    console.log(`Report saved to: ${reportPath}`);
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
    await browser.close();
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});