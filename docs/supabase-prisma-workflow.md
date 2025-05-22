# Supabase and Prisma Workflow

This document outlines the workflow for managing your database with Supabase and Prisma.

## Database Management Approach

Since we're using Supabase as our database provider, we'll use a hybrid approach for database management:

1. **Schema Management**: Schema changes are managed through Supabase directly (either through the UI or SQL migrations).
2. **Type Safety**: Prisma is used for type-safe database access in our application code.

## Workflow

### Updating the Prisma Schema from Supabase

When changes are made to the database schema in Supabase, run:

```bash
npm run prisma:update
```

This script:
1. Introspects your Supabase database (`prisma db pull`)
2. Generates the Prisma client (`prisma generate`)

### Development Tips

1. **Making Schema Changes**: 
   - Make schema changes in the Supabase Dashboard UI
   - Or use SQL to make changes in the Supabase SQL Editor
   - Then run `npm run prisma:update` to update your local Prisma schema

2. **Connection String**:
   - The correct DATABASE_URL format for Supabase is:
   ```
   DATABASE_URL=postgresql://postgres.{your-project-id}:{your-password}@aws-0-us-east-2.pooler.supabase.com:5432/postgres
   ```
   - Note: Make sure to use port 5432 (not 6543)

3. **Important Notes**:
   - Do not use Prisma Migrate with Supabase (don't use `prisma migrate dev` or similar commands)
   - Always use `prisma db pull` to keep your Prisma schema in sync with Supabase

## Database Operations

### Querying the Database

Use Prisma Client in your code as normal:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUsers() {
  return await prisma.user.findMany()
}
```

### Advanced Operations

For advanced database operations that Prisma doesn't support, you can use raw SQL:

```typescript
const result = await prisma.$executeRaw`
  SELECT * FROM "User" WHERE "role" = 'admin'
`
```

## Troubleshooting

If you encounter issues with the Prisma schema:

1. Verify your DATABASE_URL is correct
2. Try running `npx prisma db pull --force` to refresh your schema
3. Ensure you're using the correct port (5432) in your connection string
