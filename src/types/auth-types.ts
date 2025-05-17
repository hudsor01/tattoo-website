/**
 * auth-types.ts
 *
 * Consolidated authentication-related type definitions for the application.
 * This includes user authentication, authorization, sessions, and permissions.
 */

import { z } from 'zod';
import { UserRole } from './enum-types';
import type { ID } from './api-types';

/**
 * Authentication error interface
 */
export interface AuthError {
  message: string;
  code?: string;
  status?: number;
  cause?: unknown;
}

// Base auth types

/**
 * User data
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole | string;
  image?: string;
  emailVerified?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

/**
 * User with profile data
 */
export interface UserWithProfile extends User {
  profileImage?: string;
  profile?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    bio?: string;
  };
  clientId?: ID;
  artistId?: ID;
  permissions?: string[];
  isEmailVerified?: boolean;
}

/**
 * Session object
 */
export interface Session {
  sessionToken?: string;
  userId: string;
  expires: string;
  user?: User;
  expiresAt?: number;
  issuedAt?: number;
  token?: string;
  email?: string;
  role?: UserRole | string;
}

/**
 * Verification token for email verification or password reset
 */
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: string;
}

/**
 * Authentication provider (OAuth)
 */
export type AuthProvider =
  | 'google'
  | 'facebook'
  | 'twitter'
  | 'github'
  | 'email'
  | 'password'
  | 'instagram';

// Login and registration data

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Authentication request
 */
export interface AuthRequest {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Registration data
 */
export interface RegistrationData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

/**
 * Registration request
 */
export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
  agreeToTerms: boolean;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: UserWithProfile;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Form types

/**
 * Login form values
 */
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register form values
 */
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Password reset and update

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update request
 */
export interface PasswordUpdateRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Password reset form values
 */
export interface PasswordResetFormValues {
  email: string;
}

/**
 * Password reset
 */
export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Change password
 */
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change password form values
 */
export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User status

/**
 * User status
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

// OAuth related types

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * OAuth token response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

/**
 * OAuth login request
 */
export interface OAuthLoginRequest {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
}

/**
 * User profile data from OAuth providers
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  [key: string]: unknown;
}

/**
 * Two-factor authentication method
 */
export type TwoFactorMethod = 'email' | 'sms' | 'app';

/**
 * Two-factor authentication setup
 */
export interface TwoFactorSetup {
  enabled: boolean;
  method: TwoFactorMethod;
  verified: boolean;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
}

/**
 * Two-factor verification request
 */
export interface TwoFactorVerificationRequest {
  method: TwoFactorMethod;
  code: string;
  remember?: boolean;
}

// Auth state and context

/**
 * Auth state
 */
export interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  initialized: boolean;
  error: Error | null;
  token?: string | null;
  refreshTokenValue?: string | null;
  isAuthenticated?: boolean;

  // Internal actions (not exposed in useAuth hook)
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: Error | null) => void;
  setIsInitialized: (initialized: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;

  // Public actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<User | null | { error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<User | null | { error: Error | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthHookReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithProvider: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
}

/**
 * Auth context state
 */
export interface AuthContextState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}

/**
 * Auth context methods
 */
export interface AuthContextMethods {
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (data: RegistrationRequest) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, password: string, confirmPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<UserWithProfile>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
}

/**
 * Auth context interface
 */
export interface AuthContextInterface extends AuthState, AuthContextMethods {}

/**
 * Auth Context Value for Supabase implementation
 */
export interface AuthContextValue {
  /**
   * Current authenticated user or null
   */
  user: User | null;

  /**
   * Current session or null
   */
  session: Session | null;

  /**
   * Whether auth is loading
   */
  isLoading: boolean;

  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether user has admin role
   */
  isAdmin: boolean;

  /**
   * Authentication error if any
   */
  error: Error | null;

  /**
   * Sign in with email and password
   */
  signIn: (email: string, password: string) => Promise<User | null>;

  /**
   * Sign out the current user
   */
  signOut: () => Promise<void>;

  /**
   * Refresh user data
   */
  refreshUser: () => Promise<User | null>;
}

/**
 * Auth Provider Props
 */
export interface AuthProviderProps {
  /**
   * React children
   */
  children: React.ReactNode;

  /**
   * Paths that require admin role
   */
  adminPaths?: string[];

  /**
   * Paths that require authentication
   */
  protectedPaths?: string[];

  /**
   * Path to redirect for login
   */
  loginPath?: string;

  /**
   * Path to redirect for admin login
   */
  adminLoginPath?: string;

  /**
   * Whether to require auth for all paths by default
   */
  requireAuth?: boolean;

  /**
   * Path to redirect unauthorized users to
   */
  unauthorizedPath?: string;
}

// Permissions and roles

/**
 * Permission interface
 */
export interface Permission {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions {
  name: UserRole | string;
  displayName: string;
  description?: string;
  permissions: Permission[];
}

// Zod Schema Definitions
// These can be used for validation on both client and server

/**
 * User Role Schema
 */
export const UserRoleSchema = z.enum([
  UserRole.ADMIN,
  UserRole.ARTIST,
  UserRole.CLIENT,
  UserRole.GUEST,
]);

/**
 * User Status Schema
 */
export const UserStatusSchema = z.enum([
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.PENDING,
  UserStatus.BLOCKED,
]);

/**
 * User Schema
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.union([UserRoleSchema, z.string()]),
  image: z.string().optional(),
  emailVerified: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional(),
});

/**
 * Login Credentials Schema
 */
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

/**
 * Password Reset Request Schema
 */
export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});

/**
 * Password Reset Schema
 */
export const PasswordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
});

/**
 * Auth State Schema
 */
export const AuthStateSchema = z.object({
  user: UserSchema.nullable(),
  isLoading: z.boolean(),
  error: z.string().nullable(),
});

/**
 * Session Schema
 */
export const SessionSchema = z.object({
  sessionToken: z.string().optional(),
  userId: z.string(),
  expires: z.string().or(z.date()),
  user: UserSchema.optional(),
  expiresAt: z.number().optional(),
  issuedAt: z.number().optional(),
  token: z.string().optional(),
  email: z.string().email().optional(),
  role: z.union([UserRoleSchema, z.string()]).optional(),
});

/**
 * Verification Token Schema
 */
export const VerificationTokenSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.string().or(z.date()),
});

/**
 * Auth Provider Schema
 */
export const AuthProviderSchema = z.enum([
  'google',
  'facebook',
  'twitter',
  'github',
  'email',
  'password',
  'instagram',
]);

/**
 * OAuth Provider Config Schema
 */
export const OAuthProviderConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
});

/**
 * OAuth Token Response Schema
 */
export const OAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
});

/**
 * User Profile Schema from OAuth providers
 */
export const UserProfileSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    given_name: z.string().optional(),
    family_name: z.string().optional(),
    picture: z.string().optional(),
  })
  .passthrough(); // Allow additional properties

/**
 * Auth Context State Schema
 */
export const AuthContextStateSchema = z.object({
  user: UserSchema.nullable(),
  session: SessionSchema.nullable(),
  isLoading: z.boolean(),
  isAdmin: z.boolean(),
});
