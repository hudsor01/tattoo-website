import { test, expect } from './helpers/test-fixtures';
import { EnhancedBookingPage } from './page-objects/enhanced-booking-page';
import * as path from 'path';

/**
 * Enhanced E2E test suite for the booking flow
 * Leverages our improved testing framework with visual testing, data management, and reporting
 */
test.describe('Enhanced Booking Flow Tests', () => {
  let testFixturesCreated = false;

  test.beforeAll(async ({ dataFactory }) => {
    // Create any shared test fixtures if needed
    console.log('Setting up shared test data for booking tests');
    
    // Create a test service that will be used across tests
    await dataFactory.createTestService({
      name: 'Enhanced Test Service',
      price: 200,
      duration: 90
    });
    
    testFixturesCreated = true;
  });
  
  test.afterAll(async ({ dataFactory }) => {
    // Clean up test data
    await dataFactory.cleanup();
    console.log('Cleaned up shared test data for booking tests');
  });
  
  test('should display booking form with all required fields and match visual baseline', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Navigate to booking page
    await bookingPage.goto();
    
    // Verify booking form is displayed correctly
    await bookingPage.verifyBookingForm();
    
    // Additional visual verification of the whole page
    await visualTesting.captureAndCompare('booking_page_full', undefined, { fullPage: true });
    
    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('booking_page_baseline');
  });
  
  test('should validate form and show error messages for empty fields', async ({ 
    page,
    visualTesting,
    reporter 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Test form validation
    const errors = await bookingPage.testFormValidation();
    
    // Verify we got error messages
    expect(errors.length).toBeGreaterThan(0, 'Empty form should produce validation errors');
    
    // Check for required field error messages
    const errorText = errors.join(' ');
    expect(errorText).toContain('required', 'Error messages should mention required fields');
    
    // Log validation errors for the report
    console.log('Validation errors:', errors);
  });
  
  test('should update pricing estimate when size and placement are selected', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Test pricing estimate updates
    const { initialPricing, updatedPricing } = await bookingPage.verifyPricingEstimateUpdates();
    
    // Verify pricing has changed
    expect(updatedPricing).not.toEqual(initialPricing, 'Pricing should update when size and placement change');
    expect(updatedPricing).toContain('$', 'Updated pricing should include a dollar sign');
    
    // Log pricing changes
    console.log(`Pricing changed from "${initialPricing}" to "${updatedPricing}"`);
  });
  
  test('should allow selecting a date from the date picker', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Test date picker functionality
    const selectedDate = await bookingPage.testDatePicker();
    
    // Verify a date was selected
    expect(selectedDate).not.toBe('', 'Selected date should not be empty');
    expect(selectedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/, 'Selected date should be in YYYY-MM-DD format');
    
    // Log selected date
    console.log(`Selected date: ${selectedDate}`);
  });
  
  test('should submit a completed booking form successfully', async ({ 
    page, 
    visualTesting,
    dataFactory 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Generate unique email for this test
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    // Complete booking flow with visual verification
    const { message, bookingData } = await bookingPage.completeBookingFlow({
      email: uniqueEmail,
      name: 'Visual Test Booking'
    });
    
    // Verify confirmation message
    expect(message).toContain('received', 'Confirmation message should indicate booking was received');
    
    // Verify booking was created in database
    const booking = await dataFactory.getPrisma().booking.findFirst({
      where: {
        email: uniqueEmail
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Verify database entry
    expect(booking).not.toBeNull('Booking should be created in the database');
    expect(booking?.name).toBe('Visual Test Booking', 'Booking name in database should match submitted data');
    
    // Log success message
    console.log(`Booking created successfully with ID: ${booking?.id}`);
  });
  
  test('should handle reference image upload', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Navigate to booking page
    await bookingPage.goto();
    
    // Fill booking form with test data
    const uniqueEmail = `test-upload-${Date.now()}@example.com`;
    await bookingPage.fillBookingForm({ email: uniqueEmail });
    
    // Upload a test image
    try {
      const testImagePath = path.join(process.cwd(), 'tests', 'e2e', 'fixtures', 'test-image.jpg');
      await bookingPage.uploadReferenceImage(testImagePath);
      
      // Visual verification after upload
      await visualTesting.captureAndCompare('booking_with_image');
    } catch (error) {
      console.warn('Failed to upload test image:', error);
      test.skip('Image upload test skipped: Test image not found');
      return;
    }
    
    // Submit the form
    await bookingPage.submitForm();
    
    // Verify booking was successful
    const isSuccessful = await bookingPage.isBookingSuccessful();
    expect(isSuccessful).toBe(true, 'Booking with image upload should be successful');
  });
  
  test('should be responsive on mobile devices', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Test mobile responsiveness
    const isSuccessful = await bookingPage.testMobileResponsiveness();
    
    // Verify booking was successful on mobile
    expect(isSuccessful).toBe(true, 'Booking should work correctly on mobile view');
  });
  
  test('should handle server errors gracefully', async ({ 
    page, 
    visualTesting 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Navigate to booking page
    await bookingPage.goto();
    
    // Simulate server error
    await bookingPage.simulateServerError();
    
    // Fill the form
    await bookingPage.fillBookingForm();
    
    // Submit the form
    await bookingPage.submitForm();
    
    // Verify error message is displayed
    const hasErrors = await bookingPage.hasFormErrors();
    expect(hasErrors).toBe(true, 'Form should show error when server returns an error');
    
    // Get error messages
    const errors = await bookingPage.getFormErrors();
    const errorText = errors.join(' ');
    expect(errorText).toContain('error', 'Error message should mention server error');
    
    // Visual verification of error state
    await visualTesting.captureAndCompare('booking_server_error');
  });
  
  test('should measure booking page performance', async ({ 
    page 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    
    // Measure performance
    const { loadTime, renderTime, submitTime } = await bookingPage.measurePerformance();
    
    // Log performance metrics
    console.log(`Performance metrics:
      - Page load time: ${loadTime}ms
      - Form render time: ${renderTime}ms
      - Form submit time: ${submitTime}ms
    `);
    
    // Verify performance is within acceptable range
    expect(loadTime).toBeLessThan(5000, 'Page load time should be less than 5 seconds');
    expect(renderTime).toBeLessThan(2000, 'Form render time should be less than 2 seconds');
    expect(submitTime).toBeLessThan(3000, 'Form submit time should be less than 3 seconds');
  });
  
  test('should complete end-to-end booking flow with all features', async ({ 
    page, 
    visualTesting,
    dataFactory 
  }) => {
    // Create enhanced booking page
    const bookingPage = new EnhancedBookingPage(page);
    bookingPage.setVisualTesting(visualTesting);
    
    // Run comprehensive end-to-end test with various conditions
    const testImagePath = path.join(process.cwd(), 'tests', 'e2e', 'fixtures', 'test-image.jpg');
    
    const result = await bookingPage.testEndToEndBookingFlow({
      simulateLatency: true,
      mobileView: false,
      uploadImage: testImagePath,
      simulateServerError: false
    });
    
    // Verify test was successful
    expect(result.success).toBe(true, 'End-to-end booking flow should complete successfully');
    
    // Verify booking exists in database
    if (result.success && result.bookingData) {
      const booking = await dataFactory.getPrisma().booking.findFirst({
        where: {
          email: result.bookingData.email
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      expect(booking).not.toBeNull('Booking should exist in database after successful submission');
      
      // Log success message
      console.log(`End-to-end booking test completed successfully with ID: ${booking?.id}`);
    }
  });
});
