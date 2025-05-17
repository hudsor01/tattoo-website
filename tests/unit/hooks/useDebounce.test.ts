import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    // Clear all timers between tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initially returns the provided value', () => {
    const { result } = renderHook(() => useDebounce('initial value', 500));
    expect(result.current).toBe('initial value');
  });

  test('delays updating value until specified delay has passed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    // Initial value should be returned
    expect(result.current).toBe('initial value');

    // Update the value
    rerender({ value: 'updated value', delay: 500 });

    // Value should not be updated immediately
    expect(result.current).toBe('initial value');

    // Fast-forward time by 250ms (half the delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still not be updated
    expect(result.current).toBe('initial value');

    // Fast-forward time to just after the delay
    act(() => {
      jest.advanceTimersByTime(251);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated value');
  });

  test('resets timer when value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    // Update the value
    rerender({ value: 'intermediate value', delay: 500 });

    // Advance time by 250ms (half the delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still be the initial value
    expect(result.current).toBe('initial value');

    // Update the value again before the delay completes
    rerender({ value: 'final value', delay: 500 });

    // Advance time by another 250ms (half the delay)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Value should still not be updated because the timer was reset
    expect(result.current).toBe('initial value');

    // Advance time to complete the delay for the second update
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Now the value should be the final value
    expect(result.current).toBe('final value');
  });

  test('works with different types of values', () => {
    // Test with a number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 500 } }
    );

    expect(numberResult.current).toBe(42);

    numberRerender({ value: 100, delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(numberResult.current).toBe(100);

    // Test with an object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: { name: 'John' }, delay: 500 } }
    );

    expect(objectResult.current).toEqual({ name: 'John' });

    objectRerender({ value: { name: 'Jane' }, delay: 500 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(objectResult.current).toEqual({ name: 'Jane' });
  });

  test('handles changing the delay time', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial value', delay: 500 } }
    );

    // Update with a longer delay
    rerender({ value: 'updated value', delay: 1000 });

    // Advance time by the original delay (500ms)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should not be updated yet due to longer delay
    expect(result.current).toBe('initial value');

    // Advance time to complete the new delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated value');
  });
});
