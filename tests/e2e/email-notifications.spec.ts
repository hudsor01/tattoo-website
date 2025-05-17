import { test, expect } from './setup';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Create a jest-like mock to track function calls
const mockSendFn = {
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
};

// Store original implementation
const originalResend = Resend;

// Mock Resend constructor
Resend = function(apiKey) {
  return {
    emails: {
      send: mockSendFn.mockImplementation(async (options) => {
        return { 
          data: { id: 'test-email-id' },
          error: null
        };
      })
    }
  };
} as any;

// After all tests, restore the original implementation
test.afterAll(() => {
  Resend = originalResend;
});

test.describe('Email Notification System', () => {
  // Initialize Supabase client for authenticated requests
  let supabase;
  
  test.beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    
    // Clear mock tracking before tests
    mockSendFn.mockClear();
  });
  
  test('should send appointment confirmation email', async ({ request, testCustomer, testArtist, prisma }) => {
    // Create a test appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);
    
    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Test appointment for email',
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
    
    // Log in as admin to have permission to trigger emails
    const { data: adminAuth } = await supabase.auth.signInWithPassword({
      email: 'test-admin@example.com',
      password: 'Test-Password123!',
    });
    
    if (!adminAuth?.session) {
      throw new Error('Failed to authenticate as admin');
    }
    
    // Clear mock tracking before test
    mockSendFn.mockClear();
    
    // Trigger appointment confirmation email via API
    const response = await request.post(`/api/appointments/${appointment.id}/send-confirmation`, {
      headers: {
        Authorization: `Bearer ${adminAuth.session.access_token}`,
      },
    });
    
    expect(response.status()).toBe(200);
    
    // Verify email was "sent" by checking our mock
    expect(mockSendFn.calls.length).toBeGreaterThan(0);
    
    // Check call parameters if any calls were made
    if (mockSendFn.calls.length > 0) {
      const callParams = mockSendFn.calls[0][0];
      expect(callParams.to).toBe(testCustomer.email);
      expect(callParams.subject).toContain('Appointment');
    }
    
    // Clean up
    await prisma.appointment.delete({
      where: { id: appointment.id },
    });
  });
  
  test('should queue email notifications', async ({ request, testCustomer, prisma }) => {
    // Log in as admin
    const { data: adminAuth } = await supabase.auth.signInWithPassword({
      email: 'test-admin@example.com',
      password: 'Test-Password123!',
    });
    
    if (!adminAuth?.session) {
      throw new Error('Failed to authenticate as admin');
    }
    
    // Count current notifications
    const notificationCountBefore = await prisma.notificationQueue.count({
      where: {
        recipientId: testCustomer.id,
        notificationType: 'welcome',
      },
    });
    
    // Trigger welcome email via API
    const response = await request.post(`/api/customers/${testCustomer.id}/send-welcome`, {
      headers: {
        Authorization: `Bearer ${adminAuth.session.access_token}`,
      },
    });
    
    expect(response.status()).toBe(200);
    
    // Verify notification was queued
    const notificationCountAfter = await prisma.notificationQueue.count({
      where: {
        recipientId: testCustomer.id,
        notificationType: 'welcome',
      },
    });
    
    expect(notificationCountAfter).toBe(notificationCountBefore + 1);
    
    // Find the notification
    const notification = await prisma.notificationQueue.findFirst({
      where: {
        recipientId: testCustomer.id,
        notificationType: 'welcome',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    expect(notification).toBeTruthy();
    expect(notification.title).toContain('Welcome');
  });
  
  test('should process email queue with cron job', async ({ request }) => {
    // Log in as admin
    const { data: adminAuth } = await supabase.auth.signInWithPassword({
      email: 'test-admin@example.com',
      password: 'Test-Password123!',
    });
    
    if (!adminAuth?.session) {
      throw new Error('Failed to authenticate as admin');
    }
    
    // Clear mock tracking before test
    mockSendFn.mockClear();
    
    // Trigger cron job to process email queue
    const response = await request.post('/api/cron', {
      headers: {
        Authorization: `Bearer ${adminAuth.session.access_token}`,
        'x-cron-secret': process.env.CRON_SECRET || 'test-cron-secret',
      },
      data: {
        jobType: 'process_email_queue',
      },
    });
    
    expect(response.status()).toBe(200);
    const result = await response.json();
    
    // Verify processing was successful
    expect(result.success).toBe(true);
    expect(result.job).toBe('process_email_queue');
    
    // If the queue had any emails, our mock should have been called
    if (mockSendFn.calls.length > 0) {
      // Log details for debugging
      console.log(`Processed ${mockSendFn.calls.length} queued emails`);
    }
  });
});