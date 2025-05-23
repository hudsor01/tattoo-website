import * as z from 'zod';
import { paginationSchema, dateRangeSchema } from './validation-common';
import { safeArray } from './validation-core';

// Payment Enums
export const paymentMethodEnum = z.enum(['card', 'cash', 'cashapp', 'venmo', 'paypal', 'other']);

export const paymentStatusEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled',
]);

export const paymentTypeEnum = z.enum(['deposit', 'full', 'installment', 'other']);

// Input Schemas
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  email: z.string().email('Invalid email format'),
  name: z.string().optional(),
  bookingId: z.number().int().positive().optional(),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  clientId: z.string().uuid('Invalid client ID').optional(),
  currency: z.string().min(3).max(3).default('usd'),
  description: z.string().optional(),
  paymentType: paymentTypeEnum.default('deposit'),
  metadata: z.record(z.string()).optional(),
});

export const clientPaymentIntentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  clientId: z.string().uuid('Invalid client ID'),
  amount: z.number().positive('Amount must be positive'),
  clientEmail: z.string().email('Invalid email format'),
  name: z.string().optional(),
  description: z.string().optional(),
});

export const paymentRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: paymentMethodEnum,
  status: paymentStatusEnum.default('completed'),
  email: z.string().email('Invalid email'),
  bookingId: z.number().int().positive().optional(),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  clientId: z.string().uuid('Invalid client ID').optional(),
  paymentIntentId: z.string().optional(),
  reference: z.string().optional(),
  receipt: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export const paymentStatusCheckSchema = z.object({
  id: z.string(),
  source: z.enum(['cal', 'db']).default('cal'),
});

export const getPaymentsQuerySchema = z.object({
  ...paginationSchema.shape,
  ...dateRangeSchema.shape,
  clientId: z.string().uuid('Invalid client ID').optional(),
  bookingId: z.number().int().positive().optional(),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  status: paymentStatusEnum.optional(),
  method: paymentMethodEnum.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
});

// Webhook Schema
export const paymentWebhookSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  created: z.number(),
  livemode: z.boolean(),
  api_version: z.string().optional(),
});

// Response Schemas
export const paymentResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  status: paymentStatusEnum,
  method: paymentMethodEnum.optional(),
  email: z.string().email().optional(),
  bookingId: z.number().int().positive().optional(),
  appointmentId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  paymentIntentId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentListResponseSchema = z.object({
  items: safeArray(paymentResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const paymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  paymentIntentId: z.string(),
  amount: z.number(),
  currency: z.string(),
});

export const paymentStatusResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  email: z.string().email().optional(),
  metadata: z.record(z.unknown()).optional()
});

// Shared Types
export type CreatePaymentIntent = z.infer<typeof createPaymentIntentSchema>;
export type ClientPaymentIntent = z.infer<typeof clientPaymentIntentSchema>;
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusCheckSchema>;
export type PaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
export type PaymentResponse = z.infer<typeof paymentResponseSchema>;
export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema>;
export type PaymentStatusResponse = z.infer<typeof paymentStatusResponseSchema>;
