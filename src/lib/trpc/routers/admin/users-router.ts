/**
 * Admin Users Router
 *
 * This router handles all user management operations for admin users,
 * including listing, creating, updating, and deleting users.
 */
import { z } from 'zod';
import { adminProcedure, router } from '../../procedures';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

/**
 * Admin users router with all user management procedures
 */
export const adminUsersRouter = router({
  /**
   * Get all users with pagination and filtering
   */
  getUsers: adminProcedure
    .input(z.object({
      skip: z.number().int().min(0).default(0),
      take: z.number().int().min(1).max(100).default(50),
      search: z.string().optional(),
      role: z.string().optional(),
      sortBy: z.enum(['name', 'email', 'createdAt', 'role']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { skip, take, search, role, sortBy, sortOrder } = input;

        // Build where clause
        const where: Prisma.UserWhereInput = {};
        
        // Add search filter if provided
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        // Add role filter if provided
        if (role) {
          where.role = role;
        }

        // Build order by clause
        const orderBy: Prisma.UserOrderByWithRelationInput = {
          [sortBy]: sortOrder,
        };

        // Get users with pagination
        const [users, totalCount] = await Promise.all([
          ctx.prisma.user.findMany({
            skip,
            take,
            where,
            orderBy,
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
              // Omit sensitive fields like password hash
            },
          }),
          ctx.prisma.user.count({ where }),
        ]);

        return {
          users,
          totalCount,
          pagination: {
            skip,
            take,
            hasMore: skip + take < totalCount,
          },
        };
      } catch (error) {
        logger.error('Error fetching users', { error });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        });
      }
    }),

  /**
   * Get a single user by ID
   */
  getUserById: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            // Omit sensitive fields
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${input.id} not found`,
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        logger.error('Error fetching user by ID', { error, userId: input.id });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        });
      }
    }),

  /**
   * Update user role
   */
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, role } = input;

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${userId} not found`,
          });
        }

        // Update user role
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { role },
        });

        // Log the role change
        logger.info('User role updated', {
          updatedUserId: userId,
          role,
          adminId: ctx.userId,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        logger.error('Error updating user role', { 
          error, 
          userId: input.userId, 
          role: input.role 
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role',
        });
      }
    }),

  /**
   * Deactivate a user account (soft delete)
   */
  deactivateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId } = input;

        // Prevent deactivating your own account
        if (userId === ctx.userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You cannot deactivate your own account',
          });
        }

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${userId} not found`,
          });
        }

        // Soft delete by setting active flag to false
        // Note: This assumes you have an 'active' field in your User model
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { 
            active: false,
            updatedAt: new Date()
          },
        });

        // Log the deactivation
        logger.info('User deactivated', {
          deactivatedUserId: userId,
          adminId: ctx.userId,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        logger.error('Error deactivating user', { 
          error, 
          userId: input.userId
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate user',
        });
      }
    }),

  /**
   * Reactivate a previously deactivated user account
   */
  reactivateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId } = input;

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, active: true },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${userId} not found`,
          });
        }

        // If already active, return success
        if (existingUser.active) {
          return { success: true, message: 'User is already active' };
        }

        // Reactivate user
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { 
            active: true,
            updatedAt: new Date()
          },
        });

        // Log the reactivation
        logger.info('User reactivated', {
          reactivatedUserId: userId,
          adminId: ctx.userId,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        logger.error('Error reactivating user', { 
          error, 
          userId: input.userId
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reactivate user',
        });
      }
    }),

  /**
   * Get user activity log
   */
  getUserActivityLog: adminProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().int().min(1).max(100).default(50),
      offset: z.number().int().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { userId, limit, offset } = input;

        // Check if user exists
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${userId} not found`,
          });
        }

        // Get user activity logs - this would depend on your schema
        // This is a placeholder implementation
        const activityLogs = await ctx.prisma.userActivity.findMany({
          where: { userId },
          orderBy: { timestamp: 'desc' },
          skip: offset,
          take: limit,
        }).catch(() => {
          // If the table doesn't exist yet, return empty array
          return [];
        });

        // Count total logs
        const totalLogs = await ctx.prisma.userActivity.count({
          where: { userId },
        }).catch(() => 0);

        return {
          logs: activityLogs,
          pagination: {
            total: totalLogs,
            offset,
            limit,
            hasMore: offset + limit < totalLogs,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        logger.error('Error fetching user activity log', { 
          error, 
          userId: input.userId
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user activity log',
        });
      }
    }),
});