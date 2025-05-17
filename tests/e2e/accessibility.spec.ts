import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('about page should be accessible', async ({ page }) => {
    await page.goto('/about')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('services page should be accessible', async ({ page }) => {
    await page.goto('/services')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('gallery page should be accessible', async ({ page }) => {
    await page.goto('/gallery')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('FAQ page should be accessible', async ({ page }) => {
    await page.goto('/faq')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('contact page should be accessible', async ({ page }) => {
    await page.goto('/contact')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('booking page should be accessible', async ({ page }) => {
    await page.goto('/booking')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check h1 exists and is unique
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBe(1)
    
    // Check heading hierarchy
    const h2Elements = await page.locator('h2').all()
    const h3Elements = await page.locator('h3').all()
    
    expect(h2Elements.length).toBeGreaterThan(0)
    
    // Verify h3s are within h2 sections
    for (const h3 of h3Elements) {
      const previousH2 = await h3.locator('xpath=preceding::h2[1]').count()
      expect(previousH2).toBe(1)
    }
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation has proper ARIA
    const nav = page.locator('nav')
    await expect(nav).toHaveAttribute('aria-label', /main|primary|navigation/i)
    
    // Check buttons have accessible text
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/contact')
    
    // Check all inputs have labels
    const inputs = await page.locator('input:not([type="hidden"])').all()
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      const name = await input.getAttribute('name')
      const labelFor = page.locator(`label[for="${id}"]`)
      const labelWrapping = input.locator('xpath=ancestor::label')
      
      const hasLabel = (await labelFor.count()) > 0 || (await labelWrapping.count()) > 0
      expect(hasLabel).toBeTruthy()
    }
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/gallery')
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt.length).toBeGreaterThan(0)
    }
  })

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    let previousElement = null
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.locator(':focus')
      const tagName = await focusedElement.evaluate(el => el.tagName)
      
      // Verify we're focusing on interactive elements
      expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT']).toContain(tagName)
      
      // Verify focus is visible
      const outline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.outline || styles.boxShadow
      })
      expect(outline).not.toBe('none')
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
    
    // Check specifically for color contrast
    const results = await page.evaluate(() => {
      return window.axe.run({
        rules: {
          'color-contrast': { enabled: true }
        }
      })
    })
    
    expect(results.violations).toHaveLength(0)
  })

  test('modals should be accessible', async ({ page }) => {
    await page.goto('/gallery')
    
    // Open modal
    await page.locator('.grid > div').first().click()
    
    // Check modal has proper ARIA
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
    await expect(modal).toHaveAttribute('aria-modal', 'true')
    
    // Check close button is accessible
    const closeButton = modal.locator('button[aria-label*="close"]')
    await expect(closeButton).toBeVisible()
    
    // Test escape key closes modal
    await page.keyboard.press('Escape')
    await expect(modal).not.toBeVisible()
  })

  test('skip links should work', async ({ page }) => {
    await page.goto('/')
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main"]')
    
    // Tab to reveal skip link
    await page.keyboard.press('Tab')
    
    // If skip link exists, test it
    if (await skipLink.count() > 0) {
      await skipLink.click()
      
      // Verify focus moved to main content
      const focusedElement = await page.locator(':focus')
      const id = await focusedElement.getAttribute('id')
      expect(id).toBe('main')
    }
  })

  test('error messages should be announced', async ({ page }) => {
    await page.goto('/contact')
    
    // Submit empty form
    await page.click('button:has-text("Send Message")')
    
    // Check error messages have proper ARIA
    const errors = page.locator('[role="alert"]')
    await expect(errors.first()).toBeVisible()
    
    // Check errors are associated with inputs
    const nameInput = page.locator('input[name="name"]')
    const ariaDescribedby = await nameInput.getAttribute('aria-describedby')
    expect(ariaDescribedby).toBeTruthy()
  })
})