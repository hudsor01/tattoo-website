import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import CustomersOptimistic from '@/components/admin/CustomersOptimistic';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === 'MMM d, yyyy') return 'Jan 1, 2024';
    if (formatStr === 'MMMM yyyy') return 'January 2024';
    return '2024-01-01';
  }),
}));

describe('CustomersOptimistic Component', () => {
  const mockCustomers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-1234',
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      postalCode: '75201',
      notes: 'Regular customer',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-5678',
      address: '',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      notes: '',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    
    // Default successful fetch for getting customers
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url === '/api/admin/customers' && options?.method === 'GET') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clients: mockCustomers }),
        });
      }
      if (url === '/api/admin/customers' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'new-id',
            firstName: 'New',
            lastName: 'Customer',
            email: 'new@example.com',
            phone: '555-9999',
            notes: 'Test notes',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T00:00:00Z',
          }),
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', async () => {
      // Mock delayed response
      mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      render(<CustomersOptimistic />);

      expect(screen.getByText('Loading customers...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we fetch your customer list')).toBeInTheDocument();
    });

    it('should render customers list after loading', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Customers')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('Manage your customer database (2 total)')).toBeInTheDocument();
    });

    it('should render empty state when no customers exist', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clients: [] }),
        })
      );

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('No customers found')).toBeInTheDocument();
        expect(screen.getByText('Get started by adding your first customer.')).toBeInTheDocument();
        expect(screen.getByText('Add Your First Customer')).toBeInTheDocument();
      });
    });

    it('should render error state when fetch fails', async () => {
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Customers')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch customers: 500')).toBeInTheDocument();
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load customers');
    });
  });

  describe('Search Functionality', () => {
    it('should filter customers based on search query', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search customers...');
      fireEvent.change(searchInput, { target: { value: 'john' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should show no results when search has no matches', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search customers...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('No customers match "nonexistent"')).toBeInTheDocument();
    });

    it('should search by email', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search customers...');
      fireEvent.change(searchInput, { target: { value: 'jane.smith' } });

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search customers...');
      fireEvent.change(searchInput, { target: { value: 'JOHN' } });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Customer Creation Dialog', () => {
    it('should open create dialog when Add Customer button is clicked', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      expect(screen.getByText('Add New Customer')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    });

    it('should close dialog when Cancel button is clicked', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));
      expect(screen.getByText('Add New Customer')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('First name is required');
    });

    it('should validate last name field', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      // Fill only first name
      await user.type(screen.getByLabelText('First Name *'), 'John');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Last name is required');
    });

    it('should validate email field', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      // Fill first and last name only
      await user.type(screen.getByLabelText('First Name *'), 'John');
      await user.type(screen.getByLabelText('Last Name *'), 'Doe');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Email is required');
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      await user.type(screen.getByLabelText('First Name *'), 'John');
      await user.type(screen.getByLabelText('Last Name *'), 'Doe');
      await user.type(screen.getByLabelText('Email *'), 'invalid-email');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
    });
  });

  describe('Customer Creation Process', () => {
    it('should successfully create a new customer', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      // Fill the form
      await user.type(screen.getByLabelText('First Name *'), 'New');
      await user.type(screen.getByLabelText('Last Name *'), 'Customer');
      await user.type(screen.getByLabelText('Email *'), 'new@example.com');
      await user.type(screen.getByLabelText('Phone'), '555-9999');
      await user.type(screen.getByLabelText('Notes'), 'Test notes');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/admin/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'New Customer',
            email: 'new@example.com',
            phone: '555-9999',
            notes: 'Test notes',
          }),
        });
      });

      expect(toast.success).toHaveBeenCalledWith('Customer created successfully!');
      expect(screen.queryByText('Add New Customer')).not.toBeInTheDocument();
    });

    it('should handle creation errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock error response
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url === '/api/admin/customers' && options?.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ clients: mockCustomers }),
          });
        }
        if (url === '/api/admin/customers' && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: () => Promise.resolve({ error: 'Customer already exists' }),
          });
        }
        return Promise.reject(new Error('Unexpected fetch call'));
      });

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      await user.type(screen.getByLabelText('First Name *'), 'John');
      await user.type(screen.getByLabelText('Last Name *'), 'Doe');
      await user.type(screen.getByLabelText('Email *'), 'john.doe@example.com');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Customer already exists');
      });

      // Dialog should remain open after error
      expect(screen.getByText('Add New Customer')).toBeInTheDocument();
    });

    it('should show loading state during creation', async () => {
      const user = userEvent.setup();
      
      // Mock delayed response
      mockFetch.mockImplementation((url: string, options?: RequestInit) => {
        if (url === '/api/admin/customers' && options?.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ clients: mockCustomers }),
          });
        }
        if (url === '/api/admin/customers' && options?.method === 'POST') {
          return new Promise(() => {}); // Never resolves to test loading state
        }
        return Promise.reject(new Error('Unexpected fetch call'));
      });

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      await user.type(screen.getByLabelText('First Name *'), 'John');
      await user.type(screen.getByLabelText('Last Name *'), 'Doe');
      await user.type(screen.getByLabelText('Email *'), 'john@example.com');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should reset form after successful creation', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      const firstNameInput = screen.getByLabelText('First Name *') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Last Name *') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email *') as HTMLInputElement;

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });

      // Open dialog again to check if form is reset
      fireEvent.click(screen.getByText('Add Customer'));

      expect(firstNameInput.value).toBe('');
      expect(lastNameInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });

    it('should add new customer to the list optimistically', async () => {
      const user = userEvent.setup();
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      await user.type(screen.getByLabelText('First Name *'), 'New');
      await user.type(screen.getByLabelText('Last Name *'), 'Customer');
      await user.type(screen.getByLabelText('Email *'), 'new@example.com');

      const submitButton = screen.getByText('Create Customer');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New Customer')).toBeInTheDocument();
        expect(screen.getByText('new@example.com')).toBeInTheDocument();
      });

      // Should update the count
      expect(screen.getByText('Manage your customer database (3 total)')).toBeInTheDocument();
    });
  });

  describe('Customer Details View', () => {
    it('should open customer details when view button is clicked', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button');
      const viewButton = viewButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('aria-label') === null
      );

      if (viewButton) {
        fireEvent.click(viewButton);

        expect(screen.getByText('Customer Details')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('555-1234')).toBeInTheDocument();
      }
    });

    it('should display customer address information', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button');
      const viewButton = viewButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('aria-label') === null
      );

      if (viewButton) {
        fireEvent.click(viewButton);

        expect(screen.getByText('Customer Details')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('Dallas, TX, 75201')).toBeInTheDocument();
      }
    });

    it('should display customer notes when available', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button');
      const viewButton = viewButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('aria-label') === null
      );

      if (viewButton) {
        fireEvent.click(viewButton);

        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Regular customer')).toBeInTheDocument();
      }
    });
  });

  describe('Data Transformation', () => {
    it('should handle customers with only name field', async () => {
      const customersWithNameOnly = [
        {
          id: '1',
          name: 'Single Name',
          email: 'single@example.com',
          phone: '555-1111',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clients: customersWithNameOnly }),
        })
      );

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Single Name')).toBeInTheDocument();
      });
    });

    it('should handle customers with split names', async () => {
      const customersWithSplitNames = [
        {
          id: '1',
          name: 'First Last Middle',
          email: 'multiple@example.com',
          phone: '555-2222',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clients: customersWithSplitNames }),
        })
      );

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('First Last Middle')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should retry loading customers when Try Again is clicked', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ clients: mockCustomers }),
        });
      });

      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Customers')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      expect(callCount).toBe(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      expect(screen.getByLabelText('First Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    });

    it('should have proper form validation attributes', async () => {
      render(<CustomersOptimistic />);

      await waitFor(() => {
        expect(screen.getByText('Add Customer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Customer'));

      const firstNameInput = screen.getByLabelText('First Name *');
      const emailInput = screen.getByLabelText('Email *');

      expect(firstNameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });
  });
});