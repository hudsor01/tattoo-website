/**
 * Customer Test Utilities
 * 
 * Helper functions and mock data for customer-related tests
 */

import { vi } from 'vitest'
import type { Customer } from '@/types/customer-types'

// Mock customer data
export const mockCustomer: Customer = {
  id: 'customer-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  notes: 'Test customer',
  tags: [],
  lifetimeValue: 500,
  numberOfAppointments: 2,
  status: 'active',
  notificationPreference: 'email',
  allowsMarketing: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastAppointmentDate: new Date('2024-01-01'),
}

export const mockCustomerCreateInput = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+9876543210',
  address: '456 Oak Ave',
  city: 'Los Angeles',
  state: 'CA',
  zipCode: '90210',
  notes: 'New customer',
}

export const mockCustomersListResponse = {
  customers: [mockCustomer],
  pagination: {
    page: 1,
    limit: 20,
    totalCount: 1,
    totalPages: 1,
  },
}

// Helper function to create a mutation call tracker
export function createMutationTracker() {
  const calls: any[] = []
  
  const mockMutate = vi.fn((input: any) => {
    calls.push({
      input,
      timestamp: Date.now(),
      inputType: typeof input,
      inputKeys: input ? Object.keys(input) : [],
      isUndefined: input === undefined,
      isNull: input === null,
      isEmpty: input && typeof input === 'object' && Object.keys(input).length === 0,
    })
  })
  
  return {
    mockMutate,
    calls,
    getLastCall: () => calls[calls.length - 1],
    getCallCount: () => calls.length,
    clear: () => calls.splice(0, calls.length),
  }
}

// Helper function to simulate form input events
export function createFormInputEvent(value: string) {
  return {
    target: {
      value,
    },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as any
}

// Helper function to validate customer data structure
export function validateCustomerData(data: any, expectedFields: string[] = ['firstName', 'lastName', 'email']) {
  const issues: string[] = []
  
  if (data === undefined) {
    issues.push('Data is undefined')
  } else if (data === null) {
    issues.push('Data is null')
  } else if (typeof data !== 'object') {
    issues.push(`Data is not an object, got ${typeof data}`)
  } else {
    // Check for required fields
    expectedFields.forEach(field => {
      if (!(field in data)) {
        issues.push(`Missing required field: ${field}`)
      } else if (data[field] === undefined) {
        issues.push(`Field ${field} is undefined`)
      } else if (data[field] === null) {
        issues.push(`Field ${field} is null`)
      } else if (typeof data[field] === 'string' && data[field].trim() === '') {
        issues.push(`Field ${field} is empty string`)
      }
    })
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  }
}

// Helper to create mock tRPC context
export function createMockTRPCContext() {
  const mutationTracker = createMutationTracker()
  
  return {
    admin: {
      getCustomers: {
        useQuery: vi.fn(() => ({
          data: mockCustomersListResponse,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        })),
      },
      createCustomer: {
        useMutation: vi.fn(() => ({
          mutate: mutationTracker.mockMutate,
          isPending: false,
          isSuccess: false,
          isError: false,
          error: null,
        })),
      },
      updateCustomer: {
        useMutation: vi.fn(() => ({
          mutate: mutationTracker.mockMutate,
          isPending: false,
        })),
      },
      addCustomerNote: {
        useMutation: vi.fn(() => ({
          mutate: mutationTracker.mockMutate,
          isPending: false,
        })),
      },
    },
    _tracker: mutationTracker,
  }
}

// Helper to analyze serialization issues
export function analyzeSerializationIssues(data: any) {
  const analysis = {
    dataType: typeof data,
    isUndefined: data === undefined,
    isNull: data === null,
    isEmptyObject: data && typeof data === 'object' && Object.keys(data).length === 0,
    hasPrototype: data && Object.getPrototypeOf(data) !== Object.prototype,
    circularReference: false,
    nonSerializableValues: [] as string[],
  }
  
  if (data && typeof data === 'object') {
    try {
      JSON.stringify(data)
    } catch (error) {
      if (error instanceof Error && error.message.includes('circular')) {
        analysis.circularReference = true
      }
    }
    
    // Check for non-serializable values
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'function') {
        analysis.nonSerializableValues.push(`${key}: function`)
      } else if (typeof value === 'symbol') {
        analysis.nonSerializableValues.push(`${key}: symbol`)
      } else if (value instanceof Date) {
        // Dates are serializable but might cause issues
        analysis.nonSerializableValues.push(`${key}: Date object`)
      }
    })
  }
  
  return analysis
}

// Helper to simulate React state management issues
export function createStateMutationWrapper(initialState: any) {
  let currentState = initialState
  const stateHistory: any[] = [initialState]
  
  const setState = vi.fn((newState: any) => {
    if (typeof newState === 'function') {
      currentState = newState(currentState)
    } else {
      currentState = newState
    }
    stateHistory.push(currentState)
  })
  
  return {
    getState: () => currentState,
    setState,
    getHistory: () => [...stateHistory],
    getLastState: () => stateHistory[stateHistory.length - 1],
    reset: () => {
      currentState = initialState
      stateHistory.length = 0
      stateHistory.push(initialState)
    },
  }
}

// Helper to test form field updates
export function testFormFieldUpdate(
  component: any,
  fieldName: string,
  value: string,
  expectedStateUpdate: (prev: any) => any
) {
  const event = createFormInputEvent(value)
  
  // Simulate the onChange handler
  const onChange = vi.fn((e: any) => {
    expectedStateUpdate({ [fieldName]: e.target.value })
  })
  
  onChange(event)
  
  return {
    event,
    onChange,
    wasCalled: onChange.mock.calls.length > 0,
    lastCall: onChange.mock.calls[onChange.mock.calls.length - 1],
  }
}

// Debug helper to log detailed information about data flow
export function debugDataFlow(label: string, data: any) {
  console.log(`=== ${label} ===`)
  console.log('Type:', typeof data)
  console.log('Value:', data)
  console.log('JSON:', JSON.stringify(data, null, 2))
  console.log('Keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A')
  console.log('Validation:', validateCustomerData(data))
  console.log('Serialization:', analyzeSerializationIssues(data))
  console.log('================\n')
}