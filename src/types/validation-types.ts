import { z } from 'zod';

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  totalPages: z.number().int().positive().optional(),
  totalItems: z.number().int().positive().optional(),
});

// Date range schema
export const dateRangeSchema = z.object({
  start: z.date().optional(),
  end: z.date().optional(),
});

// Export types
export type PaginationSchema = z.infer<typeof paginationSchema>;
export type DateRangeSchema = z.infer<typeof dateRangeSchema>;