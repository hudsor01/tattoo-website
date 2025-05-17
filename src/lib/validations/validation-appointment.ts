/**
 * Appointment API validation schemas
 */

import * as z from 'zod';
import { paginationSchema, dateRangeSchema, uuidParamSchema } from './validation-common';
import { safeArray } from './validation-core';

/**
 * Appointment status enum
 */
export const appointmentStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
]);

export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;

/**
 * Base appointment schema
 */
export const appointmentBaseSchema = z.object({
  clientId: z.string().uuid('Client ID must be a valid UUID'),
  serviceType: z.string().min(1, 'Service type is required'),
  startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid start time format',
  }),
  endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid end time format',
  }),
  notes: z.string().optional(),
  deposit: z.number().nonnegative().optional(),
  depositPaid: z.boolean().optional().default(false),
  price: z.number().nonnegative().optional(),
  isPaid: z.boolean().optional().default(false),
  status: appointmentStatusEnum.optional().default('scheduled'),
});

export type AppointmentInput = z.infer<typeof appointmentBaseSchema>;

/**
 * Create appointment schema
 */
export const createAppointmentSchema = appointmentBaseSchema.extend({
  // Add any create-specific fields here
  sendNotification: z.boolean().optional().default(true),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

/**
 * Update appointment schema
 */
export const updateAppointmentSchema = z.object({
  serviceType: z.string().optional(),
  startTime: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid start time format',
    })
    .optional(),
  endTime: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid end time format',
    })
    .optional(),
  notes: z.string().optional(),
  deposit: z.number().nonnegative().optional(),
  depositPaid: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
  isPaid: z.boolean().optional(),
  status: appointmentStatusEnum.optional(),
  sendNotification: z.boolean().optional().default(false),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

/**
 * Confirm appointment schema
 */
export const confirmAppointmentSchema = z.object({
  sendNotification: z.boolean().optional().default(true),
  notificationMessage: z.string().optional(),
});

export type ConfirmAppointmentInput = z.infer<typeof confirmAppointmentSchema>;

/**
 * Get appointment query parameters schema
 */
export const getAppointmentQuerySchema = z.object({
  ...paginationSchema.shape,
  status: appointmentStatusEnum.optional(),
  clientId: z.string().uuid('Client ID must be a valid UUID').optional(),
  ...dateRangeSchema.shape,
  isPaid: z.boolean().optional(),
  depositPaid: z.boolean().optional(),
});

export type GetAppointmentQueryParams = z.infer<typeof getAppointmentQuerySchema>;

/**
 * Appointment ID param schema (used in route handlers)
 */
export const appointmentIdParamSchema = uuidParamSchema;

/**
 * Appointment response schema
 */
export const appointmentResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  serviceType: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
  deposit: z.number().optional(),
  depositPaid: z.boolean(),
  price: z.number().optional(),
  isPaid: z.boolean(),
  status: appointmentStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  client: z
    .object({
      id: z.string().uuid(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
    })
    .optional(),
  payments: safeArray(
    z.object({
      id: z.string().uuid(),
      amount: z.number(),
      paymentMethod: z.string(),
      status: z.string(),
      createdAt: z.date(),
    })
  ).optional(),
});

export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;

/**
 * Appointment list response schema
 */
export const appointmentListResponseSchema = z.object({
  appointments: safeArray(appointmentResponseSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

export type AppointmentListResponse = z.infer<typeof appointmentListResponseSchema>;