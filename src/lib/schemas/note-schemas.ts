import { z } from 'zod';
import { NoteType } from '@prisma/client';

export const GetNotesByCustomerSchema = z.object({
  customerId: z.string(),
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  type: z.enum(['all', 'MANUAL', 'SYSTEM', 'APPOINTMENT', 'BOOKING', 'PAYMENT', 'INTERACTION', 'FOLLOW_UP']).default('all'),
  pinnedOnly: z.boolean().default(false),
});

export const CreateNoteSchema = z.object({
  customerId: z.string(),
  content: z.string().min(1, 'Note content is required'),
  type: z.nativeEnum(NoteType).default(NoteType.MANUAL),
  pinned: z.boolean().default(false),
});

export const UpdateNoteSchema = z.object({
  id: z.string(),
  content: z.string().min(1).optional(),
  type: z.nativeEnum(NoteType).optional(),
  pinned: z.boolean().optional(),
});

export const DeleteNoteSchema = z.object({
  id: z.string(),
});

export const PinNoteSchema = z.object({
  id: z.string(),
  pinned: z.boolean(),
});
