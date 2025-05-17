import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';

/**
 * Enhanced FAQ Page Object for E2E tests
 */
export class EnhancedFAQPage extends BasePage {
  // Navigation elements
  readonly header: Locator;
  readonly backButton: Locator;
  
  // FAQ elements
  readonly faqTitle: Locator;
  readonly faqDescription: Locator;
  readonly searchField: Locator;
  readonly categoryNavigation: Locator;
  readonly categoryLinks: Locator;
  readonly accordionContainer: Locator;
  readonly accordionItems: Locator;
  readonly accordionButtons: Locator;
  readonly accordionContents: Locator;
  readonly faqCategories: Locator;
  readonly ctaSection: Locator;
  readonly ctaButtons: Locator;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.backButton = page.locator('a:has-text("Back"), button:has-text("Back")');
    
    this.faqTitle = page.locator('h1:has-text("Frequently Asked Questions"), [data-testid="faq-title"]');
    this.faqDescription = page.locator('.max-w-2xl:has-text("Everything you need to know")');
    this.searchField = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.categoryNavigation = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
    this.categoryLinks = page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 a');
    this.accordionContainer = page.locator('.bg-tattoo-black\\/70 .relative.z-10');
    this.accordionItems = page.locator('[data-state="closed"], [data-state="open"]');
    this.accordionButtons = page.locator('[data-state="closed"] button, [data-state="open"] button');
    this.accordionContents = page.locator('[role="region"]');
    this.faqCategories = page.locator('[id^="general"], [id^="process"], [id^="policies"], [id^="tattoos"]');
    this.ctaSection = page.locator('section:has-text("Still Have Questions?")');
    this.ctaButtons = page.locator('section:has-text("Still Have Questions?") a');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedFAQPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to FAQ page
   */
  async goto(): Promise<void> {
    await this.page.goto('/faq');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('faq_page_initial');
    }
  }
  
  /**
   * Verify FAQ page is loaded correctly
   */
  async verifyFAQPage(): Promise<void> {
    // Verify key elements are visible
    await expect(this.header).toBeVisible();
    await expect(this.faqTitle).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('faq_page_verification');
    }
  }
  
  /**
   * Search for a question
   * @param searchTerm Term to search for
   */
  async searchQuestion(searchTerm: string): Promise<void> {
    // Check if search input exists
    if (await this.searchField.count() > 0) {
      // Clear search input
      await this.searchField.fill('');
      
      // Enter search term
      await this.searchField.fill(searchTerm);
      
      // Press Enter
      await this.searchField.press('Enter');
      
      // Wait for search results to update
      await this.page.waitForTimeout(500);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`faq_search_${searchTerm.toLowerCase()}`);
      }
    } else {
      console.warn('Search input not found on FAQ page');
    }
  }
  
  /**
   * Get count of FAQ categories
   */
  async getCategoryCount(): Promise<number> {
    return await this.categoryLinks.count();
  }
  
  /**
   * Get all category names
   */
  async getCategoryNames(): Promise<string[]> {
    const categories: string[] = [];
    
    const count = await this.categoryLinks.count();
    for (let i = 0; i < count; i++) {
      const link = this.categoryLinks.nth(i);
      const text = await link.locator('h3').textContent();
      if (text) {
        categories.push(text.trim());
      }
    }
    
    return categories;
  }
  
  /**
   * Navigate to a specific FAQ category
   * @param categoryName Name of the category to navigate to
   */
  async navigateToCategory(categoryName: string): Promise<void> {
    // Find category link by text
    const categoryLink = this.categoryLinks.filter({ hasText: categoryName }).first();
    
    // Click category link
    await categoryLink.click();
    
    // Wait for navigation and section to be in view
    await this.page.waitForTimeout(500);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`faq_category_${categoryName.toLowerCase().replace(/\s+/g, '_')}`);
    }
  }
  
  /**
   * Get count of accordion items (questions)
   */
  async getAccordionItemCount(): Promise<number> {
    return await this.accordionItems.count();
  }
  
  /**
   * Get all question titles
   */
  async getQuestionTitles(): Promise<string[]> {
    const questions: string[] = [];
    
    const count = await this.accordionButtons.count();
    for (let i = 0; i < count; i++) {
      const button = this.accordionButtons.nth(i);
      const text = await button.textContent();
      if (text) {
        questions.push(text.trim());
      }
    }
    
    return questions;
  }
  
  /**
   * Open a specific question by index
   * @param index Index of the question to open (0-based)
   */
  async openQuestion(index: number = 0): Promise<void> {
    // Get accordion button count
    const count = await this.accordionButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Question index out of range: ${index} (total questions: ${count})`);
    }
    
    // Click accordion button to open
    await this.accordionButtons.nth(index).click();
    
    // Wait for animation to complete
    await this.page.waitForTimeout(300);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`faq_question_${index}_open`);
    }
  }
  
  /**
   * Close a specific question by index
   * @param index Index of the question to close (0-based)
   */
  async closeQuestion(index: number = 0): Promise<void> {
    // Get accordion button count
    const count = await this.accordionButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Question index out of range: ${index} (total questions: ${count})`);
    }
    
    // Get accordion button
    const button = this.accordionButtons.nth(index);
    
    // Check if the accordion is already open
    const state = await button.getAttribute('aria-expanded');
    
    if (state === 'true') {
      // Click to close
      await button.click();
      
      // Wait for animation to complete
      await this.page.waitForTimeout(300);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`faq_question_${index}_closed`);
      }
    }
  }
  
  /**
   * Get answer text for a specific question by index
   * @param index Index of the question to get answer for (0-based)
   */
  async getAnswerText(index: number = 0): Promise<string | null> {
    // Get accordion button count
    const count = await this.accordionButtons.count();
    
    // Validate index
    if (index < 0 || index >= count) {
      throw new Error(`Question index out of range: ${index} (total questions: ${count})`);
    }
    
    // Open the question if not already open
    const button = this.accordionButtons.nth(index);
    const state = await button.getAttribute('aria-expanded');
    
    if (state !== 'true') {
      await this.openQuestion(index);
    }
    
    // Find the corresponding content region
    const content = this.accordionContents.nth(index);
    
    // Get content text
    const text = await content.textContent();
    return text ? text.trim() : null;
  }
  
  /**
   * Click on a CTA button by text
   * @param buttonText Text of the button to click
   */
  async clickCTAButton(buttonText: string): Promise<void> {
    // Find button by text
    const button = this.ctaButtons.filter({ hasText: buttonText }).first();
    
    // Click button
    await button.click();
    
    // Wait for navigation
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot(`after_cta_${buttonText.toLowerCase().replace(/\s+/g, '_')}_click`);
    }
  }
  
  /**
   * Test all categories and questions
   */
  async testAllCategoriesAndQuestions(): Promise<void> {
    // Get all category names
    const categories = await this.getCategoryNames();
    
    // Log categories
    console.log('FAQ categories:', categories);
    
    // Skip if no categories
    if (categories.length === 0) {
      return;
    }
    
    // Test each category
    for (const category of categories) {
      // Navigate to category
      await this.navigateToCategory(category);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`faq_category_${category.toLowerCase().replace(/\s+/g, '_')}`);
      }
      
      // Get all question titles after navigating to the category
      const questions = await this.getQuestionTitles();
      console.log(`Category "${category}" has ${questions.length} questions`);
      
      // Test first question in each category
      if (questions.length > 0) {
        await this.openQuestion(0);
        const answerText = await this.getAnswerText(0);
        console.log(`First question answer in "${category}": ${answerText?.substring(0, 50)}...`);
        await this.closeQuestion(0);
      }
    }
  }
  
  /**
   * Test search functionality
   * @param searchTerms Array of terms to search for
   */
  async testSearch(searchTerms: string[] = ['tattoo', 'price', 'age', 'deposit']): Promise<void> {
    for (const term of searchTerms) {
      // Search for term
      await this.searchQuestion(term);
      
      // Get visible questions after search
      const visibleQuestions = await this.getQuestionTitles();
      console.log(`Search for "${term}" returned ${visibleQuestions.length} results`);
      
      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot(`faq_search_${term.toLowerCase()}`);
      }
    }
  }
  
  /**
   * Check responsive layout
   */
  async checkResponsiveness(): Promise<void> {
    // Test desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('faq_desktop');
    }
    
    // Test tablet
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('faq_tablet');
    }
    
    // Test mobile
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.reload();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('faq_mobile');
    }
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 800 });
    await this.page.reload();
  }
}