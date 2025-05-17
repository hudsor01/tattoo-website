import { test, expect } from '@playwright/test'

test.describe('FAQ Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq')
  })

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Frequently Asked Questions')
    await expect(page.locator('text=Find answers to common questions')).toBeVisible()
    
    // Check hero icon
    await expect(page.locator('svg.h-16.w-16')).toBeVisible()
  })

  test('should display quick stats', async ({ page }) => {
    const stats = [
      'Questions Answered',
      'Happy Clients',
      'Response Time',
      'Satisfaction Rate'
    ]
    
    for (const stat of stats) {
      await expect(page.locator(`text=${stat}`)).toBeVisible()
    }
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search for answers..."]')
    await expect(searchInput).toBeVisible()
    
    // Type in search
    await searchInput.fill('tattoo')
    
    // Check that results update
    await expect(page.locator('text=Found')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    // Check category buttons
    const categories = ['All Questions', 'General', 'Pricing', 'Process', 'Aftercare', 'Health & Safety']
    
    for (const category of categories) {
      await expect(page.locator(`button:has-text("${category}")`)).toBeVisible()
    }
    
    // Click on Pricing category
    await page.click('button:has-text("Pricing")')
    
    // Verify filter is applied
    await expect(page.locator('button:has-text("Pricing")')).toHaveClass(/bg-gradient-to-r/)
  })

  test('should display popular questions', async ({ page }) => {
    await expect(page.locator('text=Popular Questions')).toBeVisible()
    
    // Check for star badges
    const starBadges = page.locator('svg.text-yellow-400')
    await expect(starBadges.first()).toBeVisible()
  })

  test('should expand accordion items', async ({ page }) => {
    // Find first accordion item
    const firstQuestion = page.locator('[role="button"]').first()
    await firstQuestion.click()
    
    // Check that content is visible
    const content = page.locator('[role="region"]').first()
    await expect(content).toBeVisible()
  })

  test('should collapse accordion items', async ({ page }) => {
    // Open first item
    const firstQuestion = page.locator('[role="button"]').first()
    await firstQuestion.click()
    
    // Verify it's open
    const content = page.locator('[role="region"]').first()
    await expect(content).toBeVisible()
    
    // Click again to close
    await firstQuestion.click()
    
    // Verify it's closed
    await expect(content).not.toBeVisible()
  })

  test('should handle search with no results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search for answers..."]')
    await searchInput.fill('xyzabc123')
    
    // Check for no results message
    await expect(page.locator('text=No questions found')).toBeVisible()
    await expect(page.locator('button:has-text("Clear Search")')).toBeVisible()
  })

  test('should clear search', async ({ page }) => {
    // Search for something
    const searchInput = page.locator('input[placeholder="Search for answers..."]')
    await searchInput.fill('test')
    
    // Clear search
    await page.click('button:has-text("Clear Search")')
    
    // Verify search is cleared
    const inputValue = await searchInput.inputValue()
    expect(inputValue).toBe('')
  })

  test('should display category sections', async ({ page }) => {
    // Check that category sections exist
    const categorySections = [
      'General',
      'Pricing',
      'Process',
      'Aftercare',
      'Health & Safety'
    ]
    
    for (const section of categorySections) {
      await expect(page.locator(`h2:has-text("${section}")`)).toBeVisible()
    }
  })

  test('should display contact section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    await expect(page.locator('text=Still Have Questions?')).toBeVisible()
    
    // Check contact cards
    await expect(page.locator('text=Call Us')).toBeVisible()
    await expect(page.locator('text=Email Us')).toBeVisible()
    await expect(page.locator('text=Visit Us')).toBeVisible()
  })

  test('should have Ask a Question button', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    const askButton = page.locator('button:has-text("Ask a Question")')
    await expect(askButton).toBeVisible()
    
    // Click button (would open contact form in real app)
    await askButton.click()
  })

  test('should handle combined search and filter', async ({ page }) => {
    // Select a category
    await page.click('button:has-text("Pricing")')
    
    // Then search within that category
    const searchInput = page.locator('input[placeholder="Search for answers..."]')
    await searchInput.fill('deposit')
    
    // Check that both filters are applied
    await expect(page.locator('text=Found')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that stats grid adjusts
    await expect(page.locator('.grid-cols-2')).toBeVisible()
    
    // Check that category buttons wrap
    await expect(page.locator('.flex-wrap')).toBeVisible()
  })

  test('should maintain scroll position on accordion toggle', async ({ page }) => {
    // Scroll to middle of page
    await page.evaluate(() => window.scrollTo(0, 500))
    const initialScroll = await page.evaluate(() => window.scrollY)
    
    // Toggle an accordion item
    const question = page.locator('[role="button"]').nth(2)
    await question.click()
    
    // Check scroll position hasn't jumped
    const afterScroll = await page.evaluate(() => window.scrollY)
    expect(Math.abs(afterScroll - initialScroll)).toBeLessThan(100)
  })

  test('should show category icons', async ({ page }) => {
    // Check that category buttons have icons
    const categoryButtons = page.locator('button').filter({ hasText: /General|Pricing|Process/ })
    
    for (const button of await categoryButtons.all()) {
      const icon = await button.locator('svg').count()
      expect(icon).toBeGreaterThan(0)
    }
  })
})