import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
  });

  test('should display admin dashboard with navigation', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/Ink 37/);
    
    // Check for main dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('text=Gallery')).toBeVisible();
    await expect(page.locator('text=Appointments')).toBeVisible();
    await expect(page.locator('text=Bookings')).toBeVisible();
  });

  test('should navigate to gallery management', async ({ page }) => {
    // Click on Gallery navigation
    await page.click('text=Gallery');
    
    // Wait for navigation
    await page.waitForURL('**/admin/gallery');
    
    // Check gallery page elements
    await expect(page.locator('text=Gallery Management')).toBeVisible();
    await expect(page.locator('text=Add Design')).toBeVisible();
  });

  test('should display gallery statistics', async ({ page }) => {
    await page.goto('/admin/gallery');
    
    // Wait for statistics to load
    await expect(page.locator('text=Total Designs')).toBeVisible();
    await expect(page.locator('text=Approved')).toBeVisible();
    await expect(page.locator('text=Pending Approval')).toBeVisible();
    
    // Check that statistics have numeric values
    const totalDesigns = page.locator('text=Total Designs').locator('..').locator('.text-2xl');
    await expect(totalDesigns).toBeVisible();
  });

  test('should open create design dialog', async ({ page }) => {
    await page.goto('/admin/gallery');
    
    // Click Add Design button
    await page.click('text=Add Design');
    
    // Check if dialog opens
    await expect(page.locator('text=Create Design')).toBeVisible();
    await expect(page.locator('text=Upload Image')).toBeVisible();
    
    // Check form fields
    await expect(page.locator('input[placeholder="Design name"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder="Design description"]')).toBeVisible();
  });

  test('should search designs', async ({ page }) => {
    await page.goto('/admin/gallery');
    
    // Wait for page to load
    await page.waitForSelector('input[placeholder="Search designs..."]');
    
    // Type in search box
    await page.fill('input[placeholder="Search designs..."]', 'test');
    
    // The search should filter results (we can't test actual results without data)
    await expect(page.locator('input[placeholder="Search designs..."]')).toHaveValue('test');
  });

  test('should filter designs by type', async ({ page }) => {
    await page.goto('/admin/gallery');
    
    // Wait for filter to be available
    await page.waitForSelector('text=All Types');
    
    // Click on design type filter
    await page.click('text=All Types');
    
    // Check if dropdown opens with options
    await expect(page.locator('text=Traditional')).toBeVisible();
    await expect(page.locator('text=Realism')).toBeVisible();
  });

  test('should navigate to appointments page', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to appointments
    await page.click('text=Appointments');
    await page.waitForURL('**/admin/appointments');
    
    // Check appointments page elements
    await expect(page.locator('text=Appointments')).toBeVisible();
  });

  test('should navigate to bookings page', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to bookings
    await page.click('text=Bookings');
    await page.waitForURL('**/admin/bookings');
    
    // Check bookings page elements
    await expect(page.locator('text=Bookings')).toBeVisible();
  });

  test('should navigate to Cal.com bookings page', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to Cal bookings (if available)
    const calBookingsLink = page.locator('text=Cal Bookings');
    if (await calBookingsLink.isVisible()) {
      await calBookingsLink.click();
      await page.waitForURL('**/admin/cal-bookings');
      await expect(page.locator('text=Cal.com Bookings')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    
    // Check if mobile layout is applied
    await expect(page).toHaveTitle(/Ink 37/);
    
    // On mobile, navigation might be collapsed
    // Check if page still loads properly
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});