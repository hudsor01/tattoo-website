import { test, expect } from './setup';
import { execSync } from 'child_process';

test.describe('PostgreSQL Business Logic Functions', () => {
  test.beforeAll(async () => {
    // Make sure the business logic functions are loaded
    try {
      execSync('bash scripts/apply-business-logic.sh', { stdio: 'pipe' });
    } catch (error) {
      console.error('Failed to apply business logic functions:', error);
    }
  });

  test('should validate customer data correctly', async ({ prisma }) => {
    // Test valid data
    const validResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        'John'::TEXT,
        'Doe'::TEXT,
        'john.doe@example.com'::TEXT,
        '5551234567'::TEXT,
        NULL::DATE
      );
    `;
    
    // Verify validation results
    expect(validResult[0].is_valid).toBe(true);
    expect(validResult[0].errors.length).toBe(0);
    expect(validResult[0].normalized_data.first_name).toBe('John');
    expect(validResult[0].normalized_data.last_name).toBe('Doe');
    expect(validResult[0].normalized_data.email).toBe('john.doe@example.com');
    
    // Test invalid data - missing required fields
    const invalidResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        ''::TEXT,
        'Doe'::TEXT,
        NULL::TEXT,
        NULL::TEXT,
        NULL::DATE
      );
    `;
    
    // Verify validation fails with appropriate errors
    expect(invalidResult[0].is_valid).toBe(false);
    expect(invalidResult[0].errors.length).toBeGreaterThan(0);
    expect(invalidResult[0].errors).toContain('First name is required');
    expect(invalidResult[0].errors).toContain('Either email or phone is required');
    
    // Test invalid email format
    const invalidEmailResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        'John'::TEXT,
        'Doe'::TEXT,
        'not-an-email'::TEXT,
        NULL::TEXT,
        NULL::DATE
      );
    `;
    
    expect(invalidEmailResult[0].is_valid).toBe(false);
    expect(invalidEmailResult[0].errors).toContain('Invalid email format');
    
    // Test age validation
    const today = new Date();
    const seventeenYearsAgo = new Date(today);
    seventeenYearsAgo.setFullYear(today.getFullYear() - 17);
    
    const underageResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        'Young'::TEXT,
        'Person'::TEXT,
        'young@example.com'::TEXT,
        NULL::TEXT,
        ${seventeenYearsAgo}::DATE
      );
    `;
    
    expect(underageResult[0].is_valid).toBe(false);
    expect(underageResult[0].errors).toContain('Customer must be at least 18 years old');
  });
  
  test('should detect potential duplicate customers', async ({ prisma }) => {
    // Create a test customer
    const testCustomer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        firstName: 'Duplicate',
        lastName: 'Tester',
        email: 'duplicate.test@example.com',
        phone: '5551112222',
      },
    });
    
    // Test duplicate detection by email
    const duplicateEmailResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        'New'::TEXT,
        'Customer'::TEXT,
        'duplicate.test@example.com'::TEXT,
        '5559998888'::TEXT,
        NULL::DATE
      );
    `;
    
    // Verify duplicate detection
    expect(duplicateEmailResult[0].is_valid).toBe(true); // Still valid, just a potential duplicate
    expect(duplicateEmailResult[0].potential_duplicates).toBeTruthy();
    expect(duplicateEmailResult[0].potential_duplicates[0].id).toBe(testCustomer.id);
    
    // Test duplicate detection by phone
    const duplicatePhoneResult = await prisma.$queryRaw`
      SELECT * FROM validate_customer_data(
        'New'::TEXT,
        'Customer'::TEXT,
        'new@example.com'::TEXT,
        '5551112222'::TEXT,
        NULL::DATE
      );
    `;
    
    expect(duplicatePhoneResult[0].potential_duplicates).toBeTruthy();
    expect(duplicatePhoneResult[0].potential_duplicates[0].id).toBe(testCustomer.id);
    
    // Clean up
    await prisma.customer.delete({
      where: { id: testCustomer.id },
    });
  });
  
  test('should calculate appointment duration based on size and complexity', async ({ prisma }) => {
    // Test with different tattoo sizes
    const sizeTests = [
      { size: 'tiny', complexity: 3, expectedDuration: '30 minutes' },
      { size: 'small', complexity: 3, expectedDuration: '60 minutes' },
      { size: 'medium', complexity: 3, expectedDuration: '135 minutes' },
      { size: 'large', complexity: 3, expectedDuration: '225 minutes' },
      { size: 'extra_large', complexity: 3, expectedDuration: '330 minutes' },
    ];
    
    for (const test of sizeTests) {
      const result = await prisma.$queryRaw`
        SELECT calculate_appointment_duration(
          ${test.size}::TEXT,
          ${test.complexity}::INTEGER
        ) AS duration;
      `;
      
      // Extract minutes from interval (format may vary)
      const durationString = result[0].duration;
      const minutes = parseInt(durationString.match(/(\d+)/)[0]);
      
      // Allow some flexibility in interval format
      expect(minutes).toBeCloseTo(parseInt(test.expectedDuration), -1);
      console.log(`Size: ${test.size}, Duration: ${durationString}`);
    }
    
    // Test with different complexity levels
    const complexityTests = [
      { size: 'medium', complexity: 1, expectedMinutes: 105 },
      { size: 'medium', complexity: 3, expectedMinutes: 135 },
      { size: 'medium', complexity: 5, expectedMinutes: 165 },
    ];
    
    for (const test of complexityTests) {
      const result = await prisma.$queryRaw`
        SELECT calculate_appointment_duration(
          ${test.size}::TEXT,
          ${test.complexity}::INTEGER
        ) AS duration;
      `;
      
      // Extract minutes from interval
      const durationString = result[0].duration;
      const minutes = parseInt(durationString.match(/(\d+)/)[0]);
      
      // Allow some flexibility in exact minutes
      expect(minutes).toBeGreaterThanOrEqual(test.expectedMinutes * 0.9);
      expect(minutes).toBeLessThanOrEqual(test.expectedMinutes * 1.1);
      console.log(`Complexity: ${test.complexity}, Duration: ${durationString}`);
    }
  });
  
  test('should calculate customer lifetime value', async ({ prisma, testCustomer }) => {
    // Create test appointments
    const appointments = [];
    
    // Add several appointments over a period of time
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i * 2); // Every 2 months in the past
      
      const appointment = await prisma.appointment.create({
        data: {
          id: crypto.randomUUID(),
          title: `Test LTV Appointment ${i}`,
          description: 'Created by automated test',
          startDate: date,
          endDate: new Date(date.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
          status: 'completed',
          deposit: 100,
          totalPrice: 300 + (i * 50), // Increasing prices
          customerId: testCustomer.id,
          artistId: (await prisma.artist.findFirst()).id,
        },
      });
      
      appointments.push(appointment);
      
      // Add transaction for each appointment
      await prisma.transaction.create({
        data: {
          id: crypto.randomUUID(),
          amount: 300 + (i * 50),
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'card',
          transactionId: `test-trans-${i}`,
          notes: 'Test transaction for LTV',
          customerId: testCustomer.id,
          appointmentId: appointment.id,
        },
      });
    }
    
    // Calculate customer LTV
    const ltvResult = await prisma.$queryRaw`
      SELECT * FROM calculate_customer_ltv(${testCustomer.id}::TEXT);
    `;
    
    // Verify LTV calculation
    expect(ltvResult[0].customer_id).toBe(testCustomer.id);
    expect(ltvResult[0].appointment_count).toBe(3);
    expect(ltvResult[0].total_spent).toBe(300 + 350 + 400); // Sum of appointment prices
    expect(ltvResult[0].avg_appointment_value).toBe((300 + 350 + 400) / 3);
    expect(ltvResult[0].relationship_days).toBeGreaterThan(100); // Roughly 4 months
    expect(ltvResult[0].projected_annual_value).toBeGreaterThan(0);
    
    // Clean up
    for (const appointment of appointments) {
      await prisma.transaction.deleteMany({
        where: { appointmentId: appointment.id },
      });
      
      await prisma.appointment.delete({
        where: { id: appointment.id },
      });
    }
  });
  
  test('should auto-tag customer notes using pg_trgm', async ({ prisma, testCustomer }) => {
    // Create a note with content that should generate tags
    const noteContent = "Customer is interested in Japanese style dragon tattoo on their back. Prefers traditional colors and wants to schedule during summer.";
    
    // Get tag count before
    const tagCountBefore = await prisma.tag.count();
    
    // Create the note
    const note = await prisma.note.create({
      data: {
        id: crypto.randomUUID(),
        content: noteContent,
        type: 'manual',
        customerId: testCustomer.id,
      },
    });
    
    // Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get tag count after
    const tagCountAfter = await prisma.tag.count();
    
    // Verify that new tags were created
    expect(tagCountAfter).toBeGreaterThan(tagCountBefore);
    
    // Check for specific expected tags
    const customerTags = await prisma.$queryRaw`
      SELECT t.name
      FROM "Tag" t
      JOIN "_CustomerToTag" ct ON t.id = ct."B"
      WHERE ct."A" = ${testCustomer.id}::TEXT;
    `;
    
    const tagNames = customerTags.map(t => t.name);
    console.log('Generated tags:', tagNames);
    
    // Expect relevant keywords to be extracted as tags
    const expectedKeywords = ['dragon', 'japanese', 'tattoo', 'back', 'traditional', 'summer'];
    const foundKeywords = expectedKeywords.filter(keyword => 
      tagNames.some(tag => tag.includes(keyword))
    );
    
    // At least some keywords should be found
    expect(foundKeywords.length).toBeGreaterThan(2);
    
    // Clean up
    await prisma.note.delete({
      where: { id: note.id },
    });
    
    // Remove any tags created just for this test
    for (const tag of tagNames) {
      await prisma.$executeRaw`
        DELETE FROM "_CustomerToTag" 
        WHERE "B" IN (SELECT id FROM "Tag" WHERE name = ${tag}::TEXT);
      `;
      
      await prisma.$executeRaw`
        DELETE FROM "Tag" WHERE name = ${tag}::TEXT;
      `;
    }
  });
});
