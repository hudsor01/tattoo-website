#!/usr/bin/env node
/**
 * Admin Dashboard Test Script
 * Tests the following functionality:
 * 1. Admin login
 * 2. View contact submissions
 * 3. Export contacts to CSV
 */

import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'fennyg83@gmail.com';
const ADMIN_PASSWORD = 'Fernandogovea83!';
const BASE_URL = 'http://localhost:3000';

test.describe('Admin Dashboard', () => {
  test('Admin can login successfully', async ({ page }) => {
    // Navigate to admin login page
    await page.goto(`${BASE_URL}/admin/login`);
    
    // Fill in login form
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('Admin can view contact submissions', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Click on Contacts tab
    await page.click('button:has-text("Contacts")');
    
    // Wait for contacts table to load
    await page.waitForSelector('[role="table"]', { timeout: 10000 });
    
    // Verify table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
    await expect(page.locator('th:has-text("Message")')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
  });

  test('Admin can export contacts to CSV', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Click on Contacts tab
    await page.click('button:has-text("Contacts")');
    
    // Wait for Export button to be visible
    await page.waitForSelector('button:has-text("Export CSV")', { timeout: 10000 });
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click Export CSV button
    await page.click('button:has-text("Export CSV")');
    
    // Wait for download to complete
    const download = await downloadPromise;
    
    // Verify the download
    expect(download.suggestedFilename()).toMatch(/^contacts-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('Admin logout works correctly', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Click logout button
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login page
    await page.waitForURL(`${BASE_URL}/admin/login`);
  });
});

// Test the mock data functionality
test.describe('Admin Dashboard Mock Data', () => {
  test('Dashboard displays mock statistics', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Check for statistics cards
    await expect(page.locator('text="Total Bookings"')).toBeVisible();
    await expect(page.locator('text="Pending Bookings"')).toBeVisible();
    await expect(page.locator('text="Total Contacts"')).toBeVisible();
    await expect(page.locator('text="Newsletter"')).toBeVisible();
  });

  test('Dashboard displays mock bookings', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/admin/login`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/admin`);
    
    // Click on Bookings tab (should be default)
    await page.click('button:has-text("Bookings")');
    
    // Check for booking table
    await expect(page.locator('text="Recent Bookings"')).toBeVisible();
    await expect(page.locator('text="John Doe"')).toBeVisible();
    await expect(page.locator('text="Jane Smith"')).toBeVisible();
    await expect(page.locator('text="Bob Wilson"')).toBeVisible();
  });
});

console.log('Admin Dashboard Test Script Complete');
console.log('To run these tests, use: npx playwright test tests/admin-dashboard-test.ts');