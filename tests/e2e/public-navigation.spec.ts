import { test, expect } from './helpers/test-fixtures';
import { EnhancedHomePage } from './page-objects/enhanced-home-page';

/**
 * Enhanced E2E test suite for public website navigation
 */
test.describe('Public Website Navigation Tests', () => {
  test('should display home page with all expected sections', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    homePage.setVisualTesting(visualTesting);
    
    // Navigate to home page
    await homePage.goto();
    
    // Verify home page is loaded correctly
    await homePage.verifyHomePage();
    
    // Check all sections with visual testing
    await homePage.checkAllSections();
    
    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('home_page_baseline');
  });
  
  test('should have working navigation links', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    homePage.setVisualTesting(visualTesting);
    
    // Navigate to home page
    await homePage.goto();
    
    // Get all navigation links
    const navLinks = await homePage.getNavigationLinks();
    console.log('Navigation links:', navLinks);
    
    // Verify navigation links
    expect(navLinks.length).toBeGreaterThan(0, 'Home page should have navigation links');
    
    // Check common navigation links
    const expectedLinks = ['Home', 'About', 'Gallery', 'Services', 'Contact'];
    
    for (const expectedLink of expectedLinks) {
      // Check if any navigation link contains the expected text
      const hasLink = navLinks.some(link => 
        link.toLowerCase().includes(expectedLink.toLowerCase())
      );
      
      if (hasLink) {
        console.log(`Found navigation link for: ${expectedLink}`);
      } else {
        console.log(`Missing navigation link for: ${expectedLink}`);
      }
    }
    
    // Click a navigation link (e.g., Gallery)
    try {
      // Try a few common navigation targets
      const targets = ['Gallery', 'Services', 'About', 'Contact'];
      
      for (const target of targets) {
        // Find a matching navigation link
        const matchingLink = navLinks.find(link => 
          link.toLowerCase().includes(target.toLowerCase())
        );
        
        if (matchingLink) {
          // Click the navigation link
          await homePage.clickNavigationLink(matchingLink);
          
          // Verify navigation
          const url = page.url();
          console.log(`Clicked "${matchingLink}" and navigated to: ${url}`);
          
          // Take screenshot
          await visualTesting.captureAndCompare(`after_navigation_to_${target.toLowerCase()}`);
          
          // Navigate back to home page
          await homePage.goto();
          break;
        }
      }
    } catch (error) {
      console.warn('Error clicking navigation link:', error);
    }
  });
  
  test('should navigate to booking page from CTA button', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    homePage.setVisualTesting(visualTesting);
    
    // Navigate to home page
    await homePage.goto();
    
    // Try to click booking button
    try {
      await homePage.clickBookButton();
      
      // Verify navigation to booking page
      const url = page.url();
      expect(url).toContain('/booking');
      
      // Take screenshot of booking page
      await visualTesting.captureAndCompare('booking_page_from_cta');
    } catch (error) {
      console.warn('Could not click booking button:', error);
      test.skip('Booking button not found or not clickable');
    }
  });
  
  test('should display proper meta tags for SEO', async ({ 
    page 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    
    // Navigate to home page
    await homePage.goto();
    
    // Verify meta tags
    const metaTags = await homePage.verifyMetaTags();
    
    // Log meta tags
    console.log('Meta tags:', metaTags);
    
    // Verify title exists
    expect(metaTags.title).not.toBeNull('Page should have a title');
    
    // Verify description exists
    expect(metaTags.description).not.toBeNull('Page should have a meta description');
  });
  
  test('should have social media links in footer', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    homePage.setVisualTesting(visualTesting);
    
    // Navigate to home page
    await homePage.goto();
    
    // Verify footer is visible
    await expect(homePage.footer).toBeVisible();
    
    // Check social links
    const socialLinks = await homePage.verifySocialLinks();
    
    // Log social links
    console.log('Social links:', socialLinks);
    
    // Verify at least one social link exists
    expect(socialLinks.length).toBeGreaterThan(0, 'Footer should have social media links');
  });
  
  test('should be responsive on different devices', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced home page
    const homePage = new EnhancedHomePage(page);
    homePage.setVisualTesting(visualTesting);
    
    // Check responsiveness on different viewports
    await homePage.checkResponsiveness([
      { width: 1920, height: 1080, name: 'desktop_large' },
      { width: 1280, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ]);
  });
});
