import { test, expect } from '@playwright/test'

test.describe('About Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('should display hero section with gradient text', async ({ page }) => {
    await expect(page.locator('h1 span')).toHaveClass(/text-transparent bg-clip-text/)
    await expect(page.locator('h1')).toContainText('About')
  })

  test('should display artist profile section', async ({ page }) => {
    // Check for avatar image
    await expect(page.locator('img[alt*="Fernando"]')).toBeVisible()
    
    // Check for badges
    await expect(page.locator('text=15+ Years Experience')).toBeVisible()
    await expect(page.locator('text=5000+ Happy Clients')).toBeVisible()
    await expect(page.locator('text=Award Winning')).toBeVisible()
  })

  test('should display skills progress bars', async ({ page }) => {
    const skills = [
      'Traditional Tattoos',
      'Realism',
      'Japanese Style',
      'Black & Grey'
    ]
    
    for (const skill of skills) {
      await expect(page.locator(`text=${skill}`)).toBeVisible()
    }
    
    // Check progress bars exist
    const progressBars = page.locator('[role="progressbar"]')
    await expect(progressBars).toHaveCount(4)
  })

  test('should display philosophy cards', async ({ page }) => {
    const philosophyCards = page.locator('.group').filter({ hasText: /Quality|Personal|Aftercare/i })
    await expect(philosophyCards).toHaveCount(3)
    
    // Test hover effects
    await philosophyCards.first().hover()
    await expect(philosophyCards.first()).toHaveClass(/hover:scale-105/)
  })

  test('should display timeline section', async ({ page }) => {
    await expect(page.locator('text=My Journey')).toBeVisible()
    
    // Check timeline items
    const timelineItems = page.locator('[data-testid="timeline-item"]')
    await expect(timelineItems).toBeTruthy()
  })

  test('should display featured work carousel', async ({ page }) => {
    await expect(page.locator('text=Featured Work')).toBeVisible()
    
    // Check carousel navigation
    const prevButton = page.locator('button:has-text("Previous")')
    const nextButton = page.locator('button:has-text("Next")')
    
    await expect(prevButton).toBeVisible()
    await expect(nextButton).toBeVisible()
    
    // Test carousel navigation
    await nextButton.click()
    await page.waitForTimeout(500) // Wait for animation
  })

  test('should have CTA section', async ({ page }) => {
    await expect(page.locator('text=Ready to Start Your Tattoo Journey?')).toBeVisible()
    await expect(page.locator('text=Book Consultation')).toBeVisible()
    await expect(page.locator('text=View Portfolio')).toBeVisible()
  })

  test('should have proper animations on scroll', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check that elements are visible after scroll
    await expect(page.locator('text=Ready to Start Your Tattoo Journey?')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that layout adjusts for mobile
    await expect(page.locator('.grid-cols-1')).toBeVisible()
    
    // Check that text is properly sized
    const heroTitle = page.locator('h1')
    await expect(heroTitle).toHaveCSS('font-size', /3xl|4xl/)
  })
})