# Test info

- Name: Gallery Page Tests >> should verify all expected videos are present
- Location: /Users/richard/Developer/tattoo-website/tests/gallery.spec.ts:68:7

# Error details

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('video[src*="/videos/"]') to be visible
    - waiting for" http://localhost:3001/gallery" navigation to finish...
    - navigated to "http://localhost:3001/gallery"

    at /Users/richard/Developer/tattoo-website/tests/gallery.spec.ts:70:16
```

# Page snapshot

```yaml
- banner:
  - link "Logo":
    - /url: /
    - img "Logo"
  - navigation:
    - link "About":
      - /url: /about
    - link "Gallery":
      - /url: /gallery
    - link "Services":
      - /url: /services
    - link "Contact":
      - /url: /contact
  - link "Book Now":
    - /url: /booking
- heading "Tattoo Gallery" [level=1]
- paragraph: Browse our collection of custom tattoo designs showcasing a diverse range of styles. From traditional to Japanese, portraits to custom pieces - each design reflects our commitment to quality, creativity, and personal expression.
- tablist:
  - tab "Images (9)" [selected]
  - tab "Videos (7)"
- tabpanel "Images (9)":
  - 'img "Tattoo design: Christ Crosses - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Cover Ups - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Custom Designs - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Dragonballz Left Arm - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Japanese - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Leg Piece - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Praying Nun Left Arm - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Realism - Professional tattoo art by Fernando Govea"'
  - 'img "Tattoo design: Traditional - Professional tattoo art by Fernando Govea"'
- heading "Love What You See?" [level=3]
- paragraph: Let's create your custom tattoo. Book a free consultation to discuss your ideas.
- button "Book Now"
- text: 500+ 500+ Happy Clients 5.0 5-Star Reviews Fast Same Week Availability
- contentinfo:
  - link "Gallery":
    - /url: /gallery
  - link "About":
    - /url: /about
  - link "Contact":
    - /url: /contact
  - link "Book Consultation":
    - /url: /booking
  - text: © 2025 Ink 37. All rights reserved. • Dallas-Fort Worth, Texas • By appointment only
