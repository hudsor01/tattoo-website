/**
 * User fixtures for E2E tests
 * Creates a range of test users with different roles and permissions
 */
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { TEST_ADMIN_EMAIL, TEST_USER_EMAIL, TEST_ARTIST_EMAIL } from '../test-constants';

const prisma = new PrismaClient();

/**
 * Create test users for E2E testing
 */
export async function createTestUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Create test admin user
  const adminResult = await supabase.auth.admin.createUser({
    email: TEST_ADMIN_EMAIL,
    password: 'Test-Password123!',
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      name: 'Test Admin'
    }
  });
  
  if (adminResult.error) {
    console.error('⚠️ Error creating test admin user:', adminResult.error.message);
  } else {
    console.log('👤 Created test admin user:', adminResult.data.user.email);
    
    // Create admin user record in Prisma
    await prisma.user.upsert({
      where: { id: adminResult.data.user.id },
      update: {
        name: 'Test Admin',
        email: adminResult.data.user.email!,
        role: 'admin',
      },
      create: {
        id: adminResult.data.user.id,
        name: 'Test Admin',
        email: adminResult.data.user.email!,
        role: 'admin',
      }
    });
  }
  
  // Create test regular user
  const userResult = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: 'Test-Password123!',
    email_confirm: true,
    user_metadata: {
      role: 'user',
      name: 'Test User'
    }
  });
  
  if (userResult.error) {
    console.error('⚠️ Error creating test user:', userResult.error.message);
  } else {
    console.log('👤 Created test user:', userResult.data.user.email);
    
    // Create user record in Prisma
    await prisma.user.upsert({
      where: { id: userResult.data.user.id },
      update: {
        name: 'Test User',
        email: userResult.data.user.email!,
        role: 'user',
      },
      create: {
        id: userResult.data.user.id,
        name: 'Test User',
        email: userResult.data.user.email!,
        role: 'user',
      }
    });
  }
  
  // Create test artist user
  const artistResult = await supabase.auth.admin.createUser({
    email: TEST_ARTIST_EMAIL,
    password: 'Test-Password123!',
    email_confirm: true,
    user_metadata: {
      role: 'artist',
      name: 'Test Artist'
    }
  });
  
  if (artistResult.error) {
    console.error('⚠️ Error creating test artist:', artistResult.error.message);
  } else {
    console.log('👤 Created test artist:', artistResult.data.user.email);
    
    // Create artist user record in Prisma
    await prisma.user.upsert({
      where: { id: artistResult.data.user.id },
      update: {
        name: 'Test Artist',
        email: artistResult.data.user.email!,
        role: 'artist',
      },
      create: {
        id: artistResult.data.user.id,
        name: 'Test Artist',
        email: artistResult.data.user.email!,
        role: 'artist',
      }
    });
    
    // Create artist profile
    await prisma.artist.upsert({
      where: { userId: artistResult.data.user.id },
      update: {
        name: 'Test Artist',
        bio: 'Test artist created for E2E testing',
        specialties: ['Traditional', 'Neo-Traditional', 'Japanese'],
        yearsOfExperience: 5,
        isActive: true,
      },
      create: {
        userId: artistResult.data.user.id,
        name: 'Test Artist',
        bio: 'Test artist created for E2E testing',
        specialties: ['Traditional', 'Neo-Traditional', 'Japanese'],
        yearsOfExperience: 5,
        isActive: true,
      }
    });
  }
}

/**
 * Remove test users after tests complete
 */
export async function cleanupTestUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found in environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // First get user IDs from Supabase
  const { data: adminUser } = await supabase.auth.admin.listUsers();
  const adminId = adminUser?.users.find(u => u.email === TEST_ADMIN_EMAIL)?.id;
  const userId = adminUser?.users.find(u => u.email === TEST_USER_EMAIL)?.id;
  const artistId = adminUser?.users.find(u => u.email === TEST_ARTIST_EMAIL)?.id;
  
  // Delete from Prisma first (due to foreign key constraints)
  if (artistId) {
    await prisma.artist.deleteMany({ where: { userId: artistId } });
  }
  
  // Delete user records
  const userIds = [adminId, userId, artistId].filter(Boolean) as string[];
  if (userIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }
  
  // Delete from Supabase
  if (adminId) await supabase.auth.admin.deleteUser(adminId);
  if (userId) await supabase.auth.admin.deleteUser(userId);
  if (artistId) await supabase.auth.admin.deleteUser(artistId);
  
  console.log('🧹 Cleaned up test users');
}
