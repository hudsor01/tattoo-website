import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { VisualTesting } from '../helpers/visual-testing';
import { AuthHelper, TestUser } from '../helpers/auth-helper';

/**
 * Enhanced Admin Dashboard Page Object for E2E tests
 */
export class EnhancedAdminDashboardPage extends BasePage {
  // Navigation elements
  readonly appHeader: Locator;
  readonly userMenu: Locator;
  readonly sideNavigation: Locator;
  readonly logoutButton: Locator;

  // Dashboard elements
  readonly dashboardTitle: Locator;
  readonly statsCards: Locator;
  readonly upcomingAppointments: Locator;
  readonly recentCustomers: Locator;
  readonly revenueChart: Locator;

  // Admin navigation elements
  readonly customersLink: Locator;
  readonly appointmentsLink: Locator;
  readonly galleryLink: Locator;
  readonly servicesLink: Locator;
  readonly reportsLink: Locator;
  readonly settingsLink: Locator;
  readonly staffLink: Locator;

  // Action buttons
  readonly newCustomerButton: Locator;
  readonly newAppointmentButton: Locator;
  readonly exportButton: Locator;

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
    this.sideNavigation = page.locator('nav, .sidebar, [data-testid="admin-sidebar"]');
    this.logoutButton = page.locator('button[data-testid="logout-button"]');

    this.dashboardTitle = page.locator(
      'h1:has-text("Dashboard"), [data-testid="admin-dashboard-title"]',
    );
    this.statsCards = page.locator('[data-testid="stats-card"]');
    this.upcomingAppointments = page.locator(
      '[data-testid="upcoming-appointments"], [data-testid="admin-appointments"]',
    );
    this.recentCustomers = page.locator('[data-testid="recent-customers"]');
    this.revenueChart = page.locator('[data-testid="revenue-chart"]');

    // Admin navigation links
    this.customersLink = page.locator('a:has-text("Customers"), a[href*="customers"]');
    this.appointmentsLink = page.locator('a:has-text("Appointments"), a[href*="appointments"]');
    this.galleryLink = page.locator('a:has-text("Gallery"), a[href*="gallery"]');
    this.servicesLink = page.locator('a:has-text("Services"), a[href*="services"]');
    this.reportsLink = page.locator('a:has-text("Reports"), a[href*="reports"]');
    this.settingsLink = page.locator('a:has-text("Settings"), a[href*="settings"]');
    this.staffLink = page.locator('a:has-text("Staff"), a[href*="staff"]');

