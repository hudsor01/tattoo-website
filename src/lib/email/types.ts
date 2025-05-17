/**
 * Email Service Types
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  from?: EmailRecipient;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  replyTo?: EmailRecipient;
  headers?: Record<string, string>;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface BulkEmailOptions extends Omit<EmailOptions, 'to'> {
  to: EmailRecipient[];
  useBcc?: boolean;
  batchSize?: number;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface TemplateData {
  [key: string]: any;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendTemplate(
    templateId: string,
    data: TemplateData,
    options: Omit<EmailOptions, 'html' | 'text'>
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendBulk(
    options: BulkEmailOptions
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string }>>;
}