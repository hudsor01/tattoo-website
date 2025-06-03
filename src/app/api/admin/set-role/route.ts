import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { ApiErrors } from "@/lib/api-errors";
import { withAdmin } from "@/lib/auth/api-auth";

// Validation schema for set role request
const setRoleSchema = z.object({
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'superadmin']).default('admin')
});

// POST handler with admin authorization
export const POST = withAdmin(async (request, adminUser) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const { email, role } = setRoleSchema.parse(body);
      
      // Only superadmins can set other users to admin
      if (adminUser.role !== 'superadmin' && email !== adminUser.email) {
        throw ApiErrors.forbidden('Only superadmins can modify other users');
      }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${email} role updated to ${role}`
    });
    
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        throw ApiErrors.validationError('Invalid input data', error.errors);
      }
      
      // Re-throw ApiErrors
      if ('code' in error && 'status' in error) {
        throw error;
      }
      
      // Otherwise, forward the error
      throw error;
    }
  } catch (error) {
    void logger.error('Set role error:', error);
    
    // Handle Prisma errors
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2025') {
      throw ApiErrors.notFound('User not found with that email');
    }
    
    // If it's already an ApiError, rethrow it
    if ('code' in error && 'status' in error) {
      throw error;
    }
    
    // Otherwise create a generic error
    throw ApiErrors.internalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// GET endpoint to check current user info - only accessible to admins
export const GET = withAdmin(async (request, adminUser) => {
  try {
    // Get user info from query params if provided
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') ?? adminUser.email;

    // Get user from database with current role
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw ApiErrors.notFound('User not found');
    }

    return NextResponse.json({
      user,
      isSelf: email === adminUser.email
    });
  } catch (error) {
    void logger.error('Get user info error:', error);
    
    // If it's already an ApiError, rethrow it
    if ('code' in error && 'status' in error) {
      throw error;
    }
    
    throw ApiErrors.internalServerError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