    // Action buttons
    this.newCustomerButton = page.locator(
      'button:has-text("New Customer"), a:has-text("New Customer")',
    );
    this.newAppointmentButton = page.locator(
      'button:has-text("New Appointment"), a:has-text("New Appointment")',
    );
    this.exportButton = page.locator('button:has-text("Export"), a:has-text("Export")');
  }

  /**
   * Set visual testing helper
   */
  setVisualTesting(visualTesting: VisualTesting): EnhancedAdminDashboardPage {
    this.visualTesting = visualTesting;
    return this;
  }

  /**
   * Navigate to admin dashboard
   */
  async goto(): Promise<void> {
    await this.page.goto('/admin');

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_initial');
    }
  }

  /**
   * Login and navigate to admin dashboard
   * @param user Test admin user to login with
   */
  async loginAndGotoDashboard(user: TestUser): Promise<void> {
    await this.authHelper.login(user);
    await this.goto();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_after_login');
    }
  }

  /**
   * Verify admin dashboard is loaded correctly
   */
  async verifyDashboard(): Promise<void> {
    // Verify key elements are visible
    await expect(this.dashboardTitle).toBeVisible();
    await expect(this.appHeader).toBeVisible();
    await expect(this.sideNavigation).toBeVisible();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_verification');
    }
  }

  /**
   * Get stats from dashboard cards
   */
  async getDashboardStats(): Promise<{
    customersCount?: string;
    appointmentsCount?: string;
    revenueAmount?: string;
    otherStats?: Record<string, string>;
  }> {
    const stats: Record<string, string> = {};
    const otherStats: Record<string, string> = {};

    try {
      // Get all stats cards
      const cards = await this.statsCards.all();

      for (const card of cards) {
        const titleElement = card.locator('h3, .card-title');
        const valueElement = card.locator('.card-value, .stats-value');

        if ((await titleElement.count()) > 0 && (await valueElement.count()) > 0) {
          const title = ((await titleElement.textContent()) || '').trim().toLowerCase();
          const value = ((await valueElement.textContent()) || '').trim();

          if (title.includes('customer')) {
            stats.customersCount = value;
          } else if (title.includes('appointment')) {
            stats.appointmentsCount = value;
          } else if (title.includes('revenue')) {
            stats.revenueAmount = value;
          } else {
            otherStats[title] = value;
          }
        }
      }

      stats.otherStats = otherStats;
    } catch (error) {
      console.warn('Error getting dashboard stats:', error);
    }

    return stats;
  }

  /**
   * Get list of recent customers
   */
  async getRecentCustomers(): Promise<string[]> {
    const customers: string[] = [];

    try {
      // Check if recent customers section exists
      if ((await this.recentCustomers.count()) > 0) {
        // Get customer rows
        const customerRows = this.recentCustomers.locator('tr, .customer-row');
        const count = await customerRows.count();

        for (let i = 0; i < count; i++) {
          const row = customerRows.nth(i);
          const nameElement = row.locator('.customer-name, td:first-child');

          if ((await nameElement.count()) > 0) {
            const name = await nameElement.textContent();
            if (name) {
              customers.push(name.trim());
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error getting recent customers:', error);
    }

    return customers;
  }

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments(): Promise<
    Array<{
      customer?: string;
      date?: string;
      time?: string;
      service?: string;
    }>
  > {
    const appointments: Array<{
      customer?: string;
      date?: string;
      time?: string;
      service?: string;
    }> = [];

    try {
      // Check if upcoming appointments section exists
      if ((await this.upcomingAppointments.count()) > 0) {
        // Get appointment rows
        const appointmentRows = this.upcomingAppointments.locator('tr, .appointment-row');
        const count = await appointmentRows.count();

        for (let i = 0; i < count; i++) {
          const row = appointmentRows.nth(i);
          const customerElement = row.locator('.appointment-customer, td:nth-child(1)');
          const dateElement = row.locator('.appointment-date, td:nth-child(2)');
          const timeElement = row.locator('.appointment-time, td:nth-child(3)');
          const serviceElement = row.locator('.appointment-service, td:nth-child(4)');

          const appointment: {
            customer?: string;
            date?: string;
            time?: string;
            service?: string;
          } = {};

          if ((await customerElement.count()) > 0) {
            appointment.customer = (await customerElement.textContent()) || undefined;
          }

          if ((await dateElement.count()) > 0) {
            appointment.date = (await dateElement.textContent()) || undefined;
          }

          if ((await timeElement.count()) > 0) {
            appointment.time = (await timeElement.textContent()) || undefined;
          }

          if ((await serviceElement.count()) > 0) {
            appointment.service = (await serviceElement.textContent()) || undefined;
          }

          if (Object.keys(appointment).length > 0) {
            appointments.push(appointment);
          }
        }
      }
    } catch (error) {
      console.warn('Error getting upcoming appointments:', error);
    }

    return appointments;
  }

  /**
   * Navigate to customers page
   */
  async navigateToCustomers(): Promise<void> {
    await this.customersLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_customers_page');
    }
  }

  /**
   * Navigate to appointments page
   */
  async navigateToAppointments(): Promise<void> {
    await this.appointmentsLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_appointments_page');
    }
  }

  /**
   * Navigate to gallery page
   */
  async navigateToGallery(): Promise<void> {
    await this.galleryLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_gallery_page');
    }
  }

  /**
   * Navigate to services page
   */
  async navigateToServices(): Promise<void> {
    await this.servicesLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_services_page');
    }
  }

  /**
   * Navigate to reports page
   */
  async navigateToReports(): Promise<void> {
    await this.reportsLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_reports_page');
    }
  }

  /**
   * Navigate to settings page
   */
  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_settings_page');
    }
  }

  /**
   * Navigate to staff page
   */
  async navigateToStaff(): Promise<void> {
    await this.staffLink.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_staff_page');
    }
  }

  /**
   * Click new customer button
   */
  async clickNewCustomer(): Promise<void> {
    await this.newCustomerButton.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_new_customer_page');
    }
  }

  /**
   * Click new appointment button
   */
  async clickNewAppointment(): Promise<void> {
    await this.newAppointmentButton.click();
    await this.waitForPageLoad();

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_new_appointment_page');
    }
  }

  /**
   * Click export button
   */
  async clickExport(): Promise<void> {
    // Check if export button exists
    if ((await this.exportButton.count()) > 0) {
      await this.exportButton.click();

      // Wait for export dialog or download to start
      await this.page.waitForTimeout(1000);

      // Take screenshot if visual testing is enabled
      if (this.visualTesting) {
        await this.visualTesting.captureScreenshot('admin_export_dialog');
      }
    } else {
      console.warn('Export button not found');
    }
  }

  /**
   * Logout from admin dashboard
   */
  async logout(): Promise<void> {
    // Open user menu if it exists
    if ((await this.userMenu.count()) > 0) {
      await this.userMenu.click();
    }

    // Click logout button
    await this.logoutButton.click();

    // Wait for redirect to login page
    await this.page.waitForURL(/\/auth\/login|\/$/);

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('after_admin_logout');
    }

    // Verify logout
    const isLoggedIn = await this.authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(false, 'Admin should be logged out');
  }

  /**
   * Check dashboard charts and metrics with screenshots
   */
  async checkDashboardCharts(): Promise<void> {
    // Take screenshot of revenue chart if it exists
    if ((await this.revenueChart.count()) > 0 && this.visualTesting) {
      await this.visualTesting.captureScreenshot(
        'admin_revenue_chart',
        '[data-testid="revenue-chart"]',
      );
    }

    // Take screenshot of stats cards
    if ((await this.statsCards.count()) > 0 && this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_stats_cards');
    }
  }

  /**
   * Check the admin dashboard overview with visual verification
   */
  async checkDashboardOverview(): Promise<{
    stats: unknown;
    customers: string[];
    appointments: unknown[];
  }> {
    // Get dashboard stats
    const stats = await this.getDashboardStats();

    // Get recent customers
    const customers = await this.getRecentCustomers();

    // Get upcoming appointments
    const appointments = await this.getUpcomingAppointments();

    // Take screenshots of dashboard sections
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_full', undefined, {
        fullPage: true,
      });

      // Check charts and metrics
      await this.checkDashboardCharts();

      // Check recent customers if available
      if ((await this.recentCustomers.count()) > 0) {
        await this.visualTesting.captureScreenshot(
          'admin_recent_customers',
          '[data-testid="recent-customers"]',
        );
      }

      // Check upcoming appointments if available
      if ((await this.upcomingAppointments.count()) > 0) {
        await this.visualTesting.captureScreenshot(
          'admin_upcoming_appointments',
          '[data-testid="upcoming-appointments"], [data-testid="admin-appointments"]',
        );
      }
    }

    return {
      stats,
      customers,
      appointments,
    };
  }

  /**
   * Check admin dashboard on mobile viewport
   */
  async checkMobileView(): Promise<void> {
    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });

    // Take screenshot if visual testing is enabled
    if (this.visualTesting) {
      await this.visualTesting.captureScreenshot('admin_dashboard_mobile');

      // Check if mobile menu button exists
      const mobileMenuButton = this.page.locator(
        'button[aria-label="Menu"], button.navbar-toggler',
      );

      if ((await mobileMenuButton.count()) > 0) {
        // Click mobile menu button
        await mobileMenuButton.click();

        // Take screenshot of open mobile menu
        await this.visualTesting.captureScreenshot('admin_mobile_menu_open');
      }
    }

    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 800 });
  }
}
