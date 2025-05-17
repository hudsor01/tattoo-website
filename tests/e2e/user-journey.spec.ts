import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete a full booking flow', async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    
    // Check homepage loads
    await expect(page.locator('h1')).toContainText('Fernando Govea')
    
    // Navigate to gallery
    await page.click('text=View Gallery')
    await expect(page).toHaveURL('/gallery')
    
    // Browse gallery and filter
    await page.click('text=Japanese')
    await expect(page.locator('button:has-text("Japanese")')).toHaveClass(/bg-gradient-to-r/)
    
    // Click on a tattoo design
    await page.locator('.grid > div').first().click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Close modal
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // Navigate to services
    await page.click('nav >> text=Services')
    await expect(page).toHaveURL('/services')
    
    // Check service pricing
    await expect(page.locator('text=Custom Tattoo Design')).toBeVisible()
    await expect(page.locator('text=$150/hour')).toBeVisible()
    
    // Navigate to FAQ
    await page.click('nav >> text=FAQ')
    await expect(page).toHaveURL('/faq')
    
    // Search FAQ
    await page.fill('input[placeholder="Search for answers..."]', 'deposit')
    await expect(page.locator('text=Found')).toBeVisible()
    
    // Clear search
    await page.fill('input[placeholder="Search for answers..."]', '')
    
    // Navigate to booking
    await page.click('nav >> text=Book')
    await expect(page).toHaveURL('/booking')
    
    // Fill booking form - Personal Information
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="phone"]', '555-0123')
    
    // Continue to preferences
    await page.click('button:has-text("Next")')
    
    // Select tattoo preferences
    await page.click('text=Japanese')
    await page.click('text=Medium')
    await page.fill('input[name="placement"]', 'Upper Arm')
    
    // Continue to appointment
    await page.click('button:has-text("Next")')
    
    // Select appointment details
    await page.fill('input[type="date"]', '2024-12-25')
    await page.selectOption('select[name="time"]', '14:00')
    
    // Submit booking
    await page.click('button:has-text("Submit Booking")')
    
    // Wait for confirmation
    await page.waitForURL('**/booking/confirmation')
    await expect(page.locator('text=Booking Confirmed')).toBeVisible()
  })

  test('should handle contact form submission', async ({ page }) => {
    // Go to contact page
    await page.goto('/contact')
    
    // Fill contact form
    await page.fill('input[name="name"]', 'John Contact')
    await page.fill('input[name="email"]', 'john@contact.com')
    await page.fill('textarea[name="message"]', 'I would like to inquire about custom designs.')
    
    // Submit form
    await page.click('button:has-text("Send Message")')
    
    // Check for success message
    await expect(page.locator('text=/Thank you|Message sent/i')).toBeVisible()
  })

  test('should navigate between all pages', async ({ page }) => {
    const pages = [
      { name: 'About', url: '/about' },
      { name: 'Services', url: '/services' },
      { name: 'Gallery', url: '/gallery' },
      { name: 'FAQ', url: '/faq' },
      { name: 'Contact', url: '/contact' }
    ]
    
    await page.goto('/')
    
    for (const pageInfo of pages) {
      await page.click(`nav >> text=${pageInfo.name}`)
      await expect(page).toHaveURL(pageInfo.url)
      await expect(page.locator('h1')).toContainText(pageInfo.name)
    }
  })

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    
    // Navigate via mobile menu
    await page.click('[data-testid="mobile-nav"] >> text=Gallery')
    await expect(page).toHaveURL('/gallery')
    
    // Check responsive layout
    await expect(page.locator('.grid-cols-1')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Intercept API calls to simulate errors
    await page.route('**/api/booking', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    await page.goto('/booking')
    
    // Fill minimal required fields
    await page.fill('input[name="name"]', 'Error Test')
    await page.fill('input[name="email"]', 'error@test.com')
    await page.fill('input[name="phone"]', '555-9999')
    
    // Submit form
    await page.click('button:has-text("Submit Booking")')
    
    // Check error message appears
    await expect(page.locator('text=/Error|Failed/i')).toBeVisible()
  })
})