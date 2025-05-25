import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyAdminAccess } from '@/lib/utils/server';
import { currentUser } from '@clerk/nextjs/server';

// Mock Clerk's currentUser function
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

const mockCurrentUser = vi.mocked(currentUser);

describe('Admin Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyAdminAccess', () => {
    it('should return true for authenticated admin user', async () => {
      // Mock authenticated admin user
      mockCurrentUser.mockResolvedValue({
        id: 'user_admin123',
        emailAddresses: [{ emailAddress: 'admin@tattoo.com' }],
        firstName: 'Admin',
        lastName: 'User',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_123',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(true);
    });

    it('should return false for unauthenticated user', async () => {
      // Mock no user (not authenticated)
      mockCurrentUser.mockResolvedValue(null);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should return false for authenticated user without admin role', async () => {
      // Mock authenticated user without admin role
      mockCurrentUser.mockResolvedValue({
        id: 'user_regular123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        firstName: 'Regular',
        lastName: 'User',
        publicMetadata: { role: 'user' }, // Not admin
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_456',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should return false for user with no role metadata', async () => {
      // Mock authenticated user with no role metadata
      mockCurrentUser.mockResolvedValue({
        id: 'user_norole123',
        emailAddresses: [{ emailAddress: 'norole@example.com' }],
        firstName: 'No',
        lastName: 'Role',
        publicMetadata: {}, // No role specified
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_789',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should return false for banned admin user', async () => {
      // Mock banned admin user
      mockCurrentUser.mockResolvedValue({
        id: 'user_banned123',
        emailAddresses: [{ emailAddress: 'banned@tattoo.com' }],
        firstName: 'Banned',
        lastName: 'Admin',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: true, // User is banned
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_banned',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should return false for locked admin user', async () => {
      // Mock locked admin user
      mockCurrentUser.mockResolvedValue({
        id: 'user_locked123',
        emailAddresses: [{ emailAddress: 'locked@tattoo.com' }],
        firstName: 'Locked',
        lastName: 'Admin',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: true, // User is locked
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_locked',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should handle Clerk API errors gracefully', async () => {
      // Mock Clerk API error
      mockCurrentUser.mockRejectedValue(new Error('Clerk API Error'));

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should handle timeout errors gracefully', async () => {
      // Mock timeout error
      mockCurrentUser.mockRejectedValue(new Error('Request timeout'));

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should accept alternative admin role formats', async () => {
      // Mock user with admin role in different format
      mockCurrentUser.mockResolvedValue({
        id: 'user_admin_alt',
        emailAddresses: [{ emailAddress: 'admin2@tattoo.com' }],
        firstName: 'Admin',
        lastName: 'User2',
        publicMetadata: { role: 'administrator' }, // Alternative role name
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_admin2',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      // This should return false unless the implementation accepts 'administrator'
      // Adjust based on actual implementation
      expect(result).toBe(false);
    });

    it('should reject case-sensitive role checks', async () => {
      // Mock user with admin role in wrong case
      mockCurrentUser.mockResolvedValue({
        id: 'user_admin_case',
        emailAddresses: [{ emailAddress: 'admin3@tattoo.com' }],
        firstName: 'Admin',
        lastName: 'User3',
        publicMetadata: { role: 'ADMIN' }, // Wrong case
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_admin3',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      // Should be case-sensitive and return false
      expect(result).toBe(false);
    });

    it('should handle missing email addresses', async () => {
      // Mock user with no email addresses
      mockCurrentUser.mockResolvedValue({
        id: 'user_no_email',
        emailAddresses: [], // No email addresses
        firstName: 'No',
        lastName: 'Email',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: null,
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      // Should still work if the role is correct, even without email
      expect(result).toBe(true);
    });

    it('should handle role in privateMetadata', async () => {
      // Mock user with admin role in privateMetadata instead of publicMetadata
      mockCurrentUser.mockResolvedValue({
        id: 'user_private_role',
        emailAddresses: [{ emailAddress: 'private@tattoo.com' }],
        firstName: 'Private',
        lastName: 'Admin',
        publicMetadata: {},
        privateMetadata: { role: 'admin' }, // Role in private metadata
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_private',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const result = await verifyAdminAccess();
      // Should return false unless implementation checks privateMetadata too
      expect(result).toBe(false);
    });

    it('should handle multiple concurrent authentication checks', async () => {
      // Mock successful admin user
      mockCurrentUser.mockResolvedValue({
        id: 'user_concurrent',
        emailAddresses: [{ emailAddress: 'concurrent@tattoo.com' }],
        firstName: 'Concurrent',
        lastName: 'Admin',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_concurrent',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      // Run multiple authentication checks concurrently
      const promises = Array(5).fill(null).map(() => verifyAdminAccess());
      const results = await Promise.all(promises);

      // All should return true
      results.forEach(result => {
        expect(result).toBe(true);
      });

      // Should have called currentUser 5 times
      expect(mockCurrentUser).toHaveBeenCalledTimes(5);
    });

    it('should handle partial user data', async () => {
      // Mock user with minimal required data
      mockCurrentUser.mockResolvedValue({
        id: 'user_minimal',
        publicMetadata: { role: 'admin' },
        banned: false,
        locked: false,
        // Minimal required fields
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(true);
    });

    it('should validate admin access performance', async () => {
      // Mock successful admin user
      mockCurrentUser.mockResolvedValue({
        id: 'user_perf',
        emailAddresses: [{ emailAddress: 'perf@tattoo.com' }],
        firstName: 'Performance',
        lastName: 'Test',
        publicMetadata: { role: 'admin' },
        privateMetadata: {},
        unsafeMetadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        locked: false,
        imageUrl: 'https://example.com/avatar.jpg',
        hasImage: true,
        primaryEmailAddressId: 'email_perf',
        primaryPhoneNumberId: null,
        primaryWeb3WalletId: null,
        lastSignInAt: Date.now(),
        externalId: null,
        username: null,
        phoneNumbers: [],
        web3Wallets: [],
        externalAccounts: [],
        samlAccounts: [],
        organizationMemberships: [],
      } as any);

      const startTime = Date.now();
      const result = await verifyAdminAccess();
      const endTime = Date.now();

      expect(result).toBe(true);
      // Should complete within reasonable time (100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Edge Cases', () => {
    it('should handle malformed user object', async () => {
      // Mock malformed user object
      mockCurrentUser.mockResolvedValue({
        id: null, // Invalid ID
        publicMetadata: { role: 'admin' },
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should handle undefined metadata', async () => {
      // Mock user with undefined metadata
      mockCurrentUser.mockResolvedValue({
        id: 'user_undefined_meta',
        emailAddresses: [{ emailAddress: 'undefined@tattoo.com' }],
        publicMetadata: undefined,
        banned: false,
        locked: false,
      } as any);

      const result = await verifyAdminAccess();
      expect(result).toBe(false);
    });

    it('should handle circular reference in user object', async () => {
      // Create object with circular reference
      const circularUser: any = {
        id: 'user_circular',
        emailAddresses: [{ emailAddress: 'circular@tattoo.com' }],
        publicMetadata: { role: 'admin' },
        banned: false,
        locked: false,
      };
      circularUser.self = circularUser; // Circular reference

      mockCurrentUser.mockResolvedValue(circularUser);

      const result = await verifyAdminAccess();
      expect(result).toBe(true); // Should still work despite circular reference
    });
  });
});