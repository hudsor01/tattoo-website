import { renderHook, act } from '@testing-library/react-hooks';
import {
  useAnalytics,
  usePageViewTracking,
  useBookingAnalytics,
  useGalleryAnalytics,
} from '@/hooks/use-analytics';
import { trpc } from '@/lib/trpc';
import { EventCategory } from '@/lib/routers/types';

// Mock trpc client
jest.mock('@/lib/trpc', () => ({
  trpc: {
    analytics: {
      trackEvent: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackPageView: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackInteraction: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackBookingEvent: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackGalleryEvent: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackConversion: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
      trackError: {
        useMutation: jest.fn().mockReturnValue({
          mutate: jest.fn(),
        }),
      },
    },
  },
}));

// Mock getCookie and setCookie
jest.mock('cookies-next', () => ({
  getCookie: jest.fn().mockReturnValue('test-session-id'),
  setCookie: jest.fn(),
}));

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

// Mock browser utilities
jest.mock('@/utils/browser', () => ({
  getUserAgent: jest.fn().mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
  isMobileDevice: jest.fn().mockReturnValue(false),
  getBrowserLanguage: jest.fn().mockReturnValue('en-US'),
  getBrowserFingerprint: jest.fn().mockReturnValue('test-fingerprint'),
  getDeviceInfo: jest.fn().mockReturnValue({
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'MacOS',
  }),
}));

// Mock window location for pathname tests
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/test-path',
  },
});

