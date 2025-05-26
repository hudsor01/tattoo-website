/**
 * Gallery Router
 *
 * This router handles all gallery-related API endpoints,
 * including retrieving tattoo designs and portfolio items.
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../server';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import type { DatabaseDesignType } from '@/types/gallery-types';
import { randomUUID } from 'node:crypto';

// Validation schema for creating a design
export const designValidator = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  designType: z.string().optional(),
  size: z.string().optional(),
  isApproved: z.boolean().default(false),
  customerId: z.string().optional(),
});

// Export the gallery router with all procedures
export const galleryRouter = router({
  // Get all approved designs for public gallery
  getPublicDesigns: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
        designType: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor, designType } = input;

      // Build the where clause
      const where: Prisma.TattooDesignWhereInput = {
        isApproved: true,
      };

      // Add designType filter if provided
      if (designType) {
        where.designType = designType;
      }

      // Get total count
      const totalCount = await ctx.db.tattooDesign.count({ where });

      // Get designs with proper cursor handling for Prisma
      // Build the query options separately to handle conditional cursor
      const queryOptions: Prisma.TattooDesignFindManyArgs = {
        where,
        take: limit + 1, // take an extra item to determine if there are more
        orderBy: { createdAt: 'desc' },
        include: {
          Artist: {
            include: {
              User: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      };

      // Only add cursor if it's provided
      if (cursor) {
        queryOptions.cursor = { id: String(cursor) };
      }

      // Execute the query with proper typing
      const designs = await ctx.db.tattooDesign.findMany(queryOptions);

      // Check if there are more items
      let nextCursor: typeof cursor | null = null;
      if (designs.length > limit) {
        const nextItem = designs.pop();
        nextCursor = nextItem ? parseInt(nextItem.id) : null;
      }

      return {
        designs,
        nextCursor,
        totalCount,
      };
    }),

  // Get design by ID
  getDesignById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const design = await ctx.db.tattooDesign.findUnique({
        where: { id: input.id },
        include: {
          Artist: {
            include: {
              User: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          Customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!design) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Design with ID ${input.id} not found`,
        });
      }

      // Only allow access to non-approved designs for authenticated users
      if (!design.isApproved && !ctx.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this design',
        });
      }

      return design;
    }),

  // Create a new design (protected - must be logged in)
  create: protectedProcedure.input(designValidator).mutation(async ({ input, ctx }) => {
    void console.warn('tRPC gallery.create input received:', JSON.stringify(input, null, 2));
    void console.warn('Input validation result:', designValidator.safeParse(input));

    try {
      // Create the design - artist already exists in database
      const designData = {
        id: randomUUID(),
        name: input.name,
        description: input.description ?? null,
        fileUrl: input.image,
        thumbnailUrl: input.image,
        designType: input.designType ?? null,
        size: input.size ?? null,
        isApproved: input.isApproved ?? false,
        artistId: 'fernando-govea',
        updatedAt: new Date(),
      };

      const design = await ctx.db.tattooDesign.create({
        data: designData,
        select: {
          id: true,
          name: true,
          description: true,
          fileUrl: true,
          thumbnailUrl: true,
          designType: true,
          size: true,
          isApproved: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return design;
    } catch (error) {
      // Handle Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create design: ${error.message}`,
          cause: error,
        });
      }
      throw error;
    }
  }),

  // Update a design
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        designType: z.string().optional(),
        size: z.string().optional(),
        isApproved: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      try {
        // Find the design first
        const existingDesign = await ctx.db.tattooDesign.findUnique({
          where: { id },
          include: { Artist: true },
        });

        if (!existingDesign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Design with ID ${id} not found`,
          });
        }

        // Check permissions - only authenticated users can update
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this design',
          });
        }

        // Convert input data to standard Prisma update format
        const updateData: Prisma.TattooDesignUpdateInput = {
          updatedAt: new Date(),
        };

        // Only include fields that are defined (not undefined)
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.image !== undefined) {
          updateData.fileUrl = data.image;
          updateData.thumbnailUrl = data.image; // Auto-update thumbnail to same as fileUrl
        }
        if (data.designType !== undefined) updateData.designType = data.designType;
        if (data.size !== undefined) updateData.size = data.size;
        if (data.isApproved !== undefined) updateData.isApproved = data.isApproved;

        // Update the design
        const updatedDesign = await ctx.db.tattooDesign.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            description: true,
            fileUrl: true,
            thumbnailUrl: true,
            designType: true,
            size: true,
            isApproved: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return updatedDesign;
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update design: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Delete a design
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Find the design first
        const existingDesign = await ctx.db.tattooDesign.findUnique({
          where: { id: input.id },
        });

        if (!existingDesign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Design with ID ${input.id} not found`,
          });
        }

        // Check permissions - only authenticated users can delete
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this design',
          });
        }

        // Delete the design
        await ctx.db.tattooDesign.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to delete design: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Get design types for filtering
  getDesignTypes: publicProcedure.query(async ({ ctx }) => {
    // Get unique design types from the database
    const designs = await ctx.db.tattooDesign.findMany({
      where: { designType: { not: null } },
      select: { designType: true },
      distinct: ['designType'],
    });

    // Extract unique design types and filter out null/undefined values
    const designTypes = designs
      .map((design: DatabaseDesignType) => design.designType)
      .filter((type): type is string => typeof type === 'string' && type !== '');

    return designTypes;
  }),

  // Get gallery stats for dashboard
  getStats: adminProcedure.query(async ({ ctx }) => {
    const totalDesigns = await ctx.db.tattooDesign.count();
    const approvedDesigns = await ctx.db.tattooDesign.count({
      where: { isApproved: true },
    });
    const pendingDesigns = await ctx.db.tattooDesign.count({
      where: { isApproved: false },
    });

    return {
      totalDesigns,
      approvedDesigns,
      pendingDesigns,
    };
  }),
});
