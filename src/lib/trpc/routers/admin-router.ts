/**
 * Admin Router
 *
 * This router handles all admin-related API endpoints,
 * including dashboard data and user management.
 */
import { z } from 'zod';
import { adminProcedure, router } from '../procedures';
import { TRPCError } from '@trpc/server';
import { Prisma, NoteType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { logger } from '@/lib/logger';
import { prisma } from '../../db/prisma';
import {
  GetNotesByCustomerSchema,
  CreateNoteSchema,
  UpdateNoteSchema,
  DeleteNoteSchema,
  PinNoteSchema,
} from '@/lib/schemas/note-schemas';

// Export the admin router with all procedures
export const adminRouter = router({
  getDashboardStats: adminProcedure.query(async () => {
    const usersCount = await prisma.user.count();
    const customersCount = await prisma.customer.count();
    const bookingsCount = 0; // TODO: update to fetch data from cal.com integration and/or api routes
    const appointmentsCount = 0; // TODO: update to fetch data from cal.com integration and/or api routes
    const artistsCount = 0; // TODO: update to fetch data from cal.com integration and/or api routes
    const testimonialsCount = 0; // TODO: update when testimonial model is added to schema
    const designsCount = await prisma.tattooDesign.count();

    // Return all stats
    return {
      counts: {
        users: usersCount,
        customers: customersCount,
        bookings: bookingsCount,
        appointments: appointmentsCount,
        artists: artistsCount,
        testimonials: testimonialsCount,
        designs: designsCount,
      },
    };
  }),

  // Customer endpoints
  customers: router({
    getAll: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(1000).default(100),
          cursor: z.string().nullish(),
          search: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { limit, cursor, search } = input;

        // Build the where clause
        let where: Prisma.CustomerWhereInput = {};

        // Add search filter if provided
        if (search) {
          where = {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          };
        }

        const customers = await prisma.customer.findMany({
          where,
          take: limit + 1,
          ...(cursor ? { cursor: { id: cursor } } : {}),
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        let nextCursor: string | undefined;
        if (customers.length > limit) {
          const nextItem = customers.pop();
          nextCursor = nextItem?.id;
        }

        return {
          items: customers,
          nextCursor,
        };
      }),
  }),

  // Get customer list with pagination
  getCustomers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      // Build the where clause
      let where: Prisma.CustomerWhereInput = {};

      // Add search filter if provided
      if (search) {
        where = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Get total count for pagination
      const totalCount = await prisma.customer.count({ where });

      // Get customers
      const customers = await prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          postalCode: true,
          notes: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      return {
        customers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    }),

  // Get customers with infinite scroll pagination
  getCustomersInfinite: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().nullish(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { limit, cursor, search } = input;

      // Build the where clause
      let where: Prisma.CustomerWhereInput = {};

      // Add search filter if provided
      if (search) {
        where = {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      // Get total count for reference
      const totalCount = await prisma.customer.count({ where });

      // Get customers with cursor pagination
      // Using Prisma type for proper type checking
      const findManyOptions: Prisma.CustomerFindManyArgs = {
        where,
        take: limit + 1, // Take one extra to check if there's more
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          tags: true,
        },
      };

      if (cursor) {
        findManyOptions.cursor = { id: cursor.toString() };
      }

      const customers = await prisma.customer.findMany(findManyOptions);

      let nextCursor: number | null = null;
      if (customers.length > limit) {
        const nextItem = customers.pop();
        nextCursor = nextItem ? parseInt(nextItem.id) : null;
      }

      return {
        customers,
        nextCursor,
        totalCount,
      };
    }),

  // Get customer details by ID
  getCustomerById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const customer = await prisma.customer.findUnique({
      where: { id: input.id },
      // Select only fields that exist in the schema
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        notes: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Customer with ID ${input.id} not found`,
      });
    }

    return customer;
  }),

  // Update customer details
  updateCustomer: adminProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        birthDate: z.date().optional(),
        source: z.string().optional(),
        personalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      try {
        // Convert the input data to a format acceptable by Prisma
        const updateData: Prisma.CustomerUpdateInput = {};

        if (input.firstName !== null && input.firstName !== undefined)
          updateData.firstName = input.firstName;
        if (input.lastName !== null && input.lastName !== undefined)
          updateData.lastName = input.lastName;
        if (input.email !== null && input.email !== undefined) updateData.email = input.email;
        if (input.phone !== null && input.phone !== undefined) updateData.phone = input.phone;
        if (input.address !== null && input.address !== undefined)
          updateData.address = input.address;
        if (input.city !== null && input.city !== undefined) updateData.city = input.city;
        if (input.state !== null && input.state !== undefined) updateData.state = input.state;
        if (input.postalCode !== null && input.postalCode !== undefined)
          updateData.postalCode = input.postalCode;
        if (input.country !== null && input.country !== undefined)
          updateData.country = input.country;
        if (input.birthDate !== null && input.birthDate !== undefined)
          updateData.birthDate = input.birthDate;

        const updatedCustomer = await prisma.customer.update({
          where: { id },
          data: updateData,
        });

        return updatedCustomer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update customer: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Get all notes for a customer
  getCustomerNotes: adminProcedure
    .input(GetNotesByCustomerSchema)
    .query(async ({ input }) => {
      try {
        const { customerId, limit, cursor, type, pinnedOnly } = input;
        
        // Build where clause based on input
        const where: Prisma.NoteWhereInput = { 
          customerId 
        };
        
        // Add type filter if not 'all'
        if (type !== 'all') {
          where.type = type as NoteType;
        }
        
        // Add pinned filter if requested
        if (pinnedOnly) {
          where.pinned = true;
        }
        
        // Get notes with pagination
        const notes = await prisma.note.findMany({
          where,
          take: limit + 1, // Take one extra to check if there are more
          ...(cursor ? { cursor: { id: cursor } } : {}),
          orderBy: [
            { pinned: 'desc' },  // Pinned notes first
            { createdAt: 'desc' } // Then by creation date (newest first)
          ],
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });
        
        // Check if there are more notes and set next cursor
        let nextCursor: string | undefined = undefined;
        if (notes.length > limit) {
          const nextItem = notes.pop(); // Remove the extra item
          nextCursor = nextItem?.id;
        }
        
        return {
          notes,
          nextCursor,
        };
      } catch (error) {
        void logger.error('Error fetching customer notes', { error, customerId: input.customerId });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customer notes',
          cause: error,
        });
      }
    }),

  // Add a note to a customer
  addCustomerNote: adminProcedure
    .input(CreateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { customerId, content, type, pinned } = input;
        const userId = ctx.userId ?? null;
        
        // Verify the customer exists
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
          select: { id: true },
        });
        
        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Customer with ID ${customerId} not found`,
          });
        }
        
        // Create a new note in the database
        const newNote = await prisma.note.create({
          data: {
            id: randomUUID(),
            content,
            type: type as NoteType,
            pinned: pinned ?? false,
            customerId,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        
        return newNote;
      } catch (error) {
        void logger.error('Error adding customer note', { error, customerId: input.customerId });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add customer note',
          cause: error,
        });
      }
    }),

  // Update a customer note
  updateCustomerNote: adminProcedure
    .input(UpdateNoteSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, content, pinned, type } = input;
        
        // Verify the note exists
        const existingNote = await prisma.note.findUnique({
          where: { id },
        });
        
        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${id} not found`,
          });
        }
        
        // Prepare update data
        const updateData: Prisma.NoteUpdateInput = {};
        
        if (content !== undefined) updateData.content = content;
        if (pinned !== undefined) updateData.pinned = pinned;
        if (type !== undefined) updateData.type = type as NoteType;
        updateData.updatedAt = new Date();
        
        // Update the note
        const updatedNote = await prisma.note.update({
          where: { id },
          data: updateData,
        });
        
        return updatedNote;
      } catch (error) {
        void logger.error('Error updating customer note', { error, noteId: input.id });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update customer note',
          cause: error,
        });
      }
    }),

  // Delete a customer note
  deleteCustomerNote: adminProcedure
    .input(DeleteNoteSchema)
    .mutation(async ({ input }) => {
      try {
        const { id } = input;
        
        // Verify the note exists
        const existingNote = await prisma.note.findUnique({
          where: { id },
        });
        
        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${id} not found`,
          });
        }
        
        // Delete the note
        await prisma.note.delete({
          where: { id },
        });
        
        return { success: true };
      } catch (error) {
        void logger.error('Error deleting customer note', { error, noteId: input.id });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete customer note',
          cause: error,
        });
      }
    }),

  // Pin or unpin a note
  pinNote: adminProcedure
    .input(PinNoteSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, pinned } = input;
        
        // Verify the note exists
        const existingNote = await prisma.note.findUnique({
          where: { id },
        });
        
        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${id} not found`,
          });
        }
        
        // Update the pinned status
        const updatedNote = await prisma.note.update({
          where: { id },
          data: {
            pinned,
            updatedAt: new Date(),
          },
        });
        
        return updatedNote;
      } catch (error) {
        void logger.error('Error pinning/unpinning note', { error, noteId: input.id, pinStatus: input.pinned });
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update note pinned status',
          cause: error,
        });
      }
    }),

  // Manage customer tags
  addTagToCustomer: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use a direct query approach to avoid Prisma type issues
        await prisma.$queryRaw`
          INSERT INTO "_CustomerToTag" ("A", "B")
          VALUES (${input.customerId}, ${input.tagId})
          ON CONFLICT DO NOTHING;
        `;
        const updatedCustomer = await prisma.customer.findUnique({
          where: { id: input.customerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            tags: true
          }
        });

        return updatedCustomer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to add tag: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Remove tag from customer
  removeTagFromCustomer: adminProcedure
    .input(
      z.object({
        customerId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use raw query to avoid schema mismatches
  await prisma.$queryRaw`DELETE FROM "_CustomerToTag"
          WHERE "A" = ${input.customerId} AND "B" = ${input.tagId};
        `;
        const customer = await prisma.customer.findUnique({
          where: { id: input.customerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            tags: true
          },
        });

        return customer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to remove tag: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),

  // Get all tags - Remove tag operations since Tag model doesn't exist
  getTags: adminProcedure.query(async () => {
    // Return empty array since Tag model doesn't exist in schema
    logger.warn('Tag model not found in schema - returning empty array');
    return [];
  }),

  // Create a new tag - Disabled since Tag model doesn't exist
  createTag: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        color: z.string().default('gray'),
      })
    )
    .mutation(async () => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Tag functionality not implemented - Tag model not found in schema',
      });
    }),

  // Delete a tag - Disabled since Tag model doesn't exist
  deleteTag: adminProcedure.input(z.object({ id: z.string() })).mutation(async () => {
    throw new TRPCError({
      code: 'NOT_IMPLEMENTED',
      message: 'Tag functionality not implemented - Tag model not found in schema',
    });
  }),

  // Create a new customer
  createCustomer: adminProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Valid email is required'),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const customerId = randomUUID();        
        const customer = await prisma.customer.create({
          data: {
            id: customerId,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone?.trim() ?? null,
            address: input.address?.trim() ?? null,
            city: input.city?.trim() ?? null,
            state: input.state?.trim() ?? null,
            postalCode: input.zipCode?.trim() ?? null,
            communicationPrefs: 'EMAIL', // Add required field
            updatedAt: new Date(),
            createdAt: new Date()
          },
          // Only select the fields we need to avoid serialization issues
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return customer;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          // Handle unique constraint violation (email already exists)
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'A customer with this email already exists',
              cause: error,
            });
          }

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create customer: ${error.message}`,
            cause: error,
          });
        }
        throw error;
      }
    }),
});
