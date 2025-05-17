import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES, TEST_BOOKING } from '../test-constants';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced BookingPage with improved testing capabilities
 */
export class EnhancedBookingPage extends BasePage {
  // Form elements
  readonly bookingForm: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly phoneField: Locator;
  readonly tattooTypeField: Locator;
  readonly sizeField: Locator;
  readonly placementField: Locator;
  readonly descriptionField: Locator;
  readonly dateField: Locator;
  readonly timeField: Locator;
  readonly referenceImageUpload: Locator;
  readonly submitButton: Locator;

  // Result elements
  readonly confirmationMessage: Locator;
  readonly pricingEstimate: Locator;
  readonly errorMessages: Locator;

  // Visual testing integration
  private visualTesting: VisualTesting | null = null;

  constructor(page: Page) {
    super(page);

    // Initialize locators
    this.bookingForm = page.locator('form[data-testid="booking-form"]');
    this.nameField = page.locator('input[name="name"]');
    this.emailField = page.locator('input[name="email"]');
    this.phoneField = page.locator('input[name="phone"]');
    this.tattooTypeField = page.locator('select[name="tattooType"]');
    this.sizeField = page.locator('select[name="size"]');
    this.placementField = page.locator('select[name="placement"]');
    this.descriptionField = page.locator('textarea[name="description"]');
    this.dateField = page.locator('input[name="preferredDate"]');
    this.timeField = page.locator('select[name="preferredTime"]');
    this.referenceImageUpload = page.locator('input[type="file"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.confirmationMessage = page.locator('[data-testid="confirmation-message"]');
    this.pricingEstimate = page.locator('[data-testid="pricing-estimate"]');
    this.errorMessages = page.locator('[role="alert"]');
  }

  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedBookingPage {
    this.visualTesting = visualTesting;
    return this;
  }

  /**
   * Navigate to the booking page
   */
  async goto(): Promise<void> {
    await super.goto(ROUTES.booking);

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('initial_page_load');
    }
  }

