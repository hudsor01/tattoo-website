# Test Admin Credentials for E2E Testing

## Primary Test Admin Account
- **Email**: `test-admin@tattoowebsite.com`
- **Password**: `godmode@69%`
- **Role**: Admin (full dashboard access)
- **Purpose**: Main E2E testing account for admin dashboard workflows

## Secondary Test Admin Account (for multi-user scenarios)
- **Email**: `test-admin2@tattoowebsite.com`
- **Password**: `TestAdmin456!`
- **Role**: Admin
- **Purpose**: Secondary account for testing multi-admin scenarios

## Test Environment Variables
Add these to your `.env.local` for testing:

```bash
# Test credentials for E2E tests
TEST_ADMIN_EMAIL=test-admin@tattoowebsite.com
TEST_ADMIN_PASSWORD=godmode@69%
TEST_ADMIN_EMAIL_2=test-admin2@tattoowebsite.com
TEST_ADMIN_PASSWORD_2=TestAdmin456!
```

## Setup Instructions

1. Create these accounts in your Clerk dashboard
2. Ensure both accounts have admin role/permissions
3. Add the environment variables to `.env.local`
4. Run tests with: `npm run test:e2e`

## Test Account Requirements

- Must have access to `/admin` routes
- Should be able to upload images to gallery
- Must have permissions for all admin dashboard features
- Accounts should persist across test runs (don't auto-delete)

## Security Note

These are test-only credentials. Never use in production environments.