/**
 * Admin Notes Router
 *
 * This router handles all note-related admin operations,
 * including creating, updating, and retrieving customer notes.
 */
import { adminProcedure, router } from '../../procedures';
import { TRPCError } from '@trpc/server';
import { Prisma, NoteType } from '@prisma/client';
import { z } from 'zod';

// Note schemas using Zod for validation
const CreateNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  type: z.nativeEnum(NoteType),
  customerId: z.string().uuid(),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const UpdateNoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).optional(),
  type: z.nativeEnum(NoteType).optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const DeleteNoteSchema = z.object({
  id: z.string().uuid(),
});

const GetNotesByCustomerSchema = z.object({
  customerId: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
  type: z.nativeEnum(NoteType).optional(),
});

const PinNoteSchema = z.object({
  id: z.string().uuid(),
  isPinned: z.boolean(),
});

/**
 * Admin notes router with all note-related procedures
 */
export const adminNotesRouter = router({
  /**
   * Create a new customer note
   */
  createNote: adminProcedure
    .input(CreateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify customer exists
        const customerExists = await ctx.prisma.customer.findUnique({
          where: { id: input.customerId },
          select: { id: true }
        });

        if (!customerExists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Customer with ID ${input.customerId} not found`
          });
        }

        // Create the note
        const note = await ctx.prisma.note.create({
          data: {
            content: input.content,
            type: input.type.toUpperCase() as NoteType,
            pinned: input.pinned ?? false,
            customer: {
              connect: { id: input.customerId }
            },
            createdBy: ctx.userId as string
          }
        });

        return note;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create note: ${error.message}`,
            cause: error
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while creating the note'
        });
      }
    }),

  /**
   * Update an existing note
   */
  updateNote: adminProcedure
    .input(UpdateNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if note exists and belongs to the correct customer
        const existingNote = await ctx.prisma.note.findUnique({
          where: { id: input.id },
          select: { id: true, customerId: true }
        });

        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${input.id} not found`
          });
        }

        // Build update data object, excluding undefined values
        const updateData: Prisma.NoteUpdateInput = {
          updatedAt: new Date()
        };

        if (input.content !== undefined) {
          updateData['content'] = input.content;
        }

        if (input.type !== undefined) {
          updateData['type'] = input.type.toUpperCase() as NoteType;
        }

        if (input.pinned !== undefined) {
          updateData['pinned'] = input.pinned;
        }

        // Update the note
        const updatedNote = await ctx.prisma.note.update({
          where: { id: input.id },
          data: updateData
        });

        return updatedNote;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update note: ${error.message}`,
            cause: error
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while updating the note'
        });
      }
    }),

  /**
   * Delete a note
   */
  deleteNote: adminProcedure
    .input(DeleteNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if note exists
        const existingNote = await ctx.prisma.note.findUnique({
          where: { id: input.id },
          select: { id: true }
        });

        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${input.id} not found`
          });
        }

        // Delete the note
        await ctx.prisma.note.delete({
          where: { id: input.id }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to delete note: ${error.message}`,
            cause: error
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while deleting the note'
        });
      }
    }),

  /**
   * Get notes for a specific customer
   */
  getNotesByCustomer: adminProcedure
    .input(GetNotesByCustomerSchema)
    .query(async ({ input, ctx }) => {
      try {
        // Verify customer exists
        const customerExists = await ctx.prisma.customer.findUnique({
          where: { id: input.customerId },
          select: { id: true }
        });

        if (!customerExists) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Customer with ID ${input.customerId} not found`
          });
        }

        // Build where clause
        const where: Prisma.NoteWhereInput = { 
          customerId: input.customerId 
        };

        // Add type filter if specified and not 'all'
        if (input.type && input.type !== 'all') {
          where.type = input.type.toUpperCase() as NoteType;
        }

        // Add pinned filter if specified
        if (input.pinnedOnly) {
          where.pinned = true;
        }

        // Calculate skip from cursor
        const skip = input.cursor ? parseInt(input.cursor) : 0;

        // Get notes with pagination
        const notes = await ctx.prisma.note.findMany({
          where,
          orderBy: [
            { pinned: 'desc' },
            { updatedAt: 'desc' }
          ],
          skip,
          take: input.limit,
        });

        // Get total count
        const totalCount = await ctx.prisma.note.count({
          where
        });

        return {
          notes,
          totalCount,
          hasMore: skip + input.limit < totalCount
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve customer notes'
        });
      }
    }),

  /**
   * Pin or unpin a note
   */
  pinNote: adminProcedure
    .input(PinNoteSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if note exists
        const existingNote = await ctx.prisma.note.findUnique({
          where: { id: input.id },
          select: { id: true }
        });

        if (!existingNote) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Note with ID ${input.id} not found`
          });
        }

        // Update the pin status
        const updatedNote = await ctx.prisma.note.update({
          where: { id: input.id },
          data: {
            pinned: input.pinned,
            updatedAt: new Date()
          }
        });

        return updatedNote;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update note pin status'
        });
      }
    })
});