describe('Analytics Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAnalytics', () => {
    it('should provide tracking functions', () => {
      const { result } = renderHook(() => useAnalytics());

      expect(result.current).toHaveProperty('trackEvent');
      expect(result.current).toHaveProperty('trackPageView');
      expect(result.current).toHaveProperty('trackInteraction');
      expect(result.current).toHaveProperty('trackBookingEvent');
      expect(result.current).toHaveProperty('trackGalleryEvent');
      expect(result.current).toHaveProperty('trackConversion');
      expect(result.current).toHaveProperty('trackError');
    });

    it('should track a page view', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackPageView({
          pageTitle: 'Test Page',
        });
      });

      // Verify trpc mutation was called
      expect(trpc.analytics.trackPageView.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const callArg = trpc.analytics.trackPageView.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('category', EventCategory.PAGE_VIEW);
      expect(callArg).toHaveProperty('action', 'view');
      expect(callArg).toHaveProperty('pageTitle', 'Test Page');
      expect(callArg).toHaveProperty('path', '/test-path');
      expect(callArg).toHaveProperty('sessionId', 'test-session-id');
    });

    it('should track an interaction', () => {
      const { result } = renderHook(() => useAnalytics());

      act(() => {
        result.current.trackInteraction({
          action: 'click',
          elementId: 'test-button',
          label: 'Test Button',
        });
      });

      // Verify trpc mutation was called
      expect(trpc.analytics.trackInteraction.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const callArg = trpc.analytics.trackInteraction.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('category', EventCategory.INTERACTION);
      expect(callArg).toHaveProperty('action', 'click');
      expect(callArg).toHaveProperty('elementId', 'test-button');
      expect(callArg).toHaveProperty('label', 'Test Button');
    });

    it('should track an error', () => {
      const { result } = renderHook(() => useAnalytics());
      const testError = new Error('Test error');

      act(() => {
        result.current.trackError({
          errorMessage: testError.message,
          errorStack: testError.stack,
          componentName: 'TestComponent',
          severity: 'high',
        });
      });

      // Verify trpc mutation was called
      expect(trpc.analytics.trackError.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const callArg = trpc.analytics.trackError.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('category', EventCategory.ERROR);
      expect(callArg).toHaveProperty('action', 'error');
      expect(callArg).toHaveProperty('errorMessage', 'Test error');
      expect(callArg).toHaveProperty('componentName', 'TestComponent');
      expect(callArg).toHaveProperty('severity', 'high');
    });
  });

  describe('usePageViewTracking', () => {
    it('should track page view on mount', () => {
      Object.defineProperty(document, 'title', {
        value: 'Test Document Title',
        writable: true,
      });

      // The hook should call trackPageView on mount
      renderHook(() => usePageViewTracking());

      // Verify trackPageView was called
      expect(trpc.analytics.trackPageView.useMutation().mutate).toHaveBeenCalled();

      // Verify correct page title is used
      const callArg = trpc.analytics.trackPageView.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('pageTitle', 'Test Document Title');
    });

    it('should use custom page title if provided', () => {
      // The hook should call trackPageView with the custom title
      renderHook(() => usePageViewTracking('Custom Page Title'));

      // Verify trackPageView was called
      expect(trpc.analytics.trackPageView.useMutation().mutate).toHaveBeenCalled();

      // Verify correct page title is used
      const callArg = trpc.analytics.trackPageView.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('pageTitle', 'Custom Page Title');
    });
  });

  describe('useBookingAnalytics', () => {
    it('should track booking flow events', () => {
      const { result } = renderHook(() => useBookingAnalytics());

      // Start booking flow
      act(() => {
        result.current.startBookingFlow('service-1', 'Tattoo Consultation');
      });

      // Verify trackBookingEvent was called
      expect(trpc.analytics.trackBookingEvent.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const callArg = trpc.analytics.trackBookingEvent.useMutation().mutate.mock.calls[0][0];
      expect(callArg).toHaveProperty('action', 'start');
      expect(callArg).toHaveProperty('serviceId', 'service-1');
      expect(callArg).toHaveProperty('serviceName', 'Tattoo Consultation');

      // Reset mocks for next test
      jest.clearAllMocks();

      // Track booking completion
      const appointmentDate = new Date();
      act(() => {
        result.current.trackCompletion(
          'booking-1',
          'service-1',
          'Tattoo Consultation',
          appointmentDate,
        );
      });

      // Verify both booking event and conversion are tracked
      expect(trpc.analytics.trackBookingEvent.useMutation().mutate).toHaveBeenCalled();
      expect(trpc.analytics.trackConversion.useMutation().mutate).toHaveBeenCalled();

      // Verify booking event data
      const bookingArg = trpc.analytics.trackBookingEvent.useMutation().mutate.mock.calls[0][0];
      expect(bookingArg).toHaveProperty('action', 'complete');
      expect(bookingArg).toHaveProperty('bookingId', 'booking-1');

      // Verify conversion event data
      const conversionArg = trpc.analytics.trackConversion.useMutation().mutate.mock.calls[0][0];
      expect(conversionArg).toHaveProperty('action', 'book_appointment');
      expect(conversionArg).toHaveProperty('conversionId', 'booking-1');
    });
  });

  describe('useGalleryAnalytics', () => {
    it('should track gallery interaction events', () => {
      const { result } = renderHook(() => useGalleryAnalytics());

      // Track design view
      act(() => {
        result.current.trackDesignView('design-1', 'Traditional', 'John Artist', [
          'traditional',
          'color',
        ]);
      });

      // Verify trackGalleryEvent was called
      expect(trpc.analytics.trackGalleryEvent.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const viewArg = trpc.analytics.trackGalleryEvent.useMutation().mutate.mock.calls[0][0];
      expect(viewArg).toHaveProperty('action', 'view');
      expect(viewArg).toHaveProperty('designId', 'design-1');
      expect(viewArg).toHaveProperty('designType', 'Traditional');
      expect(viewArg).toHaveProperty('artist', 'John Artist');
      expect(viewArg).toHaveProperty('tags', ['traditional', 'color']);

      // Reset mocks for next test
      jest.clearAllMocks();

      // Track design favorite
      act(() => {
        result.current.trackDesignFavorite('design-1', 'Traditional');
      });

      // Verify trackGalleryEvent was called
      expect(trpc.analytics.trackGalleryEvent.useMutation().mutate).toHaveBeenCalled();

      // Verify correct event data
      const favoriteArg = trpc.analytics.trackGalleryEvent.useMutation().mutate.mock.calls[0][0];
      expect(favoriteArg).toHaveProperty('action', 'favorite');
      expect(favoriteArg).toHaveProperty('designId', 'design-1');
      expect(favoriteArg).toHaveProperty('designType', 'Traditional');
    });

    it('should track view duration when view ends', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useGalleryAnalytics());

      // Start view tracking
      act(() => {
        result.current.trackDesignView('design-1');
      });

      // Clear mocks to isolate the next call
      jest.clearAllMocks();

      // Advance timer by 5 seconds
      jest.advanceTimersByTime(5000);

      // End view tracking
      act(() => {
        result.current.trackDesignViewEnded('design-1');
      });

      // Verify trackGalleryEvent was called with view time
      expect(trpc.analytics.trackGalleryEvent.useMutation().mutate).toHaveBeenCalled();

      // Verify view time is tracked (approximately 5000ms)
      const viewEndArg = trpc.analytics.trackGalleryEvent.useMutation().mutate.mock.calls[0][0];
      expect(viewEndArg).toHaveProperty('action', 'view');
      expect(viewEndArg).toHaveProperty('designId', 'design-1');
      expect(viewEndArg).toHaveProperty('viewTime');
      expect(viewEndArg.viewTime).toBeGreaterThanOrEqual(4990); // Allow small timing variations
      expect(viewEndArg.viewTime).toBeLessThanOrEqual(5010);

      jest.useRealTimers();
    });
  });
});
