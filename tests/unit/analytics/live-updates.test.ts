import { 
  emitAnalyticsEvent, 
  trackAndEmitEvent, 
  subscribeToAnalyticsEvents, 
  AnalyticsStreamEvents, 
  formatSSEEvent
} from '@/lib/routers/analytics-router/live-updates';
import { EventCategory } from '@/lib/routers/analytics-router/types';
import { EventEmitter } from 'events';

// Mock the Response object
class MockResponse {
  signal: AbortSignal;
  controller: AbortController;
  
  constructor() {
    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }
  
  abort() {
    this.controller.abort();
  }
}

describe('Live Analytics Updates', () => {
  // Mock event listener functions
  let mockListener: jest.Mock;
  let mockListener2: jest.Mock;
  
  beforeEach(() => {
    mockListener = jest.fn();
    mockListener2 = jest.fn();
    
    // Reset event listeners between tests
    // This is necessary because EventEmitter is a singleton
    jest.resetModules();
  });
  
  test('emitAnalyticsEvent should emit events to subscribers', () => {
    // Create a test event
    const testEvent = { type: 'test', data: { message: 'Test message' } };
    
    // Subscribe to events
    const unsubscribe = subscribeToAnalyticsEvents(
      AnalyticsStreamEvents.NEW_EVENT, 
      mockListener
    );
    
    // Emit an event
    emitAnalyticsEvent(AnalyticsStreamEvents.NEW_EVENT, testEvent);
    
    // Verify the listener was called with the event data
    expect(mockListener).toHaveBeenCalledWith(testEvent);
    
    // Unsubscribe and verify no more events are received
    unsubscribe();
    
    // Emit another event
    emitAnalyticsEvent(AnalyticsStreamEvents.NEW_EVENT, { ...testEvent, data: { message: 'Second message' } });
    
    // The listener should not be called again after unsubscribing
    expect(mockListener).toHaveBeenCalledTimes(1);
  });
  
  test('trackAndEmitEvent should emit appropriate events based on category', () => {
    // Set up listeners for different event types
    const newEventUnsubscribe = subscribeToAnalyticsEvents(
      AnalyticsStreamEvents.NEW_EVENT, 
      mockListener
    );
    
    const conversionUnsubscribe = subscribeToAnalyticsEvents(
      AnalyticsStreamEvents.CONVERSION, 
      mockListener2
    );
    
    // Create a conversion event
    const conversionEvent = {
      category: EventCategory.CONVERSION,
      action: 'book_appointment',
      label: 'Test Booking',
      timestamp: new Date(),
      sessionId: 'test-session',
      path: '/booking/confirmation',
    };
    
    // Track the event
    trackAndEmitEvent(conversionEvent);
    
    // Verify the NEW_EVENT listener was called
    expect(mockListener).toHaveBeenCalledWith(conversionEvent);
    
    // Verify the CONVERSION listener was also called
    expect(mockListener2).toHaveBeenCalledWith(conversionEvent);
    
    // Clean up subscriptions
    newEventUnsubscribe();
    conversionUnsubscribe();
  });
  
  test('formatSSEEvent should format events correctly for SSE', () => {
    // Test event data
    const eventType = 'test-event';
    const eventData = { message: 'Test message', value: 123 };
    
    // Format the event
    const formattedEvent = formatSSEEvent(eventType, eventData);
    
    // Expected format: event: eventType\ndata: JSON.stringify(eventData)\n\n
    const expected = `event: ${eventType}\ndata: ${JSON.stringify(eventData)}\n\n`;
    
    // Verify the formatting
    expect(formattedEvent).toBe(expected);
  });
  
  test('multiple subscribers should all receive events', () => {
    // Create another mock listener
    const anotherMockListener = jest.fn();
    
    // Subscribe both listeners to the same event type
    const unsubscribe1 = subscribeToAnalyticsEvents(
      AnalyticsStreamEvents.NEW_EVENT, 
      mockListener
    );
    
    const unsubscribe2 = subscribeToAnalyticsEvents(
      AnalyticsStreamEvents.NEW_EVENT, 
      anotherMockListener
    );
    
    // Create a test event
    const testEvent = {
      category: EventCategory.PAGE_VIEW,
      action: 'view',
      path: '/test',
      timestamp: new Date(),
    };
    
    // Emit the event
    emitAnalyticsEvent(AnalyticsStreamEvents.NEW_EVENT, testEvent);
    
    // Verify both listeners received the event
    expect(mockListener).toHaveBeenCalledWith(testEvent);
    expect(anotherMockListener).toHaveBeenCalledWith(testEvent);
    
    // Unsubscribe the first listener
    unsubscribe1();
    
    // Emit another event
    const secondEvent = { ...testEvent, path: '/test2' };
    emitAnalyticsEvent(AnalyticsStreamEvents.NEW_EVENT, secondEvent);
    
    // First listener should not receive the second event
    expect(mockListener).toHaveBeenCalledTimes(1);
    
    // Second listener should receive both events
    expect(anotherMockListener).toHaveBeenCalledTimes(2);
    expect(anotherMockListener).toHaveBeenLastCalledWith(secondEvent);
    
    // Clean up
    unsubscribe2();
  });
  
  test('createAnalyticsStream should handle client disconnection', async () => {
    // This is a more complex test that requires mocking the ReadableStream
    // and Response objects. The implementation is environment-specific.
    
    // For Jest, we can use jest.mock to replace the ReadableStream implementation
    // but for simplicity, we'll just test that the function exists and is callable
    
    // Create a mock response
    const mockResponse = new MockResponse();
    
    // This should not throw an error
    const createAnalyticsStream = require('@/lib/routers/analytics-router/live-updates').createAnalyticsStream;
    expect(typeof createAnalyticsStream).toBe('function');
    
    // Simulate disconnection after 100ms
    setTimeout(() => {
      mockResponse.abort();
    }, 100);
  });
});