- region "Notifications alt+T"
- button "Open Tanstack query devtools":
  - img
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Gallery Page Tests', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     await page.goto('/gallery');
   6 |   });
   7 |
   8 |   test('should load gallery page with all content', async ({ page }) => {
   9 |     // Wait for page to load
   10 |     await expect(page.locator('h1')).toContainText('Tattoo Gallery');
   11 |     
   12 |     // Check that hero section is present
   13 |     await expect(page.locator('h1')).toHaveText('Tattoo Gallery');
   14 |     await expect(page.locator('p')).toContainText('Browse our collection of custom tattoo designs');
   15 |   });
   16 |
   17 |   test('should display all gallery items without filtering system', async ({ page }) => {
   18 |     // Wait for gallery grid to load
   19 |     await page.waitForSelector('[class*="grid"]');
   20 |     
   21 |     // Should NOT have any filter elements (RED circles - removed)
   22 |     await expect(page.locator('text=Filter Gallery')).toHaveCount(0);
   23 |     await expect(page.locator('input[placeholder*="Search"]')).toHaveCount(0);
   24 |     await expect(page.locator('button:has-text("All Styles")')).toHaveCount(0);
   25 |     await expect(page.locator('button:has-text("Traditional")')).toHaveCount(0);
   26 |     await expect(page.locator('button:has-text("Realism")')).toHaveCount(0);
   27 |     await expect(page.locator('button:has-text("Japanese")')).toHaveCount(0);
   28 |     await expect(page.locator('[role="tablist"]')).toHaveCount(0);
   29 |     
   30 |     // Should display all gallery items (16 total: 9 images + 7 videos)
   31 |     const galleryItems = page.locator('[class*="grid"] > div');
   32 |     await expect(galleryItems).toHaveCount(16);
   33 |     
   34 |     // Check that both images and videos are present
   35 |     const images = page.locator('img[src*="/images/"]');
   36 |     await expect(images).toHaveCount(9);
   37 |     
   38 |     const videos = page.locator('video[src*="/videos/"]');
   39 |     await expect(videos).toHaveCount(7);
   40 |     
   41 |     // Should NOT have "No Designs Found" message
   42 |     await expect(page.locator('text=No Designs Found')).toHaveCount(0);
   43 |     await expect(page.locator('text=Try adjusting your search criteria')).toHaveCount(0);
   44 |   });
   45 |
   46 |   test('should verify all expected images are present', async ({ page }) => {
   47 |     // Wait for images to load
   48 |     await page.waitForSelector('img[src*="/images/"]');
   49 |     
   50 |     // Check all expected image files are present
   51 |     const expectedImages = [
   52 |       '/images/japanese.jpg',
   53 |       '/images/traditional.jpg', 
   54 |       '/images/realism.jpg',
   55 |       '/images/cover-ups.jpg',
   56 |       '/images/custom-designs.jpg',
   57 |       '/images/christ-crosses.jpg',
   58 |       '/images/dragonballz-left-arm.jpg',
   59 |       '/images/leg-piece.jpg',
   60 |       '/images/praying-nun-left-arm.jpg'
   61 |     ];
   62 |     
   63 |     for (const imageSrc of expectedImages) {
   64 |       await expect(page.locator(`img[src="${imageSrc}"]`)).toBeVisible();
   65 |     }
   66 |   });
   67 |
   68 |   test('should verify all expected videos are present', async ({ page }) => {
   69 |     // Wait for videos to load
>  70 |     await page.waitForSelector('video[src*="/videos/"]');
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
   71 |     
   72 |     // Check all expected video files are present
   73 |     const expectedVideos = [
   74 |       '/videos/christ-crosses-left-arm-sleeve.mov',
   75 |       '/videos/christ-crosses-right-arm.mov',
   76 |       '/videos/clock-lion-left-arm.mov',
   77 |       '/videos/clock-roses.mov',
   78 |       '/videos/dragonballz-left-arm.mov',
   79 |       '/videos/praying-hands-left-arm.mov',
   80 |       '/videos/praying-nun.mov'
   81 |     ];
   82 |     
   83 |     for (const videoSrc of expectedVideos) {
   84 |       await expect(page.locator(`video[src="${videoSrc}"]`)).toBeVisible();
   85 |     }
   86 |   });
   87 |
   88 |   test('should have centered navigation links in navbar', async ({ page }) => {
   89 |     // Check that navigation is using centered layout
   90 |     const nav = page.locator('nav[class*="flex-1"]');
   91 |     await expect(nav).toBeVisible();
   92 |     
   93 |     // Verify navigation links are present and visible
   94 |     const navLinks = ['Home', 'Services', 'Gallery', 'About', 'Contact', 'Book Now'];
   95 |     for (const linkText of navLinks) {
   96 |       await expect(page.locator(`nav a:has-text("${linkText}")`, )).toBeVisible();
   97 |     }
   98 |     
   99 |     // Check that navigation has proper flex centering classes
  100 |     await expect(nav).toHaveClass(/justify-center/);
  101 |     await expect(nav).toHaveClass(/flex-1/);
  102 |   });
  103 |
  104 |   test('should use logo image instead of text', async ({ page }) => {
  105 |     // Should have logo image (BLUE circle - enhancement)
  106 |     const logoImage = page.locator('img[src="/logo.png"]');
  107 |     await expect(logoImage).toBeVisible();
  108 |     await expect(logoImage).toHaveAttribute('alt', 'Logo');
  109 |     
  110 |     // Should NOT have text logo "Ink 37 Tattoos" (RED circle - removed)
  111 |     await expect(page.locator('text=Ink 37 Tattoos')).toHaveCount(0);
  112 |   });
  113 |
  114 |   test('should have interactive gallery items with hover effects', async ({ page }) => {
  115 |     // Wait for gallery to load
  116 |     await page.waitForSelector('[class*="grid"] > div');
  117 |     
  118 |     // Test first gallery item hover
  119 |     const firstItem = page.locator('[class*="grid"] > div').first();
  120 |     await expect(firstItem).toBeVisible();
  121 |     
  122 |     // Hover over first item to check hover effects
  123 |     await firstItem.hover();
  124 |     
  125 |     // Should be able to click on gallery items (not filtering them)
  126 |     await expect(firstItem).toBeVisible();
  127 |   });
  128 |
  129 |   test('should have proper video controls', async ({ page }) => {
  130 |     // Wait for videos to load
  131 |     await page.waitForSelector('video');
  132 |     
  133 |     // Check that videos have controls
  134 |     const firstVideo = page.locator('video').first();
  135 |     await expect(firstVideo).toHaveAttribute('controls');
  136 |     await expect(firstVideo).toHaveAttribute('preload', 'metadata');
  137 |   });
  138 |
  139 |   test('Book Now CTA workflow should work', async ({ page }) => {
  140 |     // Click Book Now button in navigation
  141 |     await page.click('a:has-text("Book Now")');
  142 |     
  143 |     // Should navigate to booking page
  144 |     await expect(page).toHaveURL('/booking');
  145 |     
  146 |     // Verify booking page loads (basic check)
  147 |     await page.waitForLoadState('networkidle');
  148 |     
  149 |     // Should not show error page
  150 |     await expect(page.locator('text=Error')).toHaveCount(0);
  151 |     await expect(page.locator('text=404')).toHaveCount(0);
  152 |   });
  153 |
  154 |   test('should have responsive gallery grid', async ({ page }) => {
  155 |     // Test desktop view
  156 |     await page.setViewportSize({ width: 1200, height: 800 });
  157 |     await page.waitForSelector('[class*="grid"]');
  158 |     
  159 |     const galleryGrid = page.locator('[class*="grid"]').first();
  160 |     await expect(galleryGrid).toBeVisible();
  161 |     
  162 |     // Test mobile view
  163 |     await page.setViewportSize({ width: 375, height: 667 });
  164 |     await page.waitForSelector('[class*="grid"]');
  165 |     
  166 |     // Gallery should still be visible and usable on mobile
  167 |     await expect(galleryGrid).toBeVisible();
  168 |     
  169 |     // All items should still be present
  170 |     const galleryItems = page.locator('[class*="grid"] > div');
```