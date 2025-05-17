import { test, expect } from './setup';
import { v4 as uuidv4 } from 'uuid';

test.describe('Booking Flow', () => {
  test('can create and process bookings', async ({ prisma, testPrefix }) => {
    // Create a booking request
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
        depositPaid: false,
      },
    });
    
    expect(booking).toBeDefined();
    expect(booking.email).toBe(`${testPrefix}booking@example.com`);
    
    // Create a customer linked to this booking
    const customer = await prisma.customer.create({
      data: {
        id: uuidv4(),
        firstName: `${testPrefix}First`,
        lastName: `${testPrefix}Last`,
        email: `${testPrefix}booking@example.com`,
        phone: '5551234567',
      },
    });
    
    // Link the customer to the booking using Prisma update
    await prisma.booking.update({
      where: { id: booking.id },
      data: { customerId: customer.id }
    });
    
    // Fetch the updated booking to verify
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: booking.id }
    });
    
    expect(updatedBooking.customerId).toBe(customer.id);
    
    // Create a payment for the booking
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: 100,
        paymentMethod: 'card',
        status: 'pending',
        customerEmail: `${testPrefix}booking@example.com`,
        customerName: `${testPrefix}First ${testPrefix}Last`,
      },
    });
    
    expect(payment).toBeDefined();
    expect(payment.bookingId).toBe(booking.id);
    
    // Update payment status to completed using Prisma update
    const transactionId = `txn_${uuidv4().substring(0, 8)}`;
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'completed',
        transactionId
      }
    });
    
    // Fetch the updated payment to verify
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id }
    });
    
    expect(updatedPayment.status).toBe('completed');
    
    // Clean up
    await prisma.payment.delete({
      where: { id: payment.id },
    });
    
    await prisma.booking.delete({
      where: { id: booking.id },
    });
    
    await prisma.customer.delete({
      where: { id: customer.id },
    });
  });
});