import { test, expect } from './setup';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

test.describe('Data Import with PostgreSQL Functions', () => {
  test.beforeAll(async ({ prisma }) => {
    // Create a temporary directory for test files
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'), { recursive: true });
    }
    
    // Create a sample CSV file for customer import
    const csvContent = `firstName,lastName,email,phone,notes
John,Smith,john.smith@example.com,5551234567,"Interested in sleeve tattoo"
Jane,Doe,jane.doe@example.com,5559876543,"Wants minimalist design"
Alex,Johnson,alex.j@example.com,5554567890,"Looking for watercolor style"`;
    
    fs.writeFileSync(path.join(__dirname, 'temp', 'customers.csv'), csvContent);
  });
  
  test.afterAll(async () => {
    // Clean up temporary files
    if (fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.rmSync(path.join(__dirname, 'temp'), { recursive: true, force: true });
    }
  });
  
  test('should create a database function for importing CSV data', async ({ prisma }) => {
    // Create a PostgreSQL function for importing customer data
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION import_customers_from_csv(
        file_path TEXT
      ) RETURNS TABLE (
        customerId TEXT,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        status TEXT
      ) AS $$
      DECLARE
        temp_table_name TEXT := 'temp_customers_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
        v_customer_id TEXT;
        v_result RECORD;
      BEGIN
        -- Create a temporary table to hold the imported data
        EXECUTE format('
          CREATE TEMPORARY TABLE %I (
            firstName TEXT,
            lastName TEXT,
            email TEXT,
            phone TEXT,
            notes TEXT
          )', temp_table_name);
        
        -- Copy data from CSV file into the temporary table
        EXECUTE format('
          COPY %I FROM %L WITH (FORMAT csv, HEADER true)
        ', temp_table_name, file_path);
        
        -- Process each row
        FOR v_result IN EXECUTE format('SELECT * FROM %I', temp_table_name) LOOP
          -- Check if customer with this email already exists
          SELECT id INTO v_customer_id
          FROM "Customer"
          WHERE email = v_result.email;
          
          IF v_customer_id IS NULL THEN
            -- Insert new customer
            v_customer_id := uuid_generate_v4();
            
            INSERT INTO "Customer" (
              id, 
              "firstName", 
              "lastName", 
              email, 
              phone, 
              "createdAt", 
              "updatedAt"
            ) VALUES (
              v_customer_id,
              v_result.firstName,
              v_result.lastName,
              v_result.email,
              v_result.phone,
              NOW(),
              NOW()
            );
            
            -- Add notes if provided
            IF v_result.notes IS NOT NULL AND v_result.notes != '' THEN
              INSERT INTO "Note" (
                id,
                content,
                type,
                "customerId",
                "createdAt",
                "updatedAt"
              ) VALUES (
                uuid_generate_v4(),
                v_result.notes,
                'import',
                v_customer_id,
                NOW(),
                NOW()
              );
            END IF;
            
            -- Return result row
            customerId := v_customer_id;
            firstName := v_result.firstName;
            lastName := v_result.lastName;
            email := v_result.email;
            status := 'created';
            RETURN NEXT;
          ELSE
            -- Return existing customer
            customerId := v_customer_id;
            firstName := v_result.firstName;
            lastName := v_result.lastName;
            email := v_result.email;
            status := 'existing';
            RETURN NEXT;
          END IF;
        END LOOP;
        
        -- Drop the temporary table
        EXECUTE format('DROP TABLE IF EXISTS %I', temp_table_name);
        
        RETURN;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Get full path to the CSV file
    const csvPath = path.resolve(__dirname, 'temp', 'customers.csv');
    
    // Run the import function
    const importResults = await prisma.$queryRaw`
      SELECT * FROM import_customers_from_csv(${csvPath}::TEXT);
    `;
    
    // Verify import results
    expect(importResults.length).toBe(3); // Three customers in the CSV
    expect(importResults.filter(r => r.status === 'created').length).toBe(3);
    
    // Verify customers were created
    const customerCount = await prisma.customer.count({
      where: {
        email: {
          in: ['john.smith@example.com', 'jane.doe@example.com', 'alex.j@example.com']
        }
      }
    });
    expect(customerCount).toBe(3);
    
    // Verify notes were created
    const notes = await prisma.note.findMany({
      where: {
        type: 'import',
        customer: {
          email: {
            in: ['john.smith@example.com', 'jane.doe@example.com', 'alex.j@example.com']
          }
        }
      }
    });
    expect(notes.length).toBe(3);
    
    // Check specific note content
    const johnNote = notes.find(n => n.content.includes('sleeve'));
    expect(johnNote).toBeTruthy();
    
    // Clean up test data
    await prisma.note.deleteMany({
      where: {
        type: 'import',
        customer: {
          email: {
            in: ['john.smith@example.com', 'jane.doe@example.com', 'alex.j@example.com']
          }
        }
      }
    });
    
    await prisma.customer.deleteMany({
      where: {
        email: {
          in: ['john.smith@example.com', 'jane.doe@example.com', 'alex.j@example.com']
        }
      }
    });
    
    // Drop the import function
    await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS import_customers_from_csv;
    `;
  });
  
  test('should handle duplicate records during import', async ({ prisma }) => {
    // Create a customer that will be a duplicate in the import
    const existingCustomer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '5551234567',
      }
    });
    
    // Create the import function
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION import_customers_from_csv(
        file_path TEXT,
        update_existing BOOLEAN DEFAULT FALSE
      ) RETURNS TABLE (
        customer_id TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        status TEXT
      ) AS $$
      DECLARE
        temp_table_name TEXT := 'temp_customers_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
        v_customer_id TEXT;
        v_result RECORD;
      BEGIN
        -- Create a temporary table to hold the imported data
        EXECUTE format('
          CREATE TEMPORARY TABLE %I (
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            notes TEXT
          )', temp_table_name);
        
        -- Copy data from CSV file into the temporary table
        EXECUTE format('
          COPY %I FROM %L WITH (FORMAT csv, HEADER true)
        ', temp_table_name, file_path);
        
        -- Process each row
        FOR v_result IN EXECUTE format('SELECT * FROM %I', temp_table_name) LOOP
          -- Check if customer with this email already exists
          SELECT id INTO v_customer_id
          FROM "Customer"
          WHERE email = v_result.email;
          
          IF v_customer_id IS NULL THEN
            -- Insert new customer
            v_customer_id := uuid_generate_v4();
            
            INSERT INTO "Customer" (
              id, 
              "firstName", 
              "lastName", 
              email, 
              phone, 
              "createdAt", 
              "updatedAt"
            ) VALUES (
              v_customer_id,
              v_result.first_name,
              v_result.last_name,
              v_result.email,
              v_result.phone,
              NOW(),
              NOW()
            );
            
            -- Return result row
            customer_id := v_customer_id;
            first_name := v_result.first_name;
            last_name := v_result.last_name;
            email := v_result.email;
            status := 'created';
            RETURN NEXT;
          ELSE
            -- Update existing customer if requested
            IF update_existing THEN
              UPDATE "Customer"
              SET 
                "firstName" = v_result.first_name,
                "lastName" = v_result.last_name,
                phone = v_result.phone,
                "updatedAt" = NOW()
              WHERE id = v_customer_id;
              
              customer_id := v_customer_id;
              first_name := v_result.first_name;
              last_name := v_result.last_name;
              email := v_result.email;
              status := 'updated';
              RETURN NEXT;
            ELSE
              -- Return existing customer
              customer_id := v_customer_id;
              first_name := v_result.first_name;
              last_name := v_result.last_name;
              email := v_result.email;
              status := 'skipped';
              RETURN NEXT;
            END IF;
          END IF;
        END LOOP;
        
        -- Drop the temporary table
        EXECUTE format('DROP TABLE IF EXISTS %I', temp_table_name);
        
        RETURN;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Get full path to the CSV file
    const csvPath = path.resolve(__dirname, 'temp', 'customers.csv');
    
    // Run the import function without updating existing records
    const importResults = await prisma.$queryRaw`
      SELECT * FROM import_customers_from_csv(${csvPath}::TEXT, FALSE);
    `;
    
    // Verify import results
    const johnResult = importResults.find(r => r.email === 'john.smith@example.com');
    expect(johnResult.status).toBe('skipped');
    
    const newCustomers = importResults.filter(r => r.status === 'created');
    expect(newCustomers.length).toBe(2); // Two new customers, one skipped
    
    // Run again with update_existing=TRUE
    const updateResults = await prisma.$queryRaw`
      SELECT * FROM import_customers_from_csv(${csvPath}::TEXT, TRUE);
    `;
    
    // Verify update results
    const johnUpdateResult = updateResults.find(r => r.email === 'john.smith@example.com');
    expect(johnUpdateResult.status).toBe('updated');
    
    // Clean up test data
    await prisma.customer.deleteMany({
      where: {
        email: {
          in: ['john.smith@example.com', 'jane.doe@example.com', 'alex.j@example.com']
        }
      }
    });
    
    // Drop the import function
    await prisma.$executeRaw`
      DROP FUNCTION IF EXISTS import_customers_from_csv;
    `;
  });
});
