import { test, expect } from '@playwright/test'

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have working desktop navigation', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Check that desktop nav items are visible  
    const nav = page.locator('nav')
    
    // Test navigation links from the Nav component
    const navItems = [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Services', url: '/services' },
      { text: 'Gallery', url: '/gallery' },
      { text: 'Book Now', url: '/booking' },
      { text: 'Contact', url: '/contact' },
    ]
    
    // Check desktop navigation links - they're in a div with hidden md:flex
    const desktopNav = nav.locator('.hidden.md\\:flex')
    await expect(desktopNav).toBeVisible()
    
    for (const item of navItems) {
      const link = desktopNav.locator(`a[href="${item.url}"]`)
      await expect(link).toBeVisible()
      await expect(link).toHaveText(item.text)
    }
    
    // Check the desktop Book Consultation button
    const bookButton = nav.locator('.hidden.md\\:block').getByRole('link', { name: 'Book Consultation' })
    await expect(bookButton).toBeVisible()
  })

  test('should have working mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mobile menu should be closed initially (hidden)
    const mobileMenu = page.locator('nav .md\\:hidden').nth(1) // The second md:hidden is the menu content
    await expect(mobileMenu).not.toBeVisible()
    
    // Click menu button to open mobile menu
    const menuButton = page.locator('nav .md\\:hidden').first().locator('button')
    await menuButton.click()
    
    // Mobile menu should now be visible with animation
    await expect(mobileMenu).toBeVisible()
    
    // Check navigation items in mobile menu
    const navItems = ['Home', 'About', 'Services', 'Gallery', 'Book Now', 'Contact']
    for (const item of navItems) {
      await expect(mobileMenu.locator(`text=${item}`)).toBeVisible()
    }
    
    // Check Book Consultation button in mobile menu
    await expect(mobileMenu.getByRole('link', { name: 'Book Consultation' })).toBeVisible()
  })

  test('should close mobile menu after navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Open mobile menu
    const menuButton = page.locator('nav .md\\:hidden').first().locator('button')
    await menuButton.click()
    
    // Click a nav item in mobile menu  
    const mobileMenu = page.locator('nav .md\\:hidden').nth(1) 
    await mobileMenu.locator('text=About').click()
    
    // Check navigation occurred
    await expect(page).toHaveURL('/about')
    
    // Menu should be closed after navigation (onClick handler sets isOpen to false)
    await expect(mobileMenu).not.toBeVisible()
  })

  test('should change background on scroll', async ({ page }) => {
    // Need to go to a page with scrollable content
    await page.goto('/services')  // Try a different page that likely has more content
    
    // Add some content to ensure the page is scrollable
    await page.evaluate(() => {
      const div = document.createElement('div')
      div.style.height = '200vh'
      document.body.appendChild(div)
    })
    
    // Check initial nav background
    const nav = page.locator('nav')
    const initialClass = await nav.getAttribute('class')
    expect(initialClass).toContain('bg-transparent')
    
    // Wait for any initial animations to complete
    await page.waitForTimeout(1000)
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 200))
    
    // Wait for scroll handler and CSS transition
    await page.waitForTimeout(1000)
    
    // Get the nav class after scrolling
    const scrolledClass = await nav.getAttribute('class')
    
    // Check if the class has changed as expected
    // The Nav component should have different styling when scrolled
    expect(scrolledClass).not.toBe(initialClass)
    expect(scrolledClass).toContain('transition-all duration-300')
  })

  test('should have logo link to home', async ({ page }) => {
    // Navigate to another page first
    await page.goto('/about')
    
    // Click logo to go home - the logo is in the nav
    await page.locator('nav a[href="/"]').first().click()
    await expect(page).toHaveURL('/')
  })

  test('should have CTA button in navigation', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // Check desktop CTA in navigation
    const nav = page.locator('nav')
    const desktopCTA = nav.locator('.hidden.md\\:block').getByRole('link', { name: 'Book Consultation' })
    await expect(desktopCTA).toBeVisible()
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Open mobile menu
    const menuButton = nav.locator('.md\\:hidden').first().locator('button')
    await menuButton.click()
    
    // Check mobile CTA
    const mobileMenu = nav.locator('.md\\:hidden').nth(1)
    const mobileCTA = mobileMenu.getByRole('link', { name: 'Book Consultation' })
    await expect(mobileCTA).toBeVisible()
  })
})