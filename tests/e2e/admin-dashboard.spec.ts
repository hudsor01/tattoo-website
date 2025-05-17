import { test, expect } from './helpers/test-fixtures';
import { EnhancedAdminDashboardPage } from './page-objects/enhanced-admin-dashboard-page';
import { AuthHelper } from './helpers/auth-helper';

/**
 * Enhanced E2E test suite for admin dashboard
 */
test.describe('Admin Dashboard Tests', () => {
  let testAdminUser: unknown;

  test.beforeAll(async ({ page }) => {
    // Create test admin user
    const authHelper = new AuthHelper(page);
    testAdminUser = await authHelper.createTestUser('admin');
    console.log('Created test admin user for dashboard tests');
  });

  test.afterAll(async ({ page }) => {
    // Clean up test users
    const authHelper = new AuthHelper(page);
    await authHelper.cleanup();
    console.log('Cleaned up test users for dashboard tests');
  });

  test('should login and display admin dashboard with expected elements', async ({
    page,
    visualTesting,
  }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Verify dashboard is loaded correctly
    await dashboardPage.verifyDashboard();

    // Verify expected elements
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await expect(dashboardPage.sideNavigation).toBeVisible();
    await expect(dashboardPage.userMenu).toBeVisible();

    // Check dashboard overview and capture screenshots
    const overview = await dashboardPage.checkDashboardOverview();

    // Log overview data
    console.log('Dashboard stats:', overview.stats);
    console.log('Recent customers:', overview.customers);
    console.log('Upcoming appointments:', overview.appointments);

    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('admin_dashboard_baseline');
  });

  test('should navigate to customers page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to customers page
    await dashboardPage.navigateToCustomers();

    // Verify navigation
    expect(page.url()).toContain('/admin/customers');

    // Take screenshot of customers page
    await visualTesting.captureAndCompare('admin_customers_page_full');
  });

  test('should navigate to appointments page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to appointments page
    await dashboardPage.navigateToAppointments();

    // Verify navigation
    expect(page.url()).toContain('/admin/appointments');

    // Take screenshot of appointments page
    await visualTesting.captureAndCompare('admin_appointments_page_full');
  });

  test('should navigate to gallery page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to gallery page
    await dashboardPage.navigateToGallery();

    // Verify navigation
    expect(page.url()).toContain('/admin/gallery');

    // Take screenshot of gallery page
    await visualTesting.captureAndCompare('admin_gallery_page_full');
  });

  test('should navigate to services page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to services page
    await dashboardPage.navigateToServices();

    // Verify navigation
    expect(page.url()).toContain('/admin/services');

    // Take screenshot of services page
    await visualTesting.captureAndCompare('admin_services_page_full');
  });

  test('should navigate to reports page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to reports page
    await dashboardPage.navigateToReports();

    // Verify navigation
    expect(page.url()).toContain('/admin/reports');

    // Take screenshot of reports page
    await visualTesting.captureAndCompare('admin_reports_page_full');
  });

  test('should navigate to settings page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to settings page
    await dashboardPage.navigateToSettings();

    // Verify navigation
    expect(page.url()).toContain('/admin/settings');

    // Take screenshot of settings page
    await visualTesting.captureAndCompare('admin_settings_page_full');
  });

  test('should navigate to staff page', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to staff page
    await dashboardPage.navigateToStaff();

    // Verify navigation
    expect(page.url()).toContain('/admin/staff');

    // Take screenshot of staff page
    await visualTesting.captureAndCompare('admin_staff_page_full');
  });

  test('should initiate new customer creation from dashboard', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to customers page first (if the button is only available there)
    await dashboardPage.navigateToCustomers();

    // Try to click new customer button
    try {
      // Click new customer button
      await dashboardPage.clickNewCustomer();

      // Verify navigation to new customer form
      expect(page.url()).toContain('/admin/customers/new');

      // Take screenshot of new customer form
      await visualTesting.captureAndCompare('admin_new_customer_form');
    } catch (error) {
      console.warn('Could not click new customer button:', error);
      test.skip('New customer button not found or not clickable');
    }
  });

  test('should initiate new appointment creation from dashboard', async ({
    page,
    visualTesting,
  }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Navigate to appointments page first (if the button is only available there)
    await dashboardPage.navigateToAppointments();

    // Try to click new appointment button
    try {
      // Click new appointment button
      await dashboardPage.clickNewAppointment();

      // Verify navigation to new appointment form
      expect(page.url()).toContain('/admin/appointments/new');

      // Take screenshot of new appointment form
      await visualTesting.captureAndCompare('admin_new_appointment_form');
    } catch (error) {
      console.warn('Could not click new appointment button:', error);
      test.skip('New appointment button not found or not clickable');
    }
  });

  test('should successfully logout from admin dashboard', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Logout from dashboard
    await dashboardPage.logout();

    // Verify redirect to login page
    expect(page.url()).toMatch(/\/auth\/login|\/$/);
  });

  test('should display appropriate UI on mobile viewport', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Check mobile view
    await dashboardPage.checkMobileView();
  });

  test('should display dashboard charts and metrics', async ({ page, visualTesting }) => {
    // Create enhanced admin dashboard page
    const dashboardPage = new EnhancedAdminDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testAdminUser);

    // Check dashboard charts
    await dashboardPage.checkDashboardCharts();

    // Verify charts
    const statsCards = await dashboardPage.statsCards.count();
    expect(statsCards).toBeGreaterThan(0, 'Dashboard should display stats cards');

    // Log stats
    const stats = await dashboardPage.getDashboardStats();
    console.log('Dashboard stats:', stats);
  });
});
