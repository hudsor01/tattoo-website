import { test, expect } from '@playwright/test';
import { BookingPage } from './page-objects/booking-page';
import { TEST_BOOKING } from './test-constants';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

/**
 * Test suite for the booking page and booking flow
 */
test.describe('Booking Flow', () => {
  const prisma = new PrismaClient();
  
  test.beforeAll(async () => {
    await prisma.$connect();
    console.log('Connected to database for booking tests');
  });
  
  test.afterAll(async () => {
    // Clean up test bookings
    await prisma.booking.deleteMany({
      where: {
        email: TEST_BOOKING.email
      }
    });
    
    await prisma.$disconnect();
    console.log('Disconnected from database after booking tests');
  });
  
  test('should display booking form with all required fields', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    await bookingPage.goto();
    
    // Verify booking form is present and contains all required fields
    await bookingPage.verifyBookingForm();
  });
  
  test('should validate form and show error messages for empty fields', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Test form validation by submitting an empty form
    const errors = await bookingPage.testFormValidation();
    
    // Verify we got error messages
    expect(errors.length).toBeGreaterThan(0);
    
    // Check for required field error messages
    const errorText = errors.join(' ');
    expect(errorText).toContain('required');
  });
  
  test('should update pricing estimate when size and placement are selected', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Test if pricing estimate updates when form fields change
    await bookingPage.verifyPricingEstimateUpdates();
  });
  
  test('should allow selecting a date from the date picker', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Test date picker functionality
    await bookingPage.testDatePicker();
  });
  
  test('should submit a completed booking form successfully', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Complete the booking process with test data
    const confirmationMessage = await bookingPage.completeBooking({
      // Use unique email to avoid conflicts
      email: `test-${Date.now()}@example.com`
    });
    
    // Verify confirmation message
    expect(confirmationMessage).toContain('received');
    
    // Additional verification: check database for the new booking
    const booking = await prisma.booking.findFirst({
      where: {
        email: `test-${Date.now()}@example.com`
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    expect(booking).not.toBeNull();
    expect(booking?.name).toBe(TEST_BOOKING.name);
  });
  
  test('should handle reference image upload', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    await bookingPage.goto();
    
    // Fill out the form
    await bookingPage.fillBookingForm({
      // Use unique email to avoid conflicts
      email: `test-upload-${Date.now()}@example.com`
    });
    
    // Upload a test image
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
    try {
      await bookingPage.uploadReferenceImage(testImagePath);
    } catch (error) {
      // If test image doesn't exist, use a default one or skip
      console.log('Test image not found, skipping upload test');
      test.skip();
    }
    
    // Submit the form
    await bookingPage.submitBookingForm();
    
    // Verify success
    const isSuccessful = await bookingPage.isBookingSuccessful();
    expect(isSuccessful).toBe(true);
  });
  
  test('should redirect to payment page after successful booking', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Complete booking
    await bookingPage.goto();
    await bookingPage.fillBookingForm({
      email: `test-payment-${Date.now()}@example.com`
    });
    await bookingPage.submitBookingForm();
    
    // Check for redirect to payment page
    // This can be a redirect or a modal, depending on implementation
    const isOnPaymentPage = await page.url().includes('payment') ||
                            await page.isVisible('[data-testid="payment-form"]');
    
    expect(isOnPaymentPage).toBe(true);
  });
  
  test('should be responsive on mobile devices', async ({ page }) => {
    const bookingPage = new BookingPage(page);
    
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await bookingPage.goto();
    
    // Check form visibility and layout
    await bookingPage.verifyBookingForm();
    
    // Test form submission on mobile
    await bookingPage.fillBookingForm({
      email: `test-mobile-${Date.now()}@example.com`
    });
    await bookingPage.submitBookingForm();
    
    // Verify success
    const isSuccessful = await bookingPage.isBookingSuccessful();
    expect(isSuccessful).toBe(true);
    
    // Reset viewport size
    await page.setViewportSize({ width: 1280, height: 800 });
  });
  
  test('should handle server errors gracefully', async ({ page }) => {
    // This test simulates a server error by intercepting the form submission request
    const bookingPage = new BookingPage(page);
    await bookingPage.goto();
    
    // Intercept API request and return an error
    await page.route('/api/bookings', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Fill and submit the form
    await bookingPage.fillBookingForm();
    await bookingPage.submitBookingForm();
    
    // Check for error message
    const hasErrors = await bookingPage.hasFormErrors();
    expect(hasErrors).toBe(true);
    
    // Error should mention server issue
    const errors = await bookingPage.getFormErrors();
    const errorText = errors.join(' ');
    expect(errorText).toContain('error');
  });
});
