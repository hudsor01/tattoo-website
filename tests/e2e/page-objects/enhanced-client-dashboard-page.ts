import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';
import { AuthHelper, TestUser } from '../helpers/auth-helper';

/**
 * Enhanced Client Dashboard Page Object for E2E tests
 */
export class EnhancedClientDashboardPage extends BasePage {
  // Navigation elements
  readonly appHeader: Locator;
  readonly userMenu: Locator;
  readonly sideNavigation: Locator;
  readonly logoutButton: Locator;
  
  // Dashboard elements
  readonly dashboardTitle: Locator;
  readonly upcomingAppointments: Locator;
  readonly appointmentCards: Locator;
  readonly pendingInvoices: Locator;
  readonly newBookingButton: Locator;
  readonly profileSettingsButton: Locator;
  
  // Page sections
  readonly notificationsSection: Locator;
  readonly appointmentsSection: Locator;
  readonly invoicesSection: Locator;
  readonly activitySection: Locator;
  
  // Auth helper
  private authHelper: AuthHelper;
  
  // Visual testing
  private visualTesting: VisualTesting | null = null;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize auth helper
    this.authHelper = new AuthHelper(page);
    
    // Initialize locators
    this.appHeader = page.locator('header');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.sideNavigation = page.locator('nav, .sidebar');
    this.logoutButton = page.locator('button[data-testid="logout-button"]');
    
    this.dashboardTitle = page.locator('h1:has-text("Dashboard"), [data-testid="dashboard-title"]');
    this.upcomingAppointments = page.locator('[data-testid="upcoming-appointments"]');
    this.appointmentCards = page.locator('[data-testid="appointment-card"]');
    this.pendingInvoices = page.locator('[data-testid="pending-invoices"]');
    this.newBookingButton = page.locator('a:has-text("New Booking"), button:has-text("New Booking")');
    this.profileSettingsButton = page.locator('a:has-text("Profile"), button:has-text("Profile"), a:has-text("Settings"), button:has-text("Settings")');
    
    this.notificationsSection = page.locator('[data-testid="notifications-section"]');
    this.appointmentsSection = page.locator('[data-testid="appointments-section"]');
    this.invoicesSection = page.locator('[data-testid="invoices-section"]');
    this.activitySection = page.locator('[data-testid="activity-section"]');
  }
  
  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedClientDashboardPage {
    this.visualTesting = visualTesting;
    return this;
  }
  
  /**
   * Navigate to client dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_dashboard_initial');
    }
  }
  
  /**
   * Login and navigate to dashboard
   * @param user Test user to login with
   */
  async loginAndGotoDashboard(user: TestUser): Promise<void> {
    await this.authHelper.login(user);
    await this.goto();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_dashboard_after_login');
    }
  }
  
  /**
   * Verify dashboard is loaded correctly
   */
  async verifyDashboard(): Promise<void> {
    // Verify key elements are visible
    await expect(this.dashboardTitle).toBeVisible();
    await expect(this.appHeader).toBeVisible();
    await expect(this.sideNavigation).toBeVisible();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_dashboard_verification');
    }
  }
  
  /**
   * Get number of upcoming appointments
   */
  async getUpcomingAppointmentsCount(): Promise<number> {
    try {
      return await this.appointmentCards.count();
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Get appointment details at specific index
   * @param index Index of appointment (0-based)
   */
  async getAppointmentDetails(index: number = 0): Promise<{
    date?: string;
    time?: string;
    service?: string;
    artist?: string;
    status?: string;
  }> {
    try {
      const appointmentCard = this.appointmentCards.nth(index);
      
      // Extract details from the appointment card
      const date = await appointmentCard.locator('[data-testid="appointment-date"]').textContent();
      const time = await appointmentCard.locator('[data-testid="appointment-time"]').textContent();
      const service = await appointmentCard.locator('[data-testid="appointment-service"]').textContent();
      const artist = await appointmentCard.locator('[data-testid="appointment-artist"]').textContent();
      const status = await appointmentCard.locator('[data-testid="appointment-status"]').textContent();
      
      return {
        date: date?.trim(),
        time: time?.trim(),
        service: service?.trim(),
        artist: artist?.trim(),
        status: status?.trim(),
      };
    } catch (error) {
      console.warn('Error getting appointment details:', error);
      return {};
    }
  }
  
  /**
   * Click on an appointment card
   * @param index Index of appointment (0-based)
   */
  async clickAppointment(index: number = 0): Promise<void> {
    await this.appointmentCards.nth(index).click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_appointment_click');
    }
  }
  
  /**
   * Open user menu
   */
  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('user_menu_open');
    }
  }
  
  /**
   * Logout from dashboard
   */
  async logout(): Promise<void> {
    // Open user menu if it exists
    if (await this.userMenu.count() > 0) {
      await this.openUserMenu();
    }
    
    // Click logout button
    await this.logoutButton.click();
    
    // Wait for redirect to login page
    await this.page.waitForURL(/\/auth\/login|\/$/);
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_logout');
    }
    
    // Verify logout
    const isLoggedIn = await this.authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(false, 'User should be logged out');
  }
  
  /**
   * Navigate to appointments page
   */
  async navigateToAppointments(): Promise<void> {
    const appointmentsLink = this.page.locator('a:has-text("Appointments")').first();
    await appointmentsLink.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_appointments_page');
    }
  }
  
  /**
   * Navigate to invoices/payments page
   */
  async navigateToInvoices(): Promise<void> {
    const invoicesLink = this.page.locator('a:has-text("Invoices"), a:has-text("Payments")').first();
    await invoicesLink.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_invoices_page');
    }
  }
  
  /**
   * Navigate to profile settings
   */
  async navigateToProfile(): Promise<void> {
    await this.profileSettingsButton.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_profile_page');
    }
  }
  
  /**
   * Click new booking button
   */
  async clickNewBooking(): Promise<void> {
    await this.newBookingButton.click();
    await this.waitForPageLoad();
    
    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('client_new_booking_page');
    }
  }
  
  /**
   * Check if there are notifications
   */
  async hasNotifications(): Promise<boolean> {
    return await this.notificationsSection.count() > 0;
  }
  
  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    try {
      const notificationBadge = this.page.locator('[data-testid="notification-badge"]');
      const badgeText = await notificationBadge.textContent();
      return badgeText ? parseInt(badgeText) : 0;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Check dashboard overview with screenshots
   */
  async checkDashboardOverview(): Promise<void> {
    // Take screenshot of each dashboard section
    if (this.visualTesting) {
      if (await this.appointmentsSection.count() > 0) {
        await this.visualTesting.captureScreenshot('dashboard_appointments_section', '[data-testid="appointments-section"]');
      }
      
      if (await this.invoicesSection.count() > 0) {
        await this.visualTesting.captureScreenshot('dashboard_invoices_section', '[data-testid="invoices-section"]');
      }
      
      if (await this.notificationsSection.count() > 0) {
        await this.visualTesting.captureScreenshot('dashboard_notifications_section', '[data-testid="notifications-section"]');
      }
      
      if (await this.activitySection.count() > 0) {
        await this.visualTesting.captureScreenshot('dashboard_activity_section', '[data-testid="activity-section"]');
      }
    }
  }
}
