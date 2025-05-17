/**
 * Email API validation schemas
 */

import * as z from 'zod';
import { paginationSchema, uuidParamSchema } from './validation-common';
import { safeArray } from './validation-core';

/**
 * Email template schema
 */
export const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(200),
  bodyHtml: z.string().min(1, 'HTML body is required'),
  bodyText: z.string().optional(),
  category: z.enum(['booking', 'appointment', 'payment', 'marketing', 'notification', 'other']),
  tags: safeArray(z.string()).optional(),
  isDefault: z.boolean().optional().default(false),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

/**
 * Email campaign schema
 */
export const emailCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  subject: z.string().min(1, 'Subject is required').max(200),
  bodyHtml: z.string().min(1, 'HTML body is required'),
  bodyText: z.string().optional(),
  recipientType: z.enum(['all_clients', 'selected_clients', 'specific_tags']),
  recipientFilter: z
    .object({
      clientIds: safeArray(z.string().uuid()).optional(),
      tags: safeArray(z.string()).optional(),
      hasAppointment: z.boolean().optional(),
      appointmentStatus: safeArray(z.string()).optional(),
      lastAppointmentBefore: z
        .string()
        .refine(val => !val || !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        })
        .optional(),
      lastAppointmentAfter: z
        .string()
        .refine(val => !val || !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        })
        .optional(),
      neverHadAppointment: z.boolean().optional(),
    })
    .optional(),
  scheduledFor: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'cancelled']).default('draft'),
});

export type EmailCampaignInput = z.infer<typeof emailCampaignSchema>;

/**
 * Email template list query schema
 */
export const getEmailTemplateQuerySchema = z.object({
  ...paginationSchema.shape,
  category: z
    .enum(['booking', 'appointment', 'payment', 'marketing', 'notification', 'other'])
    .optional(),
  search: z.string().optional(),
});

export type GetEmailTemplateQueryParams = z.infer<typeof getEmailTemplateQuerySchema>;

/**
 * Email campaign list query schema
 */
export const getEmailCampaignQuerySchema = z.object({
  ...paginationSchema.shape,
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'cancelled']).optional(),
  search: z.string().optional(),
  scheduledBefore: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  scheduledAfter: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
});

export type GetEmailCampaignQueryParams = z.infer<typeof getEmailCampaignQuerySchema>;

/**
 * Email template ID param schema
 */
export const emailTemplateIdParamSchema = uuidParamSchema;

/**
 * Email campaign ID param schema
 */
export const emailCampaignIdParamSchema = uuidParamSchema;

/**
 * Email template preview schema
 */
export const emailTemplatePreviewSchema = z.object({
  templateId: z.string().uuid().optional(),
  bodyHtml: z.string().optional(),
  subject: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type EmailTemplatePreviewInput = z.infer<typeof emailTemplatePreviewSchema>;

/**
 * Email campaign recipients list schema
 */
export const emailCampaignRecipientsSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
});

export type EmailCampaignRecipientsInput = z.infer<typeof emailCampaignRecipientsSchema>;

/**
 * Send campaign schema
 */
export const sendCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  sendNow: z.boolean().optional().default(false),
  scheduledFor: z
    .string()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
});

export type SendCampaignInput = z.infer<typeof sendCampaignSchema>;

/**
 * Email template response schema
 */
export const emailTemplateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  bodyText: z.string().optional().nullable(),
  category: z.string(),
  tags: safeArray(z.string()).optional(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EmailTemplateResponse = z.infer<typeof emailTemplateResponseSchema>;

/**
 * Email campaign response schema
 */
export const emailCampaignResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  bodyText: z.string().optional().nullable(),
  recipientType: z.string(),
  recipientFilter: z.record(z.unknown()).optional().nullable(),
  scheduledFor: z.date().optional().nullable(),
  status: z.string(),
  sentCount: z.number().optional(),
  openCount: z.number().optional(),
  clickCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EmailCampaignResponse = z.infer<typeof emailCampaignResponseSchema>;

/**
 * Email template list response schema
 */
export const emailTemplateListResponseSchema = z.object({
  templates: safeArray(emailTemplateResponseSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

export type EmailTemplateListResponse = z.infer<typeof emailTemplateListResponseSchema>;

/**
 * Email campaign list response schema
 */
export const emailCampaignListResponseSchema = z.object({
  campaigns: safeArray(emailCampaignResponseSchema),
  pagination: z.object({
    total: z.number(),
    pages: z.number(),
    currentPage: z.number(),
    perPage: z.number(),
  }),
});

export type EmailCampaignListResponse = z.infer<typeof emailCampaignListResponseSchema>;

/**
 * Email campaign recipients response schema
 */
export const emailCampaignRecipientsResponseSchema = z.object({
  recipients: safeArray(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      email: z.string().email(),
      type: z.string(),
    })
  ),
  totalCount: z.number(),
});

export type EmailCampaignRecipientsResponse = z.infer<typeof emailCampaignRecipientsResponseSchema>;
