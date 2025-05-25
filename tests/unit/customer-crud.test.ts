import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import CustomersInfinite from '@/components/admin/CustomersInfinite';
import type { AppRouter } from '@/lib/trpc/app-router';
import { toast } from 'sonner';

// Mock external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/trpc/client', () => ({
  trpc: createTRPCReact<AppRouter>(),
}));

// Mock tRPC procedures
const mockCreateCustomer = vi.fn();
const mockGetCustomers = vi.fn();
const mockUpdateCustomer = vi.fn();
const mockAddCustomerNote = vi.fn();

const mockTrpcHooks = {
  admin: {
    createCustomer: {
      useMutation: vi.fn(() => ({
        mutate: mockCreateCustomer,
        isPending: false,
        isError: false,
        error: null,
      })),
    },
    getCustomers: {
      query: mockGetCustomers,
    },
    updateCustomer: {
      useMutation: vi.fn(() => ({
        mutate: mockUpdateCustomer,
        isPending: false,
      })),
    },
    addCustomerNote: {
      useMutation: vi.fn(() => ({
        mutate: mockAddCustomerNote,
        isPending: false,
      })),
    },
  },
};

// Mock the custom infinite query hook
vi.mock('@/hooks/use-trpc-infinite-query', () => ({
  useTRPCInfiniteQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    isFetching: false,
    hasMore: false,
    fetchNextPage: vi.fn(),
    count: 0,
    refetch: vi.fn(),
  })),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const trpc = createTRPCReact<AppRouter>();
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/api/trpc',
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};

describe('Customer CRUD Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCreateCustomer.mockImplementation((data, options) => {
      console.log('Mock createCustomer called with:', data);
      // Simulate successful creation
      options?.onSuccess?.();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Creation Form', () => {
    it('should render the create customer dialog when opened', async () => {
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Find and click the create customer button
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Check if dialog opened
      expect(screen.getByText(/add new customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should update form state when user types in fields', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Open the create dialog
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Fill in form fields
      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');

      // Verify form state
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(emailInput.value).toBe('john.doe@example.com');
    });

    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Open the create dialog
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Try to submit without filling required fields
      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      // Should show validation errors
      expect(toast.error).toHaveBeenCalledWith('First name is required');
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Open dialog and fill invalid email
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
    });

    it('should successfully submit valid form data', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Open dialog and fill valid data
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      // Verify the mutation was called with correct data
      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: undefined,
          address: undefined,
          city: undefined,
          state: undefined,
          zipCode: undefined,
          notes: undefined,
        });
      });
    });

    it('should handle tRPC mutation errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock error response
      mockCreateCustomer.mockImplementation((data, options) => {
        options?.onError?.(new Error('Database connection failed'));
      });

      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Fill and submit form
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Database connection failed');
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      // Fill and submit form
      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      const lastNameInput = screen.getByLabelText(/last name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@example.com');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Customer created successfully');
      });

      // Form should be reset
      expect(firstNameInput.value).toBe('');
      expect(lastNameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });
  });

  describe('Data Serialization Tests', () => {
    it('should properly serialize form data for tRPC', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Fill form with all fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone/i), '555-1234');
      await user.type(screen.getByLabelText(/address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'New York');
      await user.type(screen.getByLabelText(/state/i), 'NY');
      await user.type(screen.getByLabelText(/zip code/i), '10001');
      await user.type(screen.getByLabelText(/notes/i), 'Test customer');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-1234',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          notes: 'Test customer',
        });
      });
    });

    it('should handle empty optional fields correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Fill only required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: undefined,
          address: undefined,
          city: undefined,
          state: undefined,
          zipCode: undefined,
          notes: undefined,
        });
      });
    });

    it('should trim whitespace from form inputs', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Fill fields with extra whitespace
      await user.type(screen.getByLabelText(/first name/i), '  John  ');
      await user.type(screen.getByLabelText(/last name/i), '  Doe  ');
      await user.type(screen.getByLabelText(/email/i), '  john.doe@example.com  ');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateCustomer).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: undefined,
          address: undefined,
          city: undefined,
          state: undefined,
          zipCode: undefined,
          notes: undefined,
        });
      });
    });
  });

  describe('Bug Reproduction Tests', () => {
    it('should reproduce undefined input bug scenario', async () => {
      const user = userEvent.setup();
      
      // Mock console.log to capture debug output
      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <TestWrapper>
          <CustomersInfinite />
        </TestWrapper>
      );

      const createButton = screen.getByText(/add customer/i);
      fireEvent.click(createButton);

      // Fill form exactly as user would
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');

      const submitButton = screen.getByText(/create customer/i);
      await user.click(submitButton);

      // Check if console logs show the debug information
      await waitFor(() => {
        const logCalls = consoleSpy.mock.calls;
        const formSubmitLog = logCalls.find(call => 
          call[0]?.includes('Form submitted with newCustomer state:')
        );
        
        if (formSubmitLog) {
          console.log('Debug logs captured:', formSubmitLog);
        }
        
        expect(mockCreateCustomer).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should test tRPC client serialization directly', () => {
      const testData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
        notes: undefined,
      };

      // Test JSON serialization (what tRPC does internally)
      const serialized = JSON.stringify(testData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        // Note: undefined values are removed in JSON serialization
      });
    });
  });
});