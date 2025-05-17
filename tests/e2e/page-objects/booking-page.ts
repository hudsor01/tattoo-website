/**
 * Booking page object model
 */
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { ROUTES, TEST_BOOKING } from '../test-constants';

export class BookingPage extends BasePage {
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
  readonly confirmationMessage: Locator;
  readonly pricingEstimate: Locator;
  
  constructor(page: Page) {
    super(page);
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
  }
  
  /**
   * Navigate to the booking page
   */
  async goto() {
    await super.goto(ROUTES.booking);
  }
  
  /**
   * Verify booking form is present and has all required fields
   */
  async verifyBookingForm() {
    await expect(this.bookingForm).toBeVisible();
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
  }
  
  /**
   * Fill in the booking form with test data
   * @param overrides Optional overrides for the test data
   */
  async fillBookingForm(overrides: Partial<typeof TEST_BOOKING> = {}) {
    const data = { ...TEST_BOOKING, ...overrides };
    
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
  }
  
  /**
   * Upload a reference image
   * @param filePath Path to the image file
   */
  async uploadReferenceImage(filePath: string) {
    await this.referenceImageUpload.setInputFiles(filePath);
  }
  
  /**
   * Submit the booking form
   */
  async submitBookingForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
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
    return this.confirmationMessage.textContent() || '';
  }
  
  /**
   * Complete a full booking process with test data
   * @param overrides Optional overrides for the test data
   */
  async completeBooking(overrides: Partial<typeof TEST_BOOKING> = {}) {
    await this.goto();
    await this.verifyBookingForm();
    await this.fillBookingForm(overrides);
    await this.submitBookingForm();
    
    // Check for success
    const isSuccessful = await this.isBookingSuccessful();
    expect(isSuccessful).toBe(true);
    
    // Return confirmation message
    return this.getConfirmationMessage();
  }
  
  /**
   * Test form validation by submitting an incomplete form
   */
  async testFormValidation() {
    await this.goto();
    
    // Submit the form without filling any fields
    await this.submitButton.click();
    
    // Check for validation errors
    const hasErrors = await this.hasFormErrors();
    expect(hasErrors).toBe(true);
    
    // Get error messages
    const errors = await this.getFormErrors();
    return errors;
  }
  
  /**
   * Check if pricing estimate is updated when form fields change
   */
  async verifyPricingEstimateUpdates() {
    await this.goto();
    
    // Check if pricing estimate is initially empty or zero
    const initialPricing = await this.pricingEstimate.textContent() || '';
    
    // Fill in size and placement to trigger pricing calculation
    await this.sizeField.selectOption('large');
    await this.placementField.selectOption('back');
    
    // Wait for pricing to update
    await this.page.waitForTimeout(500);
    
    // Get updated pricing
    const updatedPricing = await this.pricingEstimate.textContent() || '';
    
    // Expect pricing to have changed
    expect(updatedPricing).not.toEqual(initialPricing);
    expect(updatedPricing).toContain('$');
  }
  
  /**
   * Test date picker functionality
   */
  async testDatePicker() {
    await this.goto();
    
    // Click on date field to open date picker
    await this.dateField.click();
    
    // Check if date picker is visible
    const datePicker = this.page.locator('[role="dialog"]');
    await expect(datePicker).toBeVisible();
    
    // Select a date (2 weeks from now)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    
    // Click on the date
    await this.page.locator(`[aria-label*="${twoWeeksFromNow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}"]`).click();
    
    // Check if date was selected
    const selectedDate = await this.dateField.inputValue();
    expect(selectedDate).not.toBe('');
  }
}
