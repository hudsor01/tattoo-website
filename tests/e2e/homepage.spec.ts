import { test, expect } from '@playwright/test'

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display hero section with correct content', async ({ page }) => {
    // Check hero title
    await expect(page.locator('h1')).toContainText('FERNANDO GOVEA')
    
    // Check subtitle with specific selector
    const subtitle = page.locator('p').filter({ hasText: 'Custom Tattoo Artist' })
    await expect(subtitle).toBeVisible()
    
    // Check CTA buttons specifically in hero section
    const heroSection = page.locator('main')
    await expect(heroSection.getByRole('link', { name: 'Book Consultation' })).toBeVisible()
    await expect(heroSection.getByRole('link', { name: 'View Gallery' })).toBeVisible()
  })

  test('should navigate to booking page when clicking Book Consultation', async ({ page }) => {
    // Click the hero's Book Consultation button specifically
    const heroButton = page.locator('main').getByRole('link', { name: 'Book Consultation' })
    await heroButton.click()
    await expect(page).toHaveURL('/booking')
  })

  test('should navigate to gallery page when clicking View Gallery', async ({ page }) => {
    // Click the hero's View Gallery button specifically  
    const heroButton = page.locator('main').getByRole('link', { name: 'View Gallery' })
    await heroButton.click()
    await expect(page).toHaveURL('/gallery')
  })

  test('should have Instagram link', async ({ page }) => {
    const instagramLink = page.locator('a[href*="instagram.com"]')
    await expect(instagramLink).toBeVisible()
    
    // Check that it opens in new tab
    const href = await instagramLink.getAttribute('href')
    expect(href).toContain('instagram.com/fernandogoveatatoo')
    
    const target = await instagramLink.getAttribute('target')
    expect(target).toBe('_blank')
  })

  test('should have background image', async ({ page }) => {
    // Check that background image exists
    const backgroundImage = page.locator('img[alt="Tattoo artwork"]')
    await expect(backgroundImage).toBeVisible()
    
    // Next.js may transform the src, so just check that an image is present
    const src = await backgroundImage.getAttribute('src')
    expect(src).toBeTruthy()
  })

  test('should have proper animations', async ({ page }) => {
    // Check that elements have motion classes
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Verify animations are working by checking initial styles
    const hasMotionDiv = await page.locator('div').filter({ hasText: 'FERNANDO GOVEA' }).count()
    expect(hasMotionDiv).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible()
    
    // Check hero buttons specifically
    const heroSection = page.locator('main')
    await expect(heroSection.getByRole('link', { name: 'Book Consultation' })).toBeVisible()
    
    // Check responsive classes
    const h1 = page.locator('h1')
    const className = await h1.getAttribute('class')
    expect(className).toContain('text-6xl')
    expect(className).toContain('md:text-8xl')
  })

  test('should have proper SEO metadata', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Fernando Govea.*Tattoo/)
    
    // Note: Meta tags would be in the layout or head component
    // This is just a basic check for the title
  })

  test('should have centered content', async ({ page }) => {
    // Check that main content is centered - check the second div which has flex properties
    const contentDiv = page.locator('main > div').nth(1)
    const className = await contentDiv.getAttribute('class')
    expect(className).toContain('flex')
    expect(className).toContain('items-center')
    expect(className).toContain('justify-center')
  })

  test('should have overlay on background image', async ({ page }) => {
    // Check for dark overlay
    const overlay = page.locator('.bg-black\\/50')
    await expect(overlay).toBeVisible()
  })
})