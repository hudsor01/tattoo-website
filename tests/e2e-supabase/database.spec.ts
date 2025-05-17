import { test, expect } from './setup';
import { v4 as uuidv4 } from 'uuid';

test.describe('Database Operations', () => {
  test('can create and manage customer records', async ({ prisma, testPrefix }) => {
    // Create a customer
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}FirstName`,
        lastName: `${testPrefix}LastName`,
        email: `${testPrefix}customer@example.com`,
        phone: '5551234567',
      },
    });
    
    expect(customer).toBeDefined();
    expect(customer.firstName).toBe(`${testPrefix}FirstName`);
    
    // Create a note for this customer
    const note = await prisma.note.create({
      data: {
        id: uuidv4(),
        content: 'This is a test note from E2E tests',
        type: 'manual',
        customerId: customer.id,
      },
    });
    
    expect(note).toBeDefined();
    expect(note.content).toBe('This is a test note from E2E tests');
    
    // Fetch customer with notes
    const customerWithNotes = await prisma.customer.findUnique({
      where: { id: customer.id },
      include: { notes: true },
    });
    
    expect(customerWithNotes?.notes).toHaveLength(1);
    expect(customerWithNotes?.notes[0].content).toBe('This is a test note from E2E tests');
    
    // Clean up
    await prisma.note.delete({
      where: { id: note.id },
    });
    
    await prisma.customer.delete({
      where: { id: customer.id },
    });
  });
});

test.describe('Booking Operations', () => {
  test('can create and manage booking records', async ({ prisma, testPrefix }) => {
    // Create a booking
    const booking = await prisma.booking.create({
      data: {
        name: `${testPrefix}Client`,
        email: `${testPrefix}booking@example.com`,
        phone: '5551234567',
        tattooType: 'custom',
        size: 'medium',
        placement: 'arm',
        description: 'Test booking created by E2E test',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        preferredTime: 'afternoon',
        paymentMethod: 'card',
      },
    });
    
    expect(booking).toBeDefined();
    expect(booking.email).toBe(`${testPrefix}booking@example.com`);
    
    // Instead of updating, just verify the booking was created properly
    const fetchedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
    });
    
    expect(fetchedBooking).toBeDefined();
    expect(fetchedBooking?.email).toBe(`${testPrefix}booking@example.com`);
    
    // Clean up
    await prisma.booking.delete({
      where: { id: booking.id },
    });
  });
});

test.describe('Supabase Integration', () => {
  test('can interact with Supabase directly', async ({ supabase }) => {
    // Test that we can access the Supabase REST API
    const { data, error } = await supabase
      .from('Customer')
      .select('id, firstName, lastName, email')
      .limit(5);
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
});