export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailSendOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailServiceConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'resend';
  apiKey?: string;
  domain?: string;
  from: {
    name: string;
    email: string;
  };
}
