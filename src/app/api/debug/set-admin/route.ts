/**
 * Debug endpoint to create admin user
 * 
 * Purpose: Quick setup for admin access during development
 * Assumptions: Development environment only
 * Dependencies: Prisma, Better Auth
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

import { logger } from "@/lib/logger";
export async function GET() {
  try {
    // Check if we're in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'This endpoint is only available in development'
      });
    }

    // Create or update admin user
    const adminEmail = 'ink37tattoos@gmail.com';
    
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { 
        role: 'admin',
        name: 'Fernando Govea'
      },
      create: {
        email: adminEmail,
        name: 'Fernando Govea',
        role: 'admin',
        emailVerified: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully!',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      nextSteps: [
        '1. Go to http://localhost:3001/admin',
        '2. Use email: ink37tattoos@gmail.com',
        '3. Use any password (development mode)',
        '4. You should see the admin dashboard'
      ]
    });

  } catch (error) {
    void logger.error('Error creating admin user:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
