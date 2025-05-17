import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/store/useAuthStore';
import { createClient } from '@/lib/supabase/client';
import { checkIsAdmin } from '@/lib/supabase/database-functions';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

// Mock database functions
jest.mock('@/lib/supabase/database-functions', () => ({
  checkIsAdmin: jest.fn(),
}));

describe('useAuthStore', () => {
  // Mock user and session data
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: 9999999999,
    user: mockUser,
  };

  // Mock Supabase auth functions
  const mockSignInWithPassword = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetUser = jest.fn();
  const mockGetSession = jest.fn();
  const mockOnAuthStateChange = jest.fn();

  // Setup and teardown
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset the Zustand store
    act(() => {
      useAuthStore.setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
        initialized: false,
      });
    });

    // Setup mock Supabase client
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getUser: mockGetUser,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    });

    // Mock default auth checks
    (checkIsAdmin as jest.Mock).mockResolvedValue(false);

    // Session storage mock
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
        removeItem: jest.fn(() => null),
      },
      writable: true,
    });
  });

  test('initial state is correctly set', () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.initialized).toBe(false);
  });

  test('signIn function with valid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuthStore());

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password');
    });

    // Check if signIn was called with correct parameters
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });

    // Check loading state during signIn
    expect(result.current.isLoading).toBe(false);

    // Check the return value
    expect(signInResult).toEqual({ error: null });

    // User data is not automatically set in signIn; it's handled by auth listener
  });

  test('signIn function with invalid credentials', async () => {
    const mockError = new Error('Invalid login credentials');
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const { result } = renderHook(() => useAuthStore());

    let signInResult;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'wrong-password');
    });

    // Check if signIn was called with correct parameters
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrong-password',
    });

    // Check the return value
    expect(signInResult).toEqual({ error: mockError });
  });

  test('signUp function creates a new user', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuthStore());

    let signUpResult;
    await act(async () => {
      signUpResult = await result.current.signUp('new-user@example.com', 'password', {
        name: 'New User',
      });
    });

    // Check if signUp was called with correct parameters
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      password: 'password',
      options: {
        data: { name: 'New User' },
      },
    });

    // Check the return value
    expect(signUpResult).toEqual({ error: null });
  });

  test('signOut function clears user state', async () => {
    mockSignOut.mockResolvedValue({ error: null });

    // Set initial state with a user
    act(() => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAdmin: true,
      });
    });

    const { result } = renderHook(() => useAuthStore());

    // Verify initial state
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAdmin).toBe(true);

    // Sign out
    await act(async () => {
      await result.current.signOut();
    });

    // Check if signOut was called
    expect(mockSignOut).toHaveBeenCalled();

    // Check if user state was cleared
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  test('refreshUser function updates user and session state', async () => {
    // Mock getUser with valid user
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock getSession with valid session
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Mock checkIsAdmin to return true
    (checkIsAdmin as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useAuthStore());

    // Refresh user data
    await act(async () => {
      await result.current.refreshUser();
    });

    // Check if auth methods were called
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockGetSession).toHaveBeenCalled();
    expect(checkIsAdmin).toHaveBeenCalledWith(mockUser);

    // Check if state was updated correctly
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.initialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('refreshUser handles error when user fetch fails', async () => {
    // Mock getUser with error
    const mockError = new Error('Failed to get user');
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    // Set initial state with a user
    act(() => {
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAdmin: true,
      });
    });

    const { result } = renderHook(() => useAuthStore());

    // Refresh user data
    await act(async () => {
      await result.current.refreshUser();
    });

    // Check if user state was cleared due to error
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.initialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('refreshUser does not run concurrent refreshes', async () => {
    // Set isLoading to true
    act(() => {
      useAuthStore.setState({
        isLoading: true,
      });
    });

    const { result } = renderHook(() => useAuthStore());

    // Try to refresh user data
    await act(async () => {
      await result.current.refreshUser();
    });

    // Check that getUser was not called due to isLoading being true
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  test('state setters work correctly', () => {
    const { result } = renderHook(() => useAuthStore());

    // Test setUser
    act(() => {
      result.current.setUser(mockUser);
    });
    expect(result.current.user).toEqual(mockUser);

    // Test setSession
    act(() => {
      result.current.setSession(mockSession);
    });
    expect(result.current.session).toEqual(mockSession);

    // Test setIsLoading
    act(() => {
      result.current.setIsLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    // Test setIsAdmin
    act(() => {
      result.current.setIsAdmin(true);
    });
    expect(result.current.isAdmin).toBe(true);

    // Test setInitialized
    act(() => {
      result.current.setInitialized(true);
    });
    expect(result.current.initialized).toBe(true);
  });
});