  /**
   * Verify booking form is present and has all required fields
   */
  async verifyBookingForm(): Promise<void> {
    // Wait for form to be visible
    await expect(this.bookingForm).toBeVisible();

    // Verify all form fields are present
    await expect(this.nameField).toBeVisible();
    await expect(this.emailField).toBeVisible();
    await expect(this.phoneField).toBeVisible();
    await expect(this.tattooTypeField).toBeVisible();
    await expect(this.sizeField).toBeVisible();
    await expect(this.placementField).toBeVisible();
    await expect(this.descriptionField).toBeVisible();
    await expect(this.dateField).toBeVisible();
    await expect(this.timeField).toBeVisible();
    await expect(this.submitButton).toBeVisible();

    // Visual verification if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(
        'booking_form',
        'form[data-testid="booking-form"]',
      );
    }
  }

  /**
   * Fill in the booking form with test data
   * @param overrides Properties to override default values
   */
  async fillBookingForm(overrides: Partial<typeof TEST_BOOKING> = {}): Promise<any> {
    // Generate unique data for this test run
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);

    // Merge default test data with overrides and unique identifiers
    const data = {
      ...TEST_BOOKING,
      email: overrides.email || `test-${uniqueId}@example.com`,
      phone: overrides.phone || `555${uniqueId.substring(0, 7)}`,
      ...overrides,
    };

    // Fill form fields
    await this.nameField.fill(data.name);
    await this.emailField.fill(data.email);
    await this.phoneField.fill(data.phone);
    await this.tattooTypeField.selectOption(data.tattooType);
    await this.sizeField.selectOption(data.size);
    await this.placementField.selectOption(data.placement);
    await this.descriptionField.fill(data.description);

    // Format date for input field (YYYY-MM-DD)
    const dateString = data.preferredDate.toISOString().split('T')[0];
    await this.dateField.fill(dateString);

    await this.timeField.selectOption(data.preferredTime);

    // Visual verification if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('form_filled', 'form[data-testid="booking-form"]');
    }

    return data;
  }

  /**
   * Select a tattoo size
   * @param size Size to select
   */
  async selectSize(size: string): Promise<void> {
    await this.sizeField.selectOption(size);
  }

  /**
   * Select a tattoo placement
   * @param placement Placement to select
   */
  async selectPlacement(placement: string): Promise<void> {
    await this.placementField.selectOption(placement);
  }

  /**
   * Get the current pricing estimate
   */
  async getPricingEstimate(): Promise<string> {
    const estimateText = await this.pricingEstimate.textContent();
    return estimateText || '';
  }

  /**
   * Upload a reference image
   * @param filePath Path to the image file
   */
  async uploadReferenceImage(filePath: string): Promise<void> {
    await this.referenceImageUpload.setInputFiles(filePath);

    // Wait for upload to process
    await this.page.waitForTimeout(500);

    // Visual verification if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('reference_image_uploaded');
    }
  }

  /**
   * Submit the booking form
   */
  async submitForm(): Promise<void> {
    // Take screenshot before submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('before_submit');
    }

    // Click submit button
    await this.submitButton.click();

    // Wait for response
    await this.waitForPageLoad();

    // Take screenshot after submitting if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_submit');
    }
  }

  /**
   * Check if booking was successful
   */
  async isBookingSuccessful(): Promise<boolean> {
    return this.confirmationMessage.isVisible();
  }

  /**
   * Get confirmation message text
   */
  async getConfirmationMessage(): Promise<string> {
    const messageText = await this.confirmationMessage.textContent();
    return messageText || '';
  }

  /**
   * Check if there are form errors
   */
  async hasFormErrors(): Promise<boolean> {
    try {
      // Wait a bit for errors to appear
      await this.page.waitForTimeout(500);

      return (await this.errorMessages.count()) > 0;
    } catch (error) {
      // If no error messages are found, return false
      return false;
    }
  }

  /**
   * Get form error messages
   */
  async getFormErrors(): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Wait a bit for errors to appear
      await this.page.waitForTimeout(500);

      // Get all error messages
      const errorElements = await this.errorMessages.all();

      for (const element of errorElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          errors.push(text.trim());
        }
      }
    } catch (error) {
      // If no error messages are found, return empty array
    }

    return errors;
  }

  /**
   * Complete a full booking process with visual verification
   * @param overrides Properties to override in test data
   */
  async completeBookingFlow(overrides: Partial<typeof TEST_BOOKING> = {}): Promise<{
    message: string;
    bookingData: unknown;
  }> {
    // Navigate to booking page
    await this.goto();

    // Visual verification of initial state if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('booking_flow_1_initial');
    }

    // Verify booking form is present
    await this.verifyBookingForm();

    // Fill booking form with test data
    const bookingData = await this.fillBookingForm(overrides);

    // Visual verification of filled form if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('booking_flow_2_filled');
    }

    // Submit form
    await this.submitForm();

    // Visual verification of submitted state if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('booking_flow_3_submitted');
    }

    // Verify booking was successful
    const isSuccessful = await this.isBookingSuccessful();
    expect(isSuccessful).toBe(true, 'Booking submission should be successful');

    // Get confirmation message
    const message = await this.getConfirmationMessage();

    // Visual verification of confirmation state if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('booking_flow_4_confirmed');
    }

    return {
      message,
      bookingData,
    };
  }

  /**
   * Test form validation by submitting an empty form
   */
  async testFormValidation(): Promise<string[]> {
    // Navigate to booking page
    await this.goto();

    // Submit the form without filling any fields
    await this.submitForm();

    // Visual verification of validation errors if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('form_validation_errors');
    }

    // Get error messages
    return this.getFormErrors();
  }

  /**
   * Verify pricing estimate updates when form fields change
   */
  async verifyPricingEstimateUpdates(): Promise<{
    initialPricing: string;
    updatedPricing: string;
  }> {
    // Navigate to booking page
    await this.goto();

    // Get initial pricing estimate
    const initialPricing = await this.getPricingEstimate();

    // Visual verification before changes if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('pricing_before_update');
    }

    // Change size and placement to trigger pricing update
    await this.selectSize('large');
    await this.selectPlacement('back');

    // Wait for pricing to update
    await this.page.waitForTimeout(500);

    // Get updated pricing estimate
    const updatedPricing = await this.getPricingEstimate();

    // Visual verification after changes if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('pricing_after_update');
    }

    return {
      initialPricing,
      updatedPricing,
    };
  }

  /**
   * Test date picker functionality
   */
  async testDatePicker(): Promise<string> {
    // Navigate to booking page
    await this.goto();

    // Click on date field to open date picker
    await this.dateField.click();

    // Visual verification of date picker if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('date_picker_open');
    }

    // Select a date (2 weeks from now)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    // Format date for locator
    const formattedDate = twoWeeksFromNow.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Click on the date
    await this.page.locator(`[aria-label*="${formattedDate}"]`).click();

    // Get selected date from input field
    const selectedDate = await this.dateField.inputValue();

    // Visual verification after date selection if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('date_selected');
    }

    return selectedDate;
  }

  /**
   * Test mobile responsiveness
   * @param viewport Viewport size to test
   */
  async testMobileResponsiveness(viewport = { width: 375, height: 667 }): Promise<boolean> {
    // Set viewport size
    await this.page.setViewportSize(viewport);

    // Navigate to booking page
    await this.goto();

    // Visual verification on mobile if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('mobile_initial');
    }

    // Verify booking form is displayed correctly
    await this.verifyBookingForm();

    // Fill booking form with test data
    const uniqueEmail = `test-mobile-${Date.now()}@example.com`;
    await this.fillBookingForm({ email: uniqueEmail });

    // Visual verification after filling on mobile if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('mobile_filled');
    }

    // Submit form
    await this.submitForm();

    // Verify booking was successful
    const isSuccessful = await this.isBookingSuccessful();

    // Visual verification of confirmation on mobile if enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('mobile_confirmed');
    }

    // Reset viewport size
    await this.page.setViewportSize({ width: 1280, height: 800 });

    return isSuccessful;
  }

  /**
   * Simulate a server error by intercepting the API request
   */
  async simulateServerError(): Promise<void> {
    // Intercept API request and return an error
    await this.page.route('/api/bookings', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Simulated server error for testing' }),
      });
    });
  }

  /**
   * Simulate network latency for realistic testing
   * @param latencyMs Latency in milliseconds
   */
  async simulateNetworkLatency(latencyMs = 200): Promise<void> {
    // Add network latency to all requests
    await this.page.route('**/*', async route => {
      // Wait for specified latency
      await new Promise(resolve => setTimeout(resolve, latencyMs));
      // Continue with the request
      await route.continue();
    });
  }

  /**
   * Test the entire booking flow with error handling and resilience
   * @param options Testing options
   */
  async testEndToEndBookingFlow(
    options: {
      simulateLatency?: boolean;
      mobileView?: boolean;
      uploadImage?: string;
      simulateServerError?: boolean;
    } = {},
  ): Promise<{
    success: boolean;
    errors: string[];
    bookingData?: unknown;
    message?: string;
  }> {
    try {
      // Set up test conditions
      if (options.simulateLatency) {
        await this.simulateNetworkLatency(200);
      }

      if (options.mobileView) {
        await this.page.setViewportSize({ width: 375, height: 667 });
      }

      if (options.simulateServerError) {
        await this.simulateServerError();
      }

      // Navigate to booking page
      await this.goto();

      // Verify booking form is present
      await this.verifyBookingForm();

      // Generate unique test data
      const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 8);
      const email = `test-${uniqueId}@example.com`;

      // Fill booking form with test data
      const bookingData = await this.fillBookingForm({ email });

      // Upload image if specified
      if (options.uploadImage) {
        try {
          await this.uploadReferenceImage(options.uploadImage);
        } catch (error) {
          console.warn('Failed to upload test image:', error);
        }
      }

      // Submit form
      await this.submitForm();

      // Check for success or errors
      const hasErrors = await this.hasFormErrors();

      if (hasErrors) {
        // Get error messages
        const errors = await this.getFormErrors();

        if (options.simulateServerError) {
          // If server error was simulated, this is expected
          return {
            success: false,
            errors,
            bookingData,
          };
        } else {
          // Otherwise, this is an unexpected failure
          throw new Error(`Booking submission failed with errors: ${errors.join(', ')}`);
        }
      } else {
        // Get confirmation message
        const message = await this.getConfirmationMessage();

        return {
          success: true,
          errors: [],
          bookingData,
          message,
        };
      }
    } catch (error) {
      console.error('Error during booking flow test:', error);

      // Take screenshot on error if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('error_state');
      }

      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    } finally {
      // Reset viewport if mobile view was used
      if (options.mobileView) {
        await this.page.setViewportSize({ width: 1280, height: 800 });
      }
    }
  }

  /**
   * Test performance metrics for the booking page
   */
  async measurePerformance(): Promise<{
    loadTime: number;
    renderTime: number;
    submitTime: number;
  }> {
    // Measure page load time
    const startLoadTime = Date.now();
    await this.goto();
    const loadTime = Date.now() - startLoadTime;

    // Measure render time for booking form
    const startRenderTime = Date.now();
    await this.verifyBookingForm();
    const renderTime = Date.now() - startRenderTime;

    // Fill form with test data
    await this.fillBookingForm();

    // Measure submit time
    const startSubmitTime = Date.now();
    await this.submitForm();
    const submitTime = Date.now() - startSubmitTime;

    return {
      loadTime,
      renderTime,
      submitTime,
    };
  }
}
