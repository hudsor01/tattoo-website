import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';

// Mock withSentry
jest.mock('@/lib/sentry/middleware', () => ({
  withSentry: jest.fn((request, handler) => handler()),
}));

// Mock createServerClient
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Middleware', () => {
  // Mock environment variables
  const originalEnv = process.env;

  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock NextResponse methods
    jest.spyOn(NextResponse, 'next').mockImplementation(({ request }) => {
      return {
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
      } as any;
    });

    jest.spyOn(NextResponse, 'redirect').mockImplementation(url => {
      return {
        cookies: {
          getAll: jest.fn().mockReturnValue([]),
          set: jest.fn(),
        },
        url,
      } as any;
    });

    // Mock Supabase client
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
        signOut: jest.fn(),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Reset environment
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createMockRequest(url: string): NextRequest {
    const baseUrl = 'https://example.com';
    return {
      nextUrl: new URL(url, baseUrl),
      url: baseUrl + url,
      cookies: {
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
      },
    } as unknown as NextRequest;
  }

  test('allows access to public routes without authentication', async () => {
    // Mock unauthenticated user
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test a public route
    const request = createMockRequest('/');
    const response = await middleware(request);

    // Should not redirect
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
  });

  test('redirects from client area to login when unauthenticated', async () => {
    // Mock unauthenticated user
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test a client protected route
    const request = createMockRequest('/client/dashboard');
    const response = await middleware(request);

    // Should redirect to login
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((NextResponse.redirect as jest.Mock).mock.calls[0][0].toString()).toContain('/client/login');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Redirecting unauthenticated user'), expect.any(Object));
  });

  test('redirects from admin area to login when unauthenticated', async () => {
    // Mock unauthenticated user
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test an admin protected route
    const request = createMockRequest('/admin/dashboard');
    const response = await middleware(request);

    // Should redirect to login
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((NextResponse.redirect as jest.Mock).mock.calls[0][0].toString()).toContain('/admin/login');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Redirecting unauthenticated user'), expect.any(Object));
  });

  test('allows authenticated users to access client area', async () => {
    // Mock authenticated user
    const mockUser = { id: 'user-1', email: 'user@example.com' };
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test a client protected route
    const request = createMockRequest('/client/dashboard');
    await middleware(request);

    // Should not redirect
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  test('redirects non-admin users from admin area and signs them out', async () => {
    // Mock authenticated but non-admin user
    const mockUser = { id: 'user-1', email: 'user@example.com', user_metadata: { role: 'user' } };
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        signOut: jest.fn().mockResolvedValue({}),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test an admin protected route
    const request = createMockRequest('/admin/dashboard');
    // Add user to request (middleware does this)
    Object.defineProperty(request, 'user', {
      value: mockUser,
      writable: true,
    });
    
    const response = await middleware(request);

    // Should redirect to login with error
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((NextResponse.redirect as jest.Mock).mock.calls[0][0].toString()).toContain('/admin/login?error=insufficient_permissions');
    
    // Should sign out the user
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    
    // Should log warning
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unauthorized access attempt'), expect.any(Object));
  });

  test('allows admin users to access admin area', async () => {
    // Mock admin user
    const mockUser = { id: 'admin-1', email: 'admin@example.com', user_metadata: { role: 'admin' } };
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test an admin protected route
    const request = createMockRequest('/admin/dashboard');
    // Add user to request (middleware does this)
    Object.defineProperty(request, 'user', {
      value: mockUser,
      writable: true,
    });
    
    const response = await middleware(request);

    // Should not redirect
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  test('redirects setup routes to home in production', async () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Test a setup route
    const request = createMockRequest('/setup/initial');
    const response = await middleware(request);

    // Should redirect to home
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((NextResponse.redirect as jest.Mock).mock.calls[0][0].toString()).toContain('/');
  });

  test('redirects force-access routes to login in production', async () => {
    // Set environment to production
    process.env.NODE_ENV = 'production';

    // Test a force-access route
    const request = createMockRequest('/admin/force-access');
    const response = await middleware(request);

    // Should redirect to login
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((NextResponse.redirect as jest.Mock).mock.calls[0][0].toString()).toContain('/admin/login');
  });

  test('handles errors during auth refresh gracefully', async () => {
    // Mock auth error
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockRejectedValue(new Error('Auth refresh failed')),
      },
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Test any route
    const request = createMockRequest('/client/dashboard');
    const response = await middleware(request);

    // Should log error
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error refreshing auth'), expect.any(Object));
    
    // Should still redirect unauthenticated user
    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  test('handles unhandled errors gracefully', async () => {
    // Mock fatal error in middleware
    (createServerClient as jest.Mock).mockImplementation(() => {
      throw new Error('Unhandled error in middleware');
    });

    // Test any route
    const request = createMockRequest('/');
    const response = await middleware(request);

    // Should log error
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Unhandled error'), expect.any(Object));
  });
});
