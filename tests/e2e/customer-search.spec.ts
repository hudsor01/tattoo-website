import { test, expect } from './setup';
import { execSync } from 'child_process';

test.describe('Customer Search with pg_trgm', () => {
  test.beforeAll(async () => {
    // Make sure the database extensions are loaded
    try {
      execSync('bash scripts/apply-database-extensions.sh', { stdio: 'pipe' });
    } catch (error) {
      console.error('Failed to apply database extensions:', error);
    }
  });
  
  test('should find customers with exact match', async ({ prisma }) => {
    // Create some test customers
    const testCustomers = [
      {
        id: crypto.randomUUID(),
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '5551234567',
      },
      {
        id: crypto.randomUUID(),
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '5559876543',
      },
      {
        id: crypto.randomUUID(),
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'rob.johnson@example.com',
        phone: '5554567890',
      },
    ];
    
    // Create customers in database
    for (const customer of testCustomers) {
      await prisma.customer.create({
        data: customer,
      });
    }
    
    // Test exact match search
    const exactResults = await prisma.$queryRaw`
      SELECT * FROM search_customers('john smith');
    `;
    
    // Verify exact match results
    expect(exactResults.length).toBeGreaterThan(0);
    expect(exactResults[0].first_name).toBe('John');
    expect(exactResults[0].last_name).toBe('Smith');
    expect(exactResults[0].similarity).toBeGreaterThan(0.6); // High similarity score
    
    // Clean up test customers
    for (const customer of testCustomers) {
      await prisma.customer.delete({
        where: { id: customer.id },
      });
    }
  });
  
  test('should find customers with fuzzy matching', async ({ prisma }) => {
    // Create a test customer
    const testCustomer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        firstName: 'Elizabeth',
        lastName: 'Thompson',
        email: 'liz.thompson@example.com',
        phone: '5552468013',
      },
    });
    
    // Test with various misspelled/partial names
    const fuzzyTests = [
      { query: 'elizabet', expectedMatch: true },
      { query: 'liz', expectedMatch: true },
      { query: 'thompsen', expectedMatch: true },
      { query: 'tomson', expectedMatch: true },
      { query: 'liz tomson', expectedMatch: true },
      { query: 'completely wrong', expectedMatch: false },
    ];
    
    for (const test of fuzzyTests) {
      const results = await prisma.$queryRaw`
        SELECT * FROM search_customers(${test.query});
      `;
      
      if (test.expectedMatch) {
        expect(results.length).toBeGreaterThan(0);
        expect(results.some(r => r.first_name === 'Elizabeth')).toBe(true);
        
        // Check similarity scores for debugging
        console.log(`Query "${test.query}" -> Similarity: ${results[0].similarity}`);
        expect(results[0].similarity).toBeGreaterThan(0.1); // Some similarity
      } else {
        // For non-matching queries, either no results or very low similarity
        if (results.length > 0) {
          expect(results[0].similarity).toBeLessThan(0.1);
        } else {
          expect(results.length).toBe(0);
        }
      }
    }
    
    // Clean up
    await prisma.customer.delete({
      where: { id: testCustomer.id },
    });
  });
  
  test('should find customers by email or phone', async ({ prisma }) => {
    // Create a test customer
    const testCustomer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'mike.williams@example.com',
        phone: '5553907842',
      },
    });
    
    // Test email search
    const emailResults = await prisma.$queryRaw`
      SELECT * FROM search_customers('mike.williams@example');
    `;
    
    expect(emailResults.length).toBeGreaterThan(0);
    expect(emailResults[0].email).toBe('mike.williams@example.com');
    
    // Test phone search
    const phoneResults = await prisma.$queryRaw`
      SELECT * FROM search_customers('3907842');
    `;
    
    expect(phoneResults.length).toBeGreaterThan(0);
    expect(phoneResults[0].phone).toBe('5553907842');
    
    // Clean up
    await prisma.customer.delete({
      where: { id: testCustomer.id },
    });
  });
});

test.describe('Customer Search UI', () => {
  test('should search customers through the UI', async ({ page, prisma }) => {
    // Create test customers
    const testCustomers = [
      {
        id: crypto.randomUUID(),
        firstName: 'Unique',
        lastName: 'TestPerson',
        email: 'unique.test@example.com',
        phone: '5551112222',
      },
      {
        id: crypto.randomUUID(),
        firstName: 'Another',
        lastName: 'TestSubject',
        email: 'another.test@example.com',
        phone: '5553334444',
      },
    ];
    
    // Create customers in database
    for (const customer of testCustomers) {
      await prisma.customer.create({
        data: customer,
      });
    }
    
    // Navigate to customer search page
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    // Focus on search input
    await page.click('input[placeholder*="Search"]');
    
    // Type a unique search term
    await page.fill('input[placeholder*="Search"]', 'Unique');
    
    // Wait for search results
    await page.waitForSelector('text=TestPerson');
    
    // Verify first result contains the expected customer
    const firstResultName = await page.textContent('text=Unique TestPerson');
    expect(firstResultName).toBeTruthy();
    
    // Clean up test customers
    for (const customer of testCustomers) {
      await prisma.customer.delete({
        where: { id: customer.id },
      });
    }
  });
  
  test('should handle fuzzy search in UI', async ({ page, prisma }) => {
    // Create a test customer with a unique name
    const testCustomer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        firstName: 'Bartholomew',
        lastName: 'Quilligan',
        email: 'bart.quill@example.com',
        phone: '5557778888',
      },
    });
    
    // Navigate to customer search page
    await page.goto('/customers');
    await page.waitForLoadState('networkidle');
    
    // Focus on search input
    await page.click('input[placeholder*="Search"]');
    
    // Type a misspelled search term
    await page.fill('input[placeholder*="Search"]', 'bart quiligan');
    
    // Wait for search results
    await page.waitForSelector('text=Bartholomew');
    
    // Verify result contains our test customer despite misspelling
    const resultName = await page.textContent('text=Bartholomew Quilligan');
    expect(resultName).toBeTruthy();
    
    // Clean up
    await prisma.customer.delete({
      where: { id: testCustomer.id },
    });
  });
});
