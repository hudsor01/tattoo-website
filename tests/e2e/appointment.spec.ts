import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TEST_APPOINTMENT } from './test-constants';

/**
 * Test suite for appointment functionality
 * Tests only the functionality that actually exists in the database
 */
test.describe('Appointment Functionality', () => {
  // Create a new Prisma client for database operations
  const prisma = new PrismaClient();
  let testCustomerId: string;
  let testArtistId: string;
  
  test.beforeAll(async () => {
    // Connect to the database
    await prisma.$connect();
    console.log('Connected to database for appointment tests');
    
    // Create a test user for artist association
    const testUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Test Artist User',
        email: `test-artist-${Date.now()}@example.com`,
        role: 'admin',
      },
    });
    
    // Create a test artist
    const testArtist = await prisma.artist.create({
      data: {
        id: uuidv4(),
        userId: testUser.id,
        specialty: 'Traditional',
        bio: 'Test artist bio',
        availableForBooking: true,
        hourlyRate: 150,
      },
    });
    testArtistId = testArtist.id;
    
    // Create a test customer
    const testCustomer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: 'Test',
        lastName: 'Customer',
        email: `test-customer-${Date.now()}@example.com`,
        phone: '5551234567',
      },
    });
    testCustomerId = testCustomer.id;
  });
  
  test.afterAll(async () => {
    // Clean up test data
    if (testCustomerId) {
      await prisma.customer.delete({
        where: { id: testCustomerId },
      }).catch(e => console.warn('Warning: Failed to delete test customer:', e.message));
    }
    
    if (testArtistId) {
      const artist = await prisma.artist.findUnique({
        where: { id: testArtistId },
        include: { user: true },
      });
      
      if (artist) {
        // Delete the artist first
        await prisma.artist.delete({
          where: { id: testArtistId },
        }).catch(e => console.warn('Warning: Failed to delete test artist:', e.message));
        
        // Then delete the associated user
        if (artist.user) {
          await prisma.user.delete({
            where: { id: artist.userId },
          }).catch(e => console.warn('Warning: Failed to delete test user:', e.message));
        }
      }
    }
    
    // Disconnect from the database
    await prisma.$disconnect();
    console.log('Disconnected from database after appointment tests');
  });
  
  test('should create and retrieve an appointment', async () => {
    // Create a test appointment
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // 1 week from now
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // 2 hours later
    
    const appointment = await prisma.appointment.create({
      data: {
        id: uuidv4(),
        title: TEST_APPOINTMENT.title,
        description: TEST_APPOINTMENT.notes,
        startDate,
        endDate,
        status: 'scheduled',
        totalPrice: 250,
        deposit: 75,
        customerId: testCustomerId,
        artistId: testArtistId,
      },
    });
    
    // Verify the appointment was created
    expect(appointment).toBeTruthy();
    expect(appointment.id).toBeTruthy();
    expect(appointment.title).toBe(TEST_APPOINTMENT.title);
    
    // Retrieve the appointment to make sure it's in the database
    const retrievedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    
    // Verify the retrieved appointment matches
    expect(retrievedAppointment).toBeTruthy();
    expect(retrievedAppointment?.title).toBe(TEST_APPOINTMENT.title);
    expect(retrievedAppointment?.customerId).toBe(testCustomerId);
    expect(retrievedAppointment?.artistId).toBe(testArtistId);
    
    // Check appointment duration function
    const durationResult = await prisma.$queryRaw`
      SELECT calculate_appointment_duration(
        ${appointment.startDate}::TIMESTAMP,
        ${appointment.endDate}::TIMESTAMP
      ) AS duration;
    `;
    
    // Expect 120 minutes (2 hours)
    expect(durationResult[0].duration).toBe(120);
    
    // Check appointment availability function
    const availabilityResult = await prisma.$queryRaw`
      SELECT * FROM check_appointment_availability(
        ${testArtistId}::TEXT,
        ${startDate}::TIMESTAMP,
        ${endDate}::TIMESTAMP,
        ${appointment.id}::TEXT
      );
    `;
    
    // Since we've excluded this appointment ID, it should be available
    expect(availabilityResult[0].check_appointment_availability).toBeTruthy();
    expect(availabilityResult[0].check_appointment_availability.is_available).toBe(true);
    
    // Create a conflicting appointment time
    const conflictingStartDate = new Date(startDate);
    const conflictingEndDate = new Date(endDate);
    
    // Check availability without excluding the original appointment
    const conflictResult = await prisma.$queryRaw`
      SELECT * FROM check_appointment_availability(
        ${testArtistId}::TEXT,
        ${conflictingStartDate}::TIMESTAMP,
        ${conflictingEndDate}::TIMESTAMP
      );
    `;
    
    // Should detect a conflict
    expect(conflictResult[0].check_appointment_availability).toBeTruthy();
    expect(conflictResult[0].check_appointment_availability.is_available).toBe(false);
    
    // Clean up - delete the test appointment
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
  
  test('should test cancellation policy function', async () => {
    // Create an appointment for cancellation testing
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10); // 10 days from now
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 2); // 2 hours later
    
    const appointment = await prisma.appointment.create({
      data: {
        id: uuidv4(),
        title: 'Cancellation Test',
        description: 'Testing cancellation policy',
        startDate,
        endDate,
        status: 'scheduled',
        totalPrice: 250,
        deposit: 75,
        customerId: testCustomerId,
        artistId: testArtistId,
      },
    });
    
    // Test cancellation with more than 7 days notice
    const cancellationDate = new Date();
    cancellationDate.setDate(startDate.getDate() - 8); // 8 days before appointment
    
    const cancellationResult = await prisma.$queryRaw`
      SELECT * FROM enforce_cancellation_policy(
        ${appointment.id}::TEXT,
        ${cancellationDate}::TIMESTAMP,
        'Testing cancellation'::TEXT
      );
    `;
    
    // Verify cancellation policy outcomes
    expect(cancellationResult[0].enforce_cancellation_policy).toBeTruthy();
    expect(cancellationResult[0].enforce_cancellation_policy.success).toBe(true);
    expect(cancellationResult[0].enforce_cancellation_policy.fee_percentage).toBe(0); // No fee with 7+ days notice
    expect(cancellationResult[0].enforce_cancellation_policy.deposit_refundable).toBe(true);
    
    // Verify appointment status is updated
    const cancelledAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    expect(cancelledAppointment?.status).toBe('cancelled');
    
    // Clean up - delete the test appointment
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
  
  test('should test pricing calculation', async () => {
    // Test pricing calculation for different tattoo sizes and placements
    const result = await prisma.$queryRaw`
      SELECT * FROM calculate_pricing(
        'medium'::TEXT,
        'arm'::TEXT,
        3::INTEGER,
        ${testArtistId}::TEXT,
        NULL::NUMERIC
      );
    `;
    
    // Verify pricing details
    expect(result[0].calculate_pricing).toBeTruthy();
    const pricing = result[0].calculate_pricing;
    
    // Check pricing structure
    expect(pricing.base_hourly_rate).toBeTruthy();
    expect(pricing.size_factor).toBe(2.0); // medium size
    expect(pricing.placement_factor).toBe(1.0); // arm placement
    expect(pricing.complexity_factor).toBeTruthy();
    expect(pricing.estimated_hours).toBe(3); // medium size default
    expect(pricing.total_price).toBeGreaterThan(0);
    expect(pricing.deposit_amount).toBeGreaterThan(0);
    
    // Verify that deposit is 30% of total price
    expect(pricing.deposit_amount).toBe(Math.round(pricing.total_price * 0.3));
    
    // Test a more complex tattoo placement
    const complexResult = await prisma.$queryRaw`
      SELECT * FROM calculate_pricing(
        'large'::TEXT,
        'ribs'::TEXT,
        5::INTEGER,
        ${testArtistId}::TEXT,
        NULL::NUMERIC
      );
    `;
    
    const complexPricing = complexResult[0].calculate_pricing;
    
    // Verify more complex tattoo is more expensive
    expect(complexPricing.total_price).toBeGreaterThan(pricing.total_price);
    expect(complexPricing.size_factor).toBe(3.5); // large size
    expect(complexPricing.placement_factor).toBe(1.5); // ribs placement (more difficult)
    expect(complexPricing.complexity_factor).toBeGreaterThan(pricing.complexity_factor);
  });
});

/**
 * Test suite for appointment management UI
 */
test.describe('Appointment Management UI', () => {
  test('should require authentication for admin appointment pages', async ({ page }) => {
    // Navigate to appointments page without authentication
    await page.goto('/admin/dashboard/appointments');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login.*/);
  });
  
  test('should display appointment management UI after login', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    
    // Fill in login credentials
    await page.fill('[name="email"]', 'test-admin@example.com');
    await page.fill('[name="password"]', 'Test-Password123!');
    await page.click('button[type="submit"]');
    
    // Navigate to appointments page
    await page.goto('/admin/dashboard/appointments');
    
    // Verify appointments UI components
    await expect(page.locator('h1, h2').filter({ hasText: /appointments/i })).toBeVisible();
    
    // Should have elements for listing appointments
    await expect(page.locator('table, [role="grid"]')).toBeVisible();
  });
});