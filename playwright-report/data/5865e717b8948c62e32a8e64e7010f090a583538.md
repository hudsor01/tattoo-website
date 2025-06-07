# Test info

- Name: Gallery Page Tests >> Book Now CTA workflow should work
- Location: /Users/richard/Developer/tattoo-website/tests/gallery.spec.ts:139:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveCount(expected)

Locator: locator('text=Error')
Expected: 0
Received: 2
Call log:
  - expect.toHaveCount with timeout 5000ms
  - waiting for locator('text=Error')
    9 × locator resolved to 2 elements
      - unexpected value "2"

    at /Users/richard/Developer/tattoo-website/tests/gallery.spec.ts:150:46
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
- heading "Oops!" [level=1]
- paragraph: We apologize for the inconvenience. An unexpected error has occurred.
- button "Try again"
- link "Go home":
  - /url: /
- group: Error details (development only)
- region "Notifications alt+T"
- button "Open Tanstack query devtools":
  - img
- alert: Book Your Tattoo Appointment | Ink 37 Tattoos | Ink 37 Tattoos
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 3 Issue
- button "Collapse issues badge":
  - img
```

# Test source

```ts
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
   70 |     await page.waitForSelector('video[src*="/videos/"]');
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
> 150 |     await expect(page.locator('text=Error')).toHaveCount(0);
      |                                              ^ Error: Timed out 5000ms waiting for expect(locator).toHaveCount(expected)
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
  171 |     await expect(galleryItems).toHaveCount(16);
  172 |   });
  173 |
  174 |   test('should load gallery without errors in console', async ({ page }) => {
  175 |     const consoleErrors: string[] = [];
  176 |     
  177 |     // Listen for console errors
  178 |     page.on('console', msg => {
  179 |       if (msg.type() === 'error') {
  180 |         consoleErrors.push(msg.text());
  181 |       }
  182 |     });
  183 |     
  184 |     // Reload page to capture any errors
  185 |     await page.reload();
  186 |     await page.waitForLoadState('networkidle');
  187 |     
  188 |     // Filter out known non-critical errors (optional)
  189 |     const criticalErrors = consoleErrors.filter(error => 
  190 |       !error.includes('favicon') && 
  191 |       !error.includes('404') &&
  192 |       !error.includes('DEPRECATED')
  193 |     );
  194 |     
  195 |     // Should have no critical console errors
  196 |     expect(criticalErrors).toHaveLength(0);
  197 |   });
  198 |
  199 |   test('should have proper SEO metadata', async ({ page }) => {
  200 |     // Check page title
  201 |     await expect(page).toHaveTitle(/Gallery.*Ink 37 Tattoos/);
  202 |     
  203 |     // Check meta description
  204 |     const metaDescription = page.locator('meta[name="description"]');
  205 |     await expect(metaDescription).toHaveAttribute('content', /tattoo gallery/i);
  206 |   });
  207 | });
```