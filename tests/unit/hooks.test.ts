import { renderHook, act } from '@testing-library/react-hooks'
import { useDebounce } from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useScrollLock } from '@/hooks/use-scroll-lock'

describe('useDebounce', () => {
  jest.useFakeTimers()

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })
    
    // Value shouldn't change immediately
    expect(result.current).toBe('initial')

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on new value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Update value multiple times
    rerender({ value: 'update1', delay: 500 })
    jest.advanceTimersByTime(250)
    rerender({ value: 'update2', delay: 500 })
    jest.advanceTimersByTime(250)
    rerender({ value: 'update3', delay: 500 })

    // Fast forward past all delays
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Should only have the last value
    expect(result.current).toBe('update3')
  })

  afterEach(() => {
    jest.clearAllTimers()
  })
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default value', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )

    expect(result.current[0]).toBe('default')
  })

  it('should get value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored'))
    
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )

    expect(result.current[0]).toBe('stored')
  })

  it('should set value to localStorage', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
  })

  it('should handle complex objects', () => {
    const { result } = renderHook(() => 
      useLocalStorage('test-key', { name: 'test' })
    )

    act(() => {
      result.current[1]({ name: 'updated', value: 123 })
    })

    expect(result.current[0]).toEqual({ name: 'updated', value: 123 })
  })

  it('should handle localStorage errors', () => {
    // Mock localStorage to throw error
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
    mockSetItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => 
      useLocalStorage('test-key', 'default')
    )

    // Should not throw when setting
    expect(() => {
      act(() => {
        result.current[1]('new value')
      })
    }).not.toThrow()

    mockSetItem.mockRestore()
  })
})

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  it('should return false for non-matching query', () => {
    const { result } = renderHook(() => 
      useMediaQuery('(min-width: 768px)')
    )

    expect(result.current).toBe(false)
  })

  it('should return true for matching query', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => 
      useMediaQuery('(min-width: 768px)')
    )

    expect(result.current).toBe(true)
  })

  it('should update when media query changes', () => {
    let listener: ((e: MediaQueryListEvent) => void) | null = null
    
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, cb) => {
        if (event === 'change') listener = cb
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    const { result } = renderHook(() => 
      useMediaQuery('(min-width: 768px)')
    )

    expect(result.current).toBe(false)

    // Simulate media query change
    act(() => {
      if (listener) {
        listener({ matches: true } as MediaQueryListEvent)
      }
    })

    expect(result.current).toBe(true)
  })
})

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  it('should lock scroll when enabled', () => {
    const { result } = renderHook(() => useScrollLock())

    act(() => {
      result.current.lock()
    })

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should unlock scroll when disabled', () => {
    const { result } = renderHook(() => useScrollLock())

    act(() => {
      result.current.lock()
    })

    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      result.current.unlock()
    })

    expect(document.body.style.overflow).toBe('')
  })

  it('should restore original overflow style', () => {
    document.body.style.overflow = 'auto'
    
    const { result } = renderHook(() => useScrollLock())

    act(() => {
      result.current.lock()
    })

    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      result.current.unlock()
    })

    expect(document.body.style.overflow).toBe('auto')
  })

  it('should handle multiple locks correctly', () => {
    const { result: result1 } = renderHook(() => useScrollLock())
    const { result: result2 } = renderHook(() => useScrollLock())

    act(() => {
      result1.current.lock()
      result2.current.lock()
    })

    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      result1.current.unlock()
    })

    // Should still be locked because result2 is still locked
    expect(document.body.style.overflow).toBe('hidden')

    act(() => {
      result2.current.unlock()
    })

    // Now should be unlocked
    expect(document.body.style.overflow).toBe('')
  })
})

// Mock hook implementations (these would be imported from actual hooks)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

function useScrollLock() {
  const scrollLocked = React.useRef(false)
  const originalOverflow = React.useRef('')

  const lock = React.useCallback(() => {
    if (!scrollLocked.current) {
      originalOverflow.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      scrollLocked.current = true
    }
  }, [])

  const unlock = React.useCallback(() => {
    if (scrollLocked.current) {
      document.body.style.overflow = originalOverflow.current
      scrollLocked.current = false
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (scrollLocked.current) {
        document.body.style.overflow = originalOverflow.current
      }
    }
  }, [])

  return { lock, unlock }
}

const React = require('react')