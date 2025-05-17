import { test, expect } from '@playwright/test'

test.describe('Contact Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contact Us')
    await expect(page.locator('text=We\'d love to hear from you')).toBeVisible()
  })

  test('should display quick contact cards', async ({ page }) => {
    await expect(page.locator('text=Phone Support')).toBeVisible()
    await expect(page.locator('text=Email Support')).toBeVisible()
    await expect(page.locator('text=Visit Studio')).toBeVisible()
    
    // Check response times
    await expect(page.locator('text=Instant response')).toBeVisible()
    await expect(page.locator('text=Within 24 hours')).toBeVisible()
  })

  test('should have tabbed form interface', async ({ page }) => {
    // Check tabs exist
    await expect(page.locator('text=General Inquiry')).toBeVisible()
    await expect(page.locator('text=Appointment Request')).toBeVisible()
    
    // Switch to appointment tab
    await page.click('text=Appointment Request')
    await expect(page.locator('input[placeholder*="phone"]')).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Send Message")')
    
    // Check for validation errors
    await expect(page.locator('text=This field is required')).toBeVisible()
  })

  test('should fill and submit general inquiry form', async ({ page }) => {
    // Fill form fields
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('textarea[name="message"]', 'I would like to inquire about custom tattoo designs.')
    
    // Submit form
    await page.click('button:has-text("Send Message")')
    
    // Wait for response
    await page.waitForResponse(response => response.url().includes('/api/contact'))
    
    // Check for success message or redirect
    await expect(page.locator('text=/Thank you|Success|Sent/i')).toBeVisible()
  })

  test('should display location information', async ({ page }) => {
    await expect(page.locator('text=Studio Location')).toBeVisible()
    await expect(page.locator('text=1234 Art Street')).toBeVisible()
    await expect(page.locator('button:has-text("Get Directions")')).toBeVisible()
  })

  test('should display operating hours', async ({ page }) => {
    await expect(page.locator('text=Operating Hours')).toBeVisible()
    await expect(page.locator('text=Monday')).toBeVisible()
    await expect(page.locator('text=10:00 AM - 8:00 PM')).toBeVisible()
  })

  test('should display social media cards', async ({ page }) => {
    await expect(page.locator('text=Connect With Us')).toBeVisible()
    await expect(page.locator('text=Instagram')).toBeVisible()
    await expect(page.locator('text=Facebook')).toBeVisible()
    await expect(page.locator('text=Twitter')).toBeVisible()
  })

  test('should display FAQ section', async ({ page }) => {
    await expect(page.locator('text=Quick Answers')).toBeVisible()
    
    // Test accordion functionality
    const firstQuestion = page.locator('[role="button"]').first()
    await firstQuestion.click()
    
    // Check that answer is visible
    await expect(page.locator('[role="region"]').first()).toBeVisible()
  })

  test('should handle appointment request form', async ({ page }) => {
    // Switch to appointment tab
    await page.click('text=Appointment Request')
    
    // Fill appointment form
    await page.fill('input[name="name"]', 'Jane Smith')
    await page.fill('input[name="email"]', 'jane@example.com')
    await page.fill('input[name="phone"]', '555-0123')
    await page.fill('input[name="preferredDate"]', '2024-12-25')
    await page.fill('textarea[name="message"]', 'Looking for a sleeve tattoo consultation')
    
    // Submit form
    await page.click('button:has-text("Request Appointment")')
    
    // Check for success
    await page.waitForResponse(response => response.url().includes('/api/contact'))
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that layout adjusts
    await expect(page.locator('.grid-cols-1')).toBeVisible()
    
    // Check that tabs are still functional
    await page.click('text=Appointment Request')
    await expect(page.locator('input[name="phone"]')).toBeVisible()
  })

  test('should display CTA section', async ({ page }) => {
    await expect(page.locator('text=Ready to Start?')).toBeVisible()
    await expect(page.locator('text=Book Consultation')).toBeVisible()
    await expect(page.locator('text=Call Now')).toBeVisible()
  })
})