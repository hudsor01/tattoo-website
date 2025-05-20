/**
 * payments-types.ts
 *
 * Type definitions for payment processing, forms, and related functionality.
 */

import type { ID, DateString } from './utility-types';
import type { BaseEntity } from './database.types';
import { PaymentStatus, PaymentMethod } from './enum-types';
import { z } from 'zod';
import { PaymentMethodSchema, PaymentStatusSchema } from './booking-types';
/**
 * PRICING TYPES (from pricing-types.ts)
 */

/**
 * Pricing breakdown structure
 */
export interface PricingBreakdown {
  baseHourlyRate: number;
  estimatedHours: number;
  sizeFactor: number;
  placementFactor: number;
  complexityFactor: number;
  totalPrice: number;
  depositAmount: number;
}

/**
 * Size pricing data structure
 */
export interface SizePricing {
  size: string;
  label: string;
  basePrice: number;
}

/**
 * Placement factor data structure
 */
export interface PlacementFactor {
  placement: string;
  label: string;
  factor: number;
}

/**
 * Complexity level data structure
 */
export interface ComplexityLevel {
  level: number;
  label: string;
  factor: number;
}

/**
 * Standard pricing data structure
 */
export interface StandardPricingData {
  sizePrices: SizePricing[];
  placementFactors: PlacementFactor[];
  complexityLevels: ComplexityLevel[];
  depositPercentage: number;
  baseHourlyRate: number;
}

/**
 * Artist rate structure
 */
export interface ArtistRate {
  baseRate: number;
  customRates: Array<{
    size: string;
    placement: string;
    rate: number;
  }>;
}

/**
 * PAYMENT TYPES
 */

/**
 * Props for payment form components
 */
export interface PaymentFormProps {
  appointmentId?: string;
  bookingId?: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  buttonText?: string;
  description?: string;
  paymentType?: 'deposit' | 'full' | 'other';
}

/**
 * Payment receipt data
 */
export interface PaymentData {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  appointmentTitle: string;
  appointmentDate: string;
  paymentMethod: string; // "credit_card", "cash", "venmo", etc.
  status: string; // "pending", "succeeded", "failed", "refunded"
  transactionId?: string;
  invoiceId?: string;
}

/**
 * Payment data used in dashboard
 */
export interface DashboardPayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: string;
  type: string;
  date: string;
  method: string;
  appointmentId?: string;
  appointmentTitle?: string;
  notes?: string;
}

// From RealtimePayments.tsx
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

/**
 * Payment type options
 */
export const PaymentTypeSchema = z.enum([
  'deposit',
  'full_payment',
  'partial_payment',
  'tip',
  'product',
  'gift_card',
  'other',
]);

export interface RealtimePaymentsProps {
  limit?: number;
}

/**
 * Base payment schema shared between create/update operations
 */
export const PaymentBaseSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  customerEmail: z.string().email('Invalid email format'),
  customerName: z.string().min(1, 'Customer name is required'),
  paymentMethod: PaymentMethodSchema,
  paymentType: PaymentTypeSchema,
  description: z.string().optional(),
});

/**
 * Schema for creating a new payment
 */
export const PaymentCreateSchema = PaymentBaseSchema.extend({
  bookingId: z.string().optional(),
  appointmentId: z.string().optional(),
  customerId: z.string().optional(),
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  status: PaymentStatusSchema.optional().default('pending'),
  metadata: z.record(z.string()).optional(),
});

/**
 * Schema for updating an existing payment
 */
export const PaymentUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  status: PaymentStatusSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

/**
 * Schema for a payment in the database
 */
