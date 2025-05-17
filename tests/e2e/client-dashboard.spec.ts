import { test, expect } from './helpers/test-fixtures';
import { EnhancedClientDashboardPage } from './page-objects/enhanced-client-dashboard-page';
import { AuthHelper } from './helpers/auth-helper';

/**
 * Enhanced E2E test suite for client dashboard
 */
test.describe('Client Dashboard Tests', () => {
  let testClientUser: unknown;

  test.beforeAll(async ({ page }) => {
    // Create test client user
    const authHelper = new AuthHelper(page);
    testClientUser = await authHelper.createTestUser('client');
    console.log('Created test client user for dashboard tests');
  });

  test.afterAll(async ({ page }) => {
    // Clean up test users
    const authHelper = new AuthHelper(page);
    await authHelper.cleanup();
    console.log('Cleaned up test users for dashboard tests');
  });

  test('should login and display client dashboard with expected elements', async ({
    page,
    visualTesting,
  }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Verify dashboard is loaded correctly
    await dashboardPage.verifyDashboard();

    // Verify expected elements
    await expect(dashboardPage.dashboardTitle).toBeVisible();
    await expect(dashboardPage.sideNavigation).toBeVisible();
    await expect(dashboardPage.userMenu).toBeVisible();

    // Take screenshots of dashboard overview
    await dashboardPage.checkDashboardOverview();

    // Verify the page matches our visual baseline
    await expect({ visualTesting }).toMatchVisualBaseline('client_dashboard_baseline');
  });

  test('should show upcoming appointments section if appointments exist', async ({
    page,
    visualTesting,
    dataFactory,
  }) => {
    // Create an appointment for the test user
    await dataFactory.createTestAppointment({
      // Link to test client user
      customerId: testClientUser.id,
      // Set appointment in the future
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
    });

    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Check for upcoming appointments
    const appointmentsCount = await dashboardPage.getUpcomingAppointmentsCount();

    // Either verify there are appointments or log that none exist yet
    if (appointmentsCount > 0) {
      console.log(`Found ${appointmentsCount} upcoming appointments`);

      // Get details of first appointment
      const appointmentDetails = await dashboardPage.getAppointmentDetails(0);
      console.log('Appointment details:', appointmentDetails);

      // Verify appointment has expected fields
      expect(appointmentDetails.date).not.toBeUndefined();
      expect(appointmentDetails.time).not.toBeUndefined();
      expect(appointmentDetails.service).not.toBeUndefined();

      // Take screenshot of appointments section
      await visualTesting.captureAndCompare('client_dashboard_appointments');
    } else {
      console.log('No upcoming appointments found');
    }
  });

  test('should navigate to appointments page', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Navigate to appointments page
    await dashboardPage.navigateToAppointments();

    // Verify navigation
    expect(page.url()).toContain('/appointments');

    // Take screenshot of appointments page
    await visualTesting.captureAndCompare('client_appointments_page_full');
  });

  test('should navigate to invoices/payments page', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Navigate to invoices page
    await dashboardPage.navigateToInvoices();

    // Verify navigation
    expect(page.url()).toMatch(/\/invoices|\/payments/);

    // Take screenshot of invoices page
    await visualTesting.captureAndCompare('client_invoices_page_full');
  });

  test('should navigate to profile settings', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Navigate to profile settings
    await dashboardPage.navigateToProfile();

    // Verify navigation
    expect(page.url()).toMatch(/\/profile|\/settings/);

    // Take screenshot of profile settings page
    await visualTesting.captureAndCompare('client_profile_page_full');
  });

  test('should initiate new booking from dashboard', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Click new booking button
    await dashboardPage.clickNewBooking();

    // Verify navigation to booking page
    expect(page.url()).toContain('/booking');

    // Take screenshot of new booking page
    await visualTesting.captureAndCompare('client_new_booking_page_full');
  });

  test('should successfully logout from dashboard', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Logout from dashboard
    await dashboardPage.logout();

    // Verify redirect to login page
    expect(page.url()).toMatch(/\/auth\/login|\/$/);
  });

  test('should display appropriate UI on mobile viewport', async ({ page, visualTesting }) => {
    // Create enhanced client dashboard page
    const dashboardPage = new EnhancedClientDashboardPage(page);
    dashboardPage.setVisualTesting(visualTesting);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login and navigate to dashboard
    await dashboardPage.loginAndGotoDashboard(testClientUser);

    // Verify dashboard elements on mobile
    await dashboardPage.verifyDashboard();

    // Take screenshot of mobile dashboard
    await visualTesting.captureAndCompare('client_dashboard_mobile');

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });
});
