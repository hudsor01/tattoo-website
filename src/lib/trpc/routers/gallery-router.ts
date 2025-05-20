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

// Validation schema for creating a design
export const designValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  designType: z.string().optional(),
  size: z.string().optional(),
  isApproved: z.boolean().default(false),
  artistId: z.string(),
  customerId: z.string().optional(),
});

// Export the gallery router with all procedures
export const galleryRouter = router({
  // Get all approved designs for public gallery
  getPublicDesigns: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(),
      designType: z.string().optional(),
    }))
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
      
      // Get designs
      const designs = await ctx.db.tattooDesign.findMany({
        where,
        take: limit + 1, // take an extra item to determine if there are more
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                }
              }
            }
          }
        }
      });
      
      // Check if there are more items
      let nextCursor: typeof cursor | undefined = undefined;
      if (designs.length > limit) {
        const nextItem = designs.pop();
        nextCursor = nextItem!.id;
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
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                }
              }
            }
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });
      
      if (!design) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Design with ID ${input.id} not found`,
        });
      }
      
      // Only allow access to non-approved designs for admins, the artist, or the customer
      if (!design.isApproved) {
        const user = ctx.user;
        if (!user) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this design',
          });
        }
        
        // Check if user is admin
        const isAdmin = user.role === 'admin';
        
        // Check if user is the artist
        const isArtist = design.artistId && 
          await ctx.db.artist.findFirst({ 
            where: { 
              userId: user.id,
              id: design.artistId
            } 
          });
          
        // Check if user is the customer
        const isCustomer = design.customerId && 
          await ctx.db.customer.findFirst({
            where: {
              id: design.customerId,
              email: user.email!
            }
          });
          
        if (!isAdmin && !isArtist && !isCustomer) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this design',
          });
        }
      }
      
      return design;
    }),
    
  // Create a new design (protected - must be logged in)
  create: protectedProcedure
    .input(designValidator)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user is the artist or an admin
        const user = ctx.user;
        
        // Verify artist exists
        const artist = await ctx.db.artist.findUnique({
          where: { id: input.artistId },
          include: { user: true },
        });
        
        if (!artist) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Artist with ID ${input.artistId} not found`,
          });
        }
        
        // Check permissions
        const isAdmin = user.role === 'admin';
        const isArtist = artist.userId === user.id;
        
        if (!isAdmin && !isArtist) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to create designs for this artist',
          });
        }
        
        // Create the design
        const design = await ctx.db.tattooDesign.create({
          data: input,
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
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      fileUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      designType: z.string().optional(),
      size: z.string().optional(),
      isApproved: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      
      try {
        // Find the design first
        const existingDesign = await ctx.db.tattooDesign.findUnique({
          where: { id },
          include: { artist: true },
        });
        
        if (!existingDesign) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Design with ID ${id} not found`,
          });
        }
        
        // Check permissions
        const user = ctx.user;
        const isAdmin = user.role === 'admin';
        const isArtist = existingDesign.artistId && 
          await ctx.db.artist.findFirst({ 
            where: { 
              userId: user.id,
              id: existingDesign.artistId
            } 
          });
          
        if (!isAdmin && !isArtist) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this design',
          });
        }
        
        // Only admins can approve designs
        if (data.isApproved !== undefined && data.isApproved !== existingDesign.isApproved && !isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only administrators can approve designs',
          });
        }
        
        // Update the design
        const updatedDesign = await ctx.db.tattooDesign.update({
          where: { id },
          data,
          include: {
            artist: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  }
                }
              }
            }
          }
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
        
        // Check permissions
        const user = ctx.user;
        const isAdmin = user.role === 'admin';
        const isArtist = existingDesign.artistId && 
          await ctx.db.artist.findFirst({ 
            where: { 
              userId: user.id,
              id: existingDesign.artistId
            } 
          });
          
        if (!isAdmin && !isArtist) {
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
  getDesignTypes: publicProcedure
    .query(async ({ ctx }) => {
      // Get unique design types from the database
      const designs = await ctx.db.tattooDesign.findMany({
        where: { designType: { not: null } },
        select: { designType: true },
        distinct: ['designType'],
      });
      
      // Extract unique design types
      const designTypes = designs
        .map((design: { designType?: string | null }) => design.designType)
        .filter((type): type is string => type !== null && type !== undefined);
        
      return designTypes;
    }),
    
  // Get gallery stats for dashboard
  getStats: adminProcedure
    .query(async ({ ctx }) => {
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