export const PaymentSchema = PaymentBaseSchema.extend({
  id: z.string(),
  bookingId: z.string().optional(),
  appointmentId: z.string().optional(),
  customerId: z.string().optional(),
  status: PaymentStatusSchema,
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  processedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  refundAmount: z.number().optional(),
  refundReason: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema for creating a payment intent
 */
export const PaymentIntentCreateSchema = z.object({
  amount: z.number().positive(),
  bookingId: z.string().optional(),
  appointmentId: z.string().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  paymentType: PaymentTypeSchema,
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * Schema for payment intent response
 */
export const PaymentIntentResponseSchema = z.object({
  clientSecret: z.string().optional(),
  paymentIntentId: z.string().optional(),
  amount: z.number(),
  status: z.string(),
  checkoutUrl: z.string().url().optional(),
  error: z.string().optional(),
});

/**
 * Schema for payment list query parameters
 */
export const PaymentListParamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  status: PaymentStatusSchema.optional(),
  paymentMethod: PaymentMethodSchema.optional(),
  paymentType: PaymentTypeSchema.optional(),
  startDate: z.date().optional(),
    endDate: z.date().optional(),
    customerId: z.string().optional(),
    bookingId: z.string().optional(),
    appointmentId: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  searchTerm: z.string().optional(),
});

/**
 * Schema for payment list response
 */
export const PaymentListResponseSchema = z.object({
  payments: z.array(PaymentSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
  summary: z
    .object({
      totalAmount: z.number(),
      avgAmount: z.number().optional(),
      successfulPayments: z.number().optional(),
      pendingPayments: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for payment refund
 */
export const PaymentRefundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(), // If not provided, full amount is refunded
  reason: z.string().optional(),
  sendEmail: z.boolean().optional().default(true),
});

// Export type definitions derived from schemas
export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export type PaymentBase = z.infer<typeof PaymentBaseSchema>;
export type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentIntentCreate = z.infer<typeof PaymentIntentCreateSchema>;
export type PaymentIntentResponse = z.infer<typeof PaymentIntentResponseSchema>;
export type PaymentListParams = z.infer<typeof PaymentListParamsSchema>;
export type PaymentListResponse = z.infer<typeof PaymentListResponseSchema>;
export type PaymentRefund = z.infer<typeof PaymentRefundSchema>;

// Export form-specific types for React Hook Form
export type PaymentFormValues = PaymentCreateInput;

/**
 * payment.ts
 *
 * Types related to payments, transactions, and financial records.
 */

/**
 * Payment entity interface
 */
export interface PaymentEntity extends BaseEntity {
  clientId?: ID;
  bookingId?: ID;
  appointmentId?: ID;
  amount: number;
  currency?: string;
  status: PaymentStatus | string;
  paymentMethod: PaymentMethod | string;
  paymentType: PaymentType | string;
  transactionId?: string;
  receiptUrl?: string;
  receiptEmail?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null>;
  refundedAmount?: number;
  refundedAt?: DateString;
  refundReason?: string;
  notes?: string;
}

/**
 * Payment creation request
 */
export interface PaymentCreateRequest {
  clientId?: ID;
  bookingId?: ID;
  appointmentId?: ID;
  amount: number;
  currency?: string;
  status?: PaymentStatus | string;
  paymentMethod: PaymentMethod | string;
  paymentType: PaymentType | string;
  transactionId?: string;
  receiptUrl?: string;
  receiptEmail?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null>;
  notes?: string;
}

/**
 * Payment update request
 */
export interface PaymentUpdateRequest {
  clientId?: ID;
  bookingId?: ID;
  appointmentId?: ID;
  amount?: number;
  currency?: string;
  status?: PaymentStatus | string;
  paymentMethod?: PaymentMethod | string;
  paymentType?: PaymentType | string;
  transactionId?: string;
  receiptUrl?: string;
  receiptEmail?: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null>;
  refundedAmount?: number;
  refundedAt?: DateString;
  refundReason?: string;
  notes?: string;
}

/**
 * Payment with expanded relations
 */
export interface PaymentWithRelations extends PaymentEntity {
  client?: {
    id: ID;
    name: string;
    email: string;
  };
  booking?: {
    id: ID;
    tattooType: string;
    status: string;
  };
  appointment?: {
    id: ID;
    title: string;
    startTime: DateString;
    status: string;
  };
}

/**
 * Refund request
 */
export interface RefundRequest {
  paymentId: ID;
  amount?: number;
  reason?: string;
  fullRefund?: boolean;
  sendReceipt?: boolean;
}

/**
 * Payment statistics interface
 */
export interface PaymentStats {
  totalAmount: number;
  totalCount: number;
  byStatus: Record<PaymentStatus | string, number>;
  byMethod: Record<PaymentMethod | string, number>;
  byType: Record<PaymentType | string, number>;
  byMonth?: Record<string, number>;
  refundedAmount?: number;
  averageAmount?: number;
}

/**
 * Stripe payment metadata interface
 */
export interface PaymentMetadata {
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
  stripeChargeId?: string;
  stripeLastError?: string;
  stripeRefundId?: string;
  refundAmount?: number;
  refundReason?: string;
  disputeReason?: string;
  disputeStatus?: string;
  disputeAmount?: number;
}
