import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, withAuth } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock useAuthStore
jest.mock('@/store/useAuthStore', () => ({
  useAuthStore: jest.fn(),
  useInitializeAuth: jest.fn(),
}));

describe('AuthProvider', () => {
  // Mock functions and state
  const mockPush = jest.fn();
  const mockSetupAuthListener = jest.fn(() => () => {});

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks for router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Default pathname
    (usePathname as jest.Mock).mockReturnValue('/');

    // Default auth state
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });

    // Default auth initialization
    (useInitializeAuth as jest.Mock) = jest.fn().mockReturnValue({
      setupAuthListener: mockSetupAuthListener,
      user: null,
      initialized: false,
    });
  });

  test('renders children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child-element">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('initializes auth on mount', () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    expect(mockSetupAuthListener).toHaveBeenCalled();
  });

  test('redirects from admin paths when user is not admin', async () => {
    // Set pathname to admin path
    (usePathname as jest.Mock).mockReturnValue('/admin/dashboard');

    // Set authenticated but not admin
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isLoading: false,
    });

    render(
      <AuthProvider redirectIfUnauthenticated="/login">
        <div>Admin Page</div>
      </AuthProvider>
    );

    // Wait for the redirection
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects from protected paths when user is not authenticated', async () => {
    // Set pathname to protected path
    (usePathname as jest.Mock).mockReturnValue('/client/profile');

    // Set not authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });

    render(
      <AuthProvider redirectIfUnauthenticated="/login">
        <div>Protected Page</div>
      </AuthProvider>
    );

    // Wait for the redirection
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects authenticated users from login page', async () => {
    // Set pathname to login
    (usePathname as jest.Mock).mockReturnValue('/login');

    // Set authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isLoading: false,
    });

    render(
      <AuthProvider redirectIfAuthenticated="/dashboard">
        <div>Login Page</div>
      </AuthProvider>
    );

    // Wait for the redirection
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('does not redirect when isLoading is true', () => {
    // Set pathname to protected path
    (usePathname as jest.Mock).mockReturnValue('/client/profile');

    // Set loading state
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: true,
    });

    render(
      <AuthProvider redirectIfUnauthenticated="/login">
        <div>Protected Page</div>
      </AuthProvider>
    );

    // No redirect should happen
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('allows access to admin paths for admin users', () => {
    // Set pathname to admin path
    (usePathname as jest.Mock).mockReturnValue('/admin/dashboard');

    // Set authenticated and admin
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: true,
      isLoading: false,
    });

    render(
      <AuthProvider redirectIfUnauthenticated="/login">
        <div data-testid="admin-content">Admin Page</div>
      </AuthProvider>
    );

    // Content should be rendered and no redirect
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('allows access to protected paths for authenticated users', () => {
    // Set pathname to protected path
    (usePathname as jest.Mock).mockReturnValue('/client/profile');

    // Set authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isLoading: false,
    });

    render(
      <AuthProvider redirectIfUnauthenticated="/login">
        <div data-testid="protected-content">Protected Page</div>
      </AuthProvider>
    );

    // Content should be rendered and no redirect
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// Test withAuth HOC
describe('withAuth HOC', () => {
  // Mock functions and state
  const mockPush = jest.fn();

  // Mock component to wrap
  const MockComponent = () => <div data-testid="protected-component">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks for router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Default auth state
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });
  });

  test('renders loading state when isLoading is true', () => {
    // Set loading state
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: true,
    });

    const ProtectedComponent = withAuth(MockComponent);
    render(<ProtectedComponent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('redirects unauthenticated users', async () => {
    // Set not authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });

    const ProtectedComponent = withAuth(MockComponent);
    render(<ProtectedComponent />);

    // Should redirect to login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    // Component should not be rendered
    expect(screen.queryByTestId('protected-component')).not.toBeInTheDocument();
  });

  test('redirects non-admin users from admin-only routes', async () => {
    // Set authenticated but not admin
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isLoading: false,
    });

    const AdminComponent = withAuth(MockComponent, { adminOnly: true });
    render(<AdminComponent />);

    // Should redirect to login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    // Component should not be rendered
    expect(screen.queryByTestId('protected-component')).not.toBeInTheDocument();
  });

  test('renders component for authenticated users', () => {
    // Set authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: false,
      isLoading: false,
    });

    const ProtectedComponent = withAuth(MockComponent);
    render(<ProtectedComponent />);

    // Component should be rendered
    expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('renders admin component for admin users', () => {
    // Set authenticated and admin
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user-1' },
      isAdmin: true,
      isLoading: false,
    });

    const AdminComponent = withAuth(MockComponent, { adminOnly: true });
    render(<AdminComponent />);

    // Component should be rendered
    expect(screen.getByTestId('protected-component')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('respects custom redirect path', async () => {
    // Set not authenticated
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
    });

    const ProtectedComponent = withAuth(MockComponent, { redirectTo: '/custom-login' });
    render(<ProtectedComponent />);

    // Should redirect to custom path
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });
});
