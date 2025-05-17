import { test, expect } from './setup';
import Stripe from 'stripe';

// Create a jest-like mock to track function calls
const mockStripeFns = {
  checkout: {
    sessions: {
      create: {
        calls: [],
        mockClear() {
          this.calls = [];
        },
        mockImplementation(fn) {
          return (...args) => {
            this.calls.push(args);
            return fn(...args);
          };
        }
      }
    }
  },
  webhooks: {
    constructEvent: {
      calls: [],
      mockClear() {
        this.calls = [];
      },
      mockImplementation(fn) {
        return (...args) => {
          this.calls.push(args);
          return fn(...args);
        };
      }
    }
  }
};

// Create a test session response
const testSession = {
  id: 'test-session-id',
  url: 'https://test-checkout.url',
  payment_intent: 'pi_test123',
  amount_total: 10000,
  currency: 'usd',
  customer_email: 'test@example.com',
  metadata: {
    appointmentId: 'test-appointment-id',
    customerId: 'test-customer-id',
    paymentType: 'deposit'
  }
};

// Create a test webhook event
const testWebhookEvent = {
  id: 'evt_test123',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'test-session-id',
      metadata: {
        appointmentId: 'test-appointment-id',
        customerId: 'test-customer-id',
        paymentType: 'deposit'
      },
      payment_intent: 'pi_test123',
      amount_total: 10000,
      currency: 'usd',
      customer_email: 'test@example.com'
    }
  }
};

// Store original Stripe constructor
const originalStripeConstructor = Stripe;

// Mock Stripe constructor 
global.Stripe = function(apiKey) {
  // Return our mock implementation with the exact structure expected by the app
  return {
    checkout: {
      sessions: {
        create: mockStripeFns.checkout.sessions.create.mockImplementation(async (options) => {
          // Return the test session but preserve the original request params
          return {
            ...testSession,
            client_reference_id: options.client_reference_id,
            customer_email: options.customer_email,
          };
        })
      }
    },
    webhooks: {
      constructEvent: mockStripeFns.webhooks.constructEvent.mockImplementation((rawBody, signature, secret) => {
        mockStripeFns.webhooks.constructEvent.calls.push([rawBody, signature, secret]);
        return testWebhookEvent;
      })
    }
  };
};

// After tests, restore Stripe constructor
test.afterAll(() => {
  global.Stripe = originalStripeConstructor;
});

test.describe('Payment Processing', () => {
  test.beforeEach(() => {
    // Clear mock tracking before each test
    mockStripeFns.checkout.sessions.create.mockClear();
    mockStripeFns.webhooks.constructEvent.mockClear();
  });

  test('should create a payment session', async ({ request, prisma, testCustomer, testArtist }) => {
    // Create a test appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(16, 0, 0, 0);
    
    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Test appointment for payment',
        description: 'Created by automated test',
        startDate: tomorrow,
        endDate: tomorrowEnd,
        status: 'scheduled',
        deposit: 100,
        totalPrice: 300,
        customerId: testCustomer.id,
        artistId: testArtist.id,
      },
    });
    
    // Call the payment API
    const response = await request.post('/api/payments', {
      data: {
        appointmentId: appointment.id,
      },
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Verify response contains checkout URL
    expect(data.url).toBeTruthy();
    expect(data.url).toBe(testSession.url);
    
    // Verify Stripe was called with correct parameters
    expect(mockStripeFns.checkout.sessions.create.calls.length).toBeGreaterThan(0);
    
    if (mockStripeFns.checkout.sessions.create.calls.length > 0) {
      const callParams = mockStripeFns.checkout.sessions.create.calls[0][0];
      expect(callParams.line_items[0].price_data.unit_amount).toBe(10000); // $100.00
      expect(callParams.client_reference_id).toBe(appointment.id);
      expect(callParams.customer_email).toBe(testCustomer.email);
    }
    
    // Clean up
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
  
  test('should handle Stripe webhook events', async ({ request, prisma, testCustomer, testArtist }) => {
    // Create a test appointment
    const appointment = await prisma.appointment.create({
      data: {
        id: 'test-appointment-id', // Use ID that matches mock webhook
        title: 'Test appointment for webhook',
        description: 'Created by automated test',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 93600000), // Tomorrow + 2 hours
        status: 'scheduled',
        deposit: 100,
        totalPrice: 300,
        depositPaid: false,
        customerId: testCustomer.id,
        artistId: testArtist.id,
      },
    });
    
    // Create a mock webhook event payload
    const webhookEvent = {
      id: 'evt_test123',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test123',
          object: 'checkout.session',
          amount_total: 10000, // $100.00
          payment_intent: 'pi_test123',
          currency: 'usd',
          metadata: {
            appointmentId: appointment.id,
            customerId: testCustomer.id,
            paymentType: 'deposit',
          },
        },
      },
      type: 'checkout.session.completed',
    };
    
    // Send webhook event to API
    const response = await request.put('/api/payments', {
      headers: {
        'stripe-signature': 'test-signature',
      },
      data: JSON.stringify(webhookEvent),
    });
    
    expect(response.status()).toBe(200);
    
    // Verify that appointment was updated
    const updatedAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });
    
    expect(updatedAppointment.depositPaid).toBe(true);
    expect(updatedAppointment.status).toBe('confirmed');
    
    // Verify that a transaction was created
    const transaction = await prisma.transaction.findFirst({
      where: {
        appointmentId: appointment.id,
        customerId: testCustomer.id,
      },
    });
    
    expect(transaction).toBeTruthy();
    expect(transaction.amount).toBe(100);
    expect(transaction.status).toBe('completed');
    expect(transaction.paymentMethod).toBe('card');
    expect(transaction.transactionId).toBe('pi_test123');
    
    // Clean up
    await prisma.transaction.delete({
      where: { id: transaction.id },
    });
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
  
  test('should render payment component with correct amount', async ({ page, prisma, testCustomer, testArtist }) => {
    // Create a test appointment
    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Test appointment for UI',
        description: 'Created by automated test',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
        endDate: new Date(Date.now() + 93600000), // Tomorrow + 2 hours
        status: 'scheduled',
        deposit: 150,
        totalPrice: 450,
        depositPaid: false,
        customerId: testCustomer.id,
        artistId: testArtist.id,
      },
    });
    
    // Navigate to payment page
    await page.goto(`/payment/${appointment.id}`);
    await page.waitForLoadState('networkidle');
    
    // Verify payment component is rendered
    const title = await page.textContent('h2');
    expect(title).toContain('Pay Deposit');
    
    // Verify appointment details are shown
    const appointmentTitle = await page.textContent('text=Test appointment for UI');
    expect(appointmentTitle).toBeTruthy();
    
    // Verify deposit amount is correct
    const depositAmount = await page.textContent('text=$150.00');
    expect(depositAmount).toBeTruthy();
    
    // Clean up
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
});