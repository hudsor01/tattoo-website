import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

/**
 * Test suite for all SQL functions in the database
 * Tests only the functions we created - not the actual database tables
 * This allows us to verify business logic works even if the tables don't match the schema
 */
test.describe('SQL Functions', () => {
  // Create a new Prisma client for database operations
  const prisma = new PrismaClient();
  
  test.beforeAll(async () => {
    // Apply SQL functions to ensure they're available
    try {
      console.log('Applying SQL test functions...');
      execSync('bash scripts/apply-test-functions.sh', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error applying SQL functions:', error);
    }

    // Connect to the database
    await prisma.$connect();
    console.log('Connected to database for SQL function tests');
  });
  
  test.afterAll(async () => {
    // Disconnect from the database
    await prisma.$disconnect();
    console.log('Disconnected from database after SQL function tests');
  });
  
  test('database connection test using test_connection function', async () => {
    // Call the test_connection function
    try {
      const result = await prisma.$queryRaw`
        SELECT test_connection();
      `;
      
      // Verify the function returns a success message
      expect(result[0].test_connection).toBe('Database connection successful!');
    } catch (error) {
      console.error('Error in test connection test:', error);
      throw error;
    }
  });
  
  test('calculate_appointment_duration function should calculate minutes between timestamps', async () => {
    try {
      // Test with 2 hours difference
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 120 * 60 * 1000); 
      
      const result = await prisma.$queryRaw`
        SELECT calculate_appointment_duration(
          ${now}::TIMESTAMP,
          ${twoHoursLater}::TIMESTAMP
        ) AS duration;
      `;
      
      // Verify 2 hours = 120 minutes
      expect(result[0].duration).toBe(120);
      
      // Test with 30 minutes difference
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
      
      const result2 = await prisma.$queryRaw`
        SELECT calculate_appointment_duration(
          ${now}::TIMESTAMP,
          ${thirtyMinutesLater}::TIMESTAMP
        ) AS duration;
      `;
      
      // Verify 30 minutes
      expect(result2[0].duration).toBe(30);
    } catch (error) {
      console.error('Error in calculate_appointment_duration test:', error);
      throw error;
    }
  });
  
  test('calculate_pricing function should calculate appropriate pricing', async () => {
    try {
      // Test with medium arm tattoo, level 3 complexity
      const result = await prisma.$queryRaw`
        SELECT * FROM calculate_pricing(
          'medium'::TEXT,
          'arm'::TEXT,
          3::INTEGER,
          NULL::TEXT,
          150::NUMERIC
        );
      `;
      
      // Extract the pricing object
      const pricing = result[0].calculate_pricing;
      
      // Verify pricing structure
      expect(pricing.base_hourly_rate).toBe(150);
      expect(pricing.size_factor).toBe(2.0); // medium size
      expect(pricing.placement_factor).toBe(1.0); // arm placement
      expect(pricing.complexity_factor).toBe(1.15); // level 3 complexity
      expect(pricing.estimated_hours).toBe(3); // medium size default
      
      // Verify total price calculation
      const expectedTotal = Math.round(150 * 3 * 2.0 * 1.0 * 1.15);
      expect(pricing.total_price).toBe(expectedTotal);
      
      // Verify deposit is 30% of total price
      expect(pricing.deposit_amount).toBe(Math.round(expectedTotal * 0.3));
      
      // Test a more complex tattoo placement
      const result2 = await prisma.$queryRaw`
        SELECT * FROM calculate_pricing(
          'large'::TEXT,
          'ribs'::TEXT,
          5::INTEGER,
          NULL::TEXT,
          150::NUMERIC
        );
      `;
      
      const complexPricing = result2[0].calculate_pricing;
      
      // Verify more complex tattoo has expected factors
      expect(complexPricing.size_factor).toBe(3.5); // large size
      expect(complexPricing.placement_factor).toBe(1.5); // ribs placement (more difficult)
      expect(complexPricing.complexity_factor).toBe(1.25); // level 5 complexity
      
      // Verify more complex tattoo is more expensive
      expect(complexPricing.total_price).toBeGreaterThan(pricing.total_price);
    } catch (error) {
      console.error('Error in calculate_pricing test:', error);
      throw error;
    }
  });
  
  test('check_appointment_availability function should detect conflicts', async () => {
    try {
      // Create two timestamps that don't conflict with anything
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days in the future
      futureDate.setHours(10, 0, 0, 0); // 10:00 AM
      
      const futureEndDate = new Date(futureDate);
      futureEndDate.setHours(12, 0, 0, 0); // 12:00 PM
      
      // Test with non-existent artist ID (should be available)
      const nonExistentArtistId = 'non-existent-id';
      
      const result = await prisma.$queryRaw`
        SELECT * FROM check_appointment_availability(
          ${nonExistentArtistId}::TEXT,
          ${futureDate}::TIMESTAMP,
          ${futureEndDate}::TIMESTAMP,
          NULL::TEXT
        );
      `;
      
      // Verify availability function responds correctly
      expect(result[0].check_appointment_availability).toBeTruthy();
      expect(result[0].check_appointment_availability.is_available).toBe(true);
    } catch (error) {
      console.error('Error in check_appointment_availability test:', error);
      throw error;
    }
  });

  test('enforce_cancellation_policy should handle non-existent tables gracefully', async () => {
    try {
      // Test with non-existent appointment ID (should indicate table doesn't exist)
      const futureDate = new Date();
      
      const result = await prisma.$queryRaw`
        SELECT * FROM enforce_cancellation_policy(
          'non-existent-id'::TEXT,
          ${futureDate}::TIMESTAMP,
          'Testing cancellation policy'::TEXT
        );
      `;
      
      // Function should either return table doesn't exist message
      // or appointment not found message, depending on if table exists
      if (result[0].enforce_cancellation_policy.message) {
        expect(['Appointment table does not exist yet', 'Appointment not found']).toContain(
          result[0].enforce_cancellation_policy.message
        );
      }
      
      expect(result[0].enforce_cancellation_policy.success).toBe(false);
    } catch (error) {
      console.error('Error in enforce_cancellation_policy test:', error);
      throw error;
    }
  });
});