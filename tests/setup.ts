import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props)
  },
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock tRPC with comprehensive admin router mocking
vi.mock('@/lib/trpc/client', () => {
const mockMutate = vi.fn()
const mockQuery = vi.fn()

return {
trpc: {
// Gallery router mocks
gallery: {
getPublicDesigns: {
useQuery: vi.fn(() => ({
data: { designs: [], total: 0 },
isLoading: false,
error: null,
})),
},
getStats: {
useQuery: vi.fn(() => ({
data: { totalDesigns: 0, approvedDesigns: 0, pendingDesigns: 0 },
isLoading: false,
})),
},
getDesignTypes: {
useQuery: vi.fn(() => ({
data: ['Traditional', 'Realism', 'Japanese'],
isLoading: false,
})),
},
create: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
})),
},
update: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
})),
},
delete: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
})),
},
},

// Admin router mocks
admin: {
getCustomers: {
useQuery: vi.fn(() => ({
data: {
customers: [],
pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 }
},
isLoading: false,
error: null,
})),
query: mockQuery,
},
createCustomer: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
isSuccess: false,
isError: false,
error: null,
})),
},
updateCustomer: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
})),
},
addCustomerNote: {
useMutation: vi.fn(() => ({
mutate: mockMutate,
isPending: false,
})),
},
getDashboardStats: {
useQuery: vi.fn(() => ({
data: {
counts: {
users: 0,
customers: 0,
bookings: 0,
appointments: 0,
artists: 0,
testimonials: 0,
designs: 0,
},
recentBookings: [],
upcomingAppointments: [],
},
isLoading: false,
error: null,
})),
},
},
},

// Expose mock functions for testing
__mocks: {
mockMutate,
mockQuery,
},
}
})
// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))