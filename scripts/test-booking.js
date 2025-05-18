/**
 * Test script for Cal.com booking flow
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Test webhook payload
const mockPayload = {
  event: 'booking.created',
  id: 'test-1',
  timestamp: Date.now(),
  payload: {
    id: 'booking-1',
    uid: 'uid-1',
    eventTypeId: 1,
    title: 'Tattoo Consultation',
    customInputs: [
      { label: 'Tattoo Type', value: 'Traditional', type: 'text' },
      { label: 'Size', value: 'Medium', type: 'text' },
      { label: 'Placement', value: 'Arm', type: 'text' }
    ],
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    attendees: [{
      email: 'test@example.com',
      name: 'Test Client',
      timeZone: 'UTC'
    }],
    organizer: {
      email: 'artist@example.com',
      name: 'Artist',
      timeZone: 'UTC',
      username: 'artist'
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Test webhook
async function testWebhook() {
  try {
    const response = await fetch(`${BASE_URL}/api/cal/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'cal-signature': 'test'
      },
      body: JSON.stringify(mockPayload)
    });
    
    console.log('Webhook response:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run test
console.log('Testing Cal.com webhook...');
testWebhook();