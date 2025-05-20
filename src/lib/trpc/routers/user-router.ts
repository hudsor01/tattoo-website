/**
 * User Router
 * 
 * This router handles all user-related API endpoints,
 * including user authentication, profile management, and roles.
 * 
 * Security is enforced through middleware to ensure clients can only
 * access their own data, while admin functionality is isolated.
 */
import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../server';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

// Profile update validator
export const profileUpdateValidator = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional().nullable(),
});

// Artist profile validator
export const artistProfileValidator = z.object({
  specialty: z.string().optional(),
  bio: z.string().optional(),
  portfolio: z.string().optional(),
  availableForBooking: z.boolean().optional(),
  hourlyRate: z.number().positive().optional(),
});

// Export the user router with all procedures
export const userRouter = router({
  // Get current user profile - accessible to all authenticated users
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // Get artist profile if user is an artist
      let artistProfile = null;
      if (user.role === 'artist') {
        artistProfile = await ctx.db.artist.findUnique({
          where: { userId: user.id },
        });
      }
      
      // Get customer profile if it exists
      const customerProfile = await ctx.db.customer.findFirst({
        where: { email: user.email },
        include: {
          bookings: true,
          appointments: {
            orderBy: { startDate: 'asc' },
            where: {
              startDate: {
                gte: new Date(),
              },
            },
          },
          designs: {
            include: {
              artist: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      
      return {
        ...user,
        artistProfile,
        customerProfile,
      };
    }),
  
  // Update user profile - accessible to the user themselves
  updateProfile: protectedProcedure
    .input(profileUpdateValidator)
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: input,
        });
        
        return updatedUser;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update profile: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
  
  // Update artist profile - accessible to artists
  updateArtistProfile: protectedProcedure
    .input(artistProfileValidator)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      
      // Check if user is an artist
      if (user.role !== 'artist') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only artists can update artist profiles',
        });
      }
      
      try {
        // Find existing artist profile
        const existingProfile = await ctx.db.artist.findUnique({
          where: { userId: user.id },
        });
        
        let artistProfile;
        
        // Create or update artist profile
        if (existingProfile) {
          artistProfile = await ctx.db.artist.update({
            where: { userId: user.id },
            data: input,
          });
        } else {
          artistProfile = await ctx.db.artist.create({
            data: {
              ...input,
              userId: user.id,
            },
          });
        }
        
        return artistProfile;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update artist profile: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
  
  // Get all artists (public) - for client-facing artist listings
  getArtists: publicProcedure
    .input(z.object({
      includeUnavailable: z.boolean().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const { includeUnavailable } = input;
      
      // Build where clause
      const where: Prisma.ArtistWhereUniqueInput = {};
      
      // Only include available artists unless specified
      if (!includeUnavailable) {
        where.availableForBooking = true;
      }
      
      // Get all artists with their user profiles
      const artists = await ctx.db.artist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
      
      return artists;
    }),
  
  // Get artist by ID (public) - for client-facing artist detail
  getArtistById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const artist = await ctx.db.artist.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          // Include public designs
          designs: {
            where: {
              isApproved: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      });
      
      if (!artist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Artist with ID ${input.id} not found`,
        });
      }
      
      return artist;
    }),
    
  // ========== CLIENT PORTAL SPECIFIC ENDPOINTS ==========
  
  // Get client appointments - accessible to the client themselves
  getClientAppointments: protectedProcedure
    .query(async ({ ctx }) => {
      // Find customer profile for current user
      const customer = await ctx.db.customer.findFirst({
        where: { email: ctx.user.email },
      });
      
      if (!customer) {
        return [];
      }
      
      // Get all appointments for this customer
      const appointments = await ctx.db.appointment.findMany({
        where: { customerId: customer.id },
        orderBy: { startDate: 'asc' },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      
      return appointments;
    }),
    
  // Get client designs - accessible to the client themselves
  getClientDesigns: protectedProcedure
    .query(async ({ ctx }) => {
      // Find customer profile for current user
      const customer = await ctx.db.customer.findFirst({
        where: { email: ctx.user.email },
      });
      
      if (!customer) {
        return [];
      }
      
      // Get all designs for this customer
      const designs = await ctx.db.tattooDesign.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        include: {
          artist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      
      return designs;
    }),
    
  // ========== ADMIN ONLY ENDPOINTS ==========
  
  // Admin: Get all users
  getAllUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;
      
      // Build where clause
      let where: Prisma.UserWhereInput = {};
      
      // Add search filter if provided
      if (search) {
        where = {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        };
      }
      
      // Get total count for pagination
      const totalCount = await ctx.db.user.count({ where });
      
      // Get users
      const users = await ctx.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          artist: true,
        },
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    }),
    
  // Admin: Get a specific user
  getUserById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: {
          artist: true,
          sessions: true,
        },
      });
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with ID ${input.id} not found`,
        });
      }
      
      // Get customer profile if it exists
      const customerProfile = user.email ? 
        await ctx.db.customer.findFirst({
          where: { email: user.email },
          include: {
            bookings: true,
            appointments: true,
          },
        }) : null;
        
      return {
        ...user,
        customerProfile,
      };
    }),
    
  // Admin: Update user
  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      role: z.string().optional(),
      image: z.string().url().optional().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      
      try {
        // Verify user exists
        const existingUser = await ctx.db.user.findUnique({
          where: { id },
        });
        
        if (!existingUser) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `User with ID ${id} not found`,
          });
        }
        
        // Check if trying to update email to one that already exists
        if (data.email && data.email !== existingUser.email) {
          const existingEmailUser = await ctx.db.user.findUnique({
            where: { email: data.email },
          });
          
          if (existingEmailUser) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Email already in use',
            });
          }
        }
        
        // Update user
        const updatedUser = await ctx.db.user.update({
          where: { id },
          data,
        });
        
        // If role changed to artist and no artist profile, create one
        if (data.role === 'artist' && existingUser.role !== 'artist') {
          const existingArtist = await ctx.db.artist.findUnique({
            where: { userId: id },
          });
          
          if (!existingArtist) {
            await ctx.db.artist.create({
              data: {
                userId: id,
                availableForBooking: true,
              },
            });
          }
        }
        
        return updatedUser;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update user: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
    
  // Admin: Create user
  createUser: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.string().default('user'),
      image: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { password, ...userData } = input;
      
      try {
        // Check if email already exists
        const existingUser = await ctx.db.user.findUnique({
          where: { email: userData.email },
        });
        
        if (existingUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Email already in use',
          });
        }
        
        // Create Supabase user
        const supabase = ctx.supabase;
        if (!supabase) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Supabase client not available',
          });
        }
        
        const { data: authUser, error } = await supabase.auth.admin.createUser({
          email: userData.email,
          password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            role: userData.role,
          },
        });
        
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create auth user: ${error.message}`,
            cause: error,
          });
        }
        
        // Create user in database
        const user = await ctx.db.user.create({
          data: {
            id: authUser.user.id,
            ...userData,
          },
        });
        
        // If role is artist, create artist profile
        if (userData.role === 'artist') {
          await ctx.db.artist.create({
            data: {
              userId: user.id,
              availableForBooking: true,
            },
          });
        }
        
        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create user: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
    
  // Admin: Delete user
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Delete user in database
        await ctx.db.user.delete({
          where: { id: input.id },
        });
        
        // Delete user in Supabase
        const supabase = ctx.supabase;
        if (!supabase) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Supabase client not available',
          });
        }
        
        const { error } = await supabase.auth.admin.deleteUser(input.id);
        
        if (error) {
          console.error('Failed to delete auth user:', error);
        }
        
        return { success: true };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to delete user: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
});
