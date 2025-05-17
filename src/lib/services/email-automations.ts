import { sendEmail, EmailRecipient } from '@/lib/email/email-service';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Email template directory path (adjust to your project structure)
const TEMPLATE_DIR = path.join(process.cwd(), 'src/templates/emails');

// Cache for compiled templates
const templateCache: Record<string, HandlebarsTemplateDelegate> = {};

interface AutomationConfig<T = Record<string, unknown>> {
  type: string;
  triggerField?: string;
  triggerValue?: string | boolean;
  triggerComparison?: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte';
  delay?: number; // Delay in minutes after trigger
  sendToClient: boolean;
  sendToArtist: boolean;
  subject: string;
  template: string;
  templateData?: T;
}

// Automation types
const AUTOMATION_TYPES = {
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  DEPOSIT_RECEIVED: 'deposit_received',
  AFTERCARE_INSTRUCTIONS: 'aftercare_instructions',
  REVIEW_REQUEST: 'review_request',
  CLIENT_REENGAGEMENT: 'client_reengagement',
};

// Default templates for automations
const DEFAULT_TEMPLATES = {
  [AUTOMATION_TYPES.APPOINTMENT_CONFIRMATION]: 'appointment-confirmation',
  [AUTOMATION_TYPES.APPOINTMENT_REMINDER]: 'appointment-reminder',
  [AUTOMATION_TYPES.DEPOSIT_RECEIVED]: 'deposit-confirmation',
  [AUTOMATION_TYPES.AFTERCARE_INSTRUCTIONS]: 'aftercare-instructions',
  [AUTOMATION_TYPES.REVIEW_REQUEST]: 'review-request',
  [AUTOMATION_TYPES.CLIENT_REENGAGEMENT]: 'client-reengagement',
};

// Automation configurations
const automationConfigs: AutomationConfig[] = [
  // Appointment Confirmation - Triggered when an appointment is created
  {
    type: AUTOMATION_TYPES.APPOINTMENT_CONFIRMATION,
    sendToClient: true,
    sendToArtist: true,
    subject: 'Your Tattoo Appointment Confirmation',
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.APPOINTMENT_CONFIRMATION],
  },

  // Appointment Reminder - Triggered 24 hours before appointment
  {
    type: AUTOMATION_TYPES.APPOINTMENT_REMINDER,
    triggerField: 'start_time',
    triggerComparison: 'gt',
    delay: 1440, // 24 hours in minutes
    sendToClient: true,
    sendToArtist: true,
    subject: 'Reminder: Your Tattoo Appointment Tomorrow',
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.APPOINTMENT_REMINDER],
  },

  // Deposit Received - Triggered when deposit is marked as paid
  {
    type: AUTOMATION_TYPES.DEPOSIT_RECEIVED,
    triggerField: 'deposit_paid',
    triggerValue: true,
    triggerComparison: 'eq',
    sendToClient: true,
    sendToArtist: true,
    subject: 'Deposit Received for Your Tattoo Appointment',
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.DEPOSIT_RECEIVED],
  },

  // Aftercare Instructions - Triggered after appointment is marked as completed
  {
    type: AUTOMATION_TYPES.AFTERCARE_INSTRUCTIONS,
    triggerField: 'status',
    triggerValue: 'completed',
    triggerComparison: 'eq',
    delay: 60, // 1 hour in minutes
    sendToClient: true,
    sendToArtist: false,
    subject: 'Tattoo Aftercare Instructions',
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.AFTERCARE_INSTRUCTIONS],
  },

  // Review Request - Triggered 7 days after appointment is completed
  {
    type: AUTOMATION_TYPES.REVIEW_REQUEST,
    triggerField: 'status',
    triggerValue: 'completed',
    triggerComparison: 'eq',
    delay: 10080, // 7 days in minutes
    sendToClient: true,
    sendToArtist: false,
    subject: 'How Was Your Tattoo Experience?',
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.REVIEW_REQUEST],
  },

  // Client Re-engagement - For clients who haven't booked in a while (manual trigger)
  {
    type: AUTOMATION_TYPES.CLIENT_REENGAGEMENT,
    sendToClient: true,
    sendToArtist: false,
    subject: "We'd Love to See You Again at Ink 37",
    template: DEFAULT_TEMPLATES[AUTOMATION_TYPES.CLIENT_REENGAGEMENT],
  },
];

/**
 * Load and compile a Handlebars template
 */
function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  // Check cache first
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  try {
    // Resolve template path
    const templatePath = path.join(TEMPLATE_DIR, `${templateName}.hbs`);
    // Load template content
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateContent);
    // Store in cache
    templateCache[templateName] = compiledTemplate;

    return compiledTemplate;
  } catch (error) {
    console.error(`Failed to load template '${templateName}':`, error);

    // Return a fallback template
    return Handlebars.compile(`
<!DOCTYPE html>
<html>
<body>
<h1>Error: Template Not Found</h1>
<p>The requested email template could not be found.</p>
</body>
</html>
    `);
  }
}

/**
 * Render a template with data
 */
function renderTemplate(templateName: string, data: Record<string, unknown>): string {
  try {
    const template = loadTemplate(templateName);
    return template(data);
  } catch (error) {
    console.error(`Failed to render template '${templateName}':`, error);
    return `
<!DOCTYPE html>
<html>
<body>
<h1>Error: Template Rendering Failed</h1>
<p>Something went wrong rendering this email.</p>
</body>
</html>
    `;
  }
}

/**
 * Render a plain text version of an email
 * @param templateName The name of the template, used for logging (currently unused)
 * @param data The data to render in the template (currently unused)
 * @returns A plain text version of the email
 */
function renderPlainText(_templateName: string, _data: Record<string, unknown>): string {
  // For now, this just returns a basic text version
  // In a full implementation, you'd have separate plain text templates for each HTML template
  return `
Notification from Ink 37

There was important information to share, but we had trouble formatting this email.
Please contact the studio directly if you need assistance.
    `;
}

interface ClientWithAppointments {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_logs?: Array<{
    id: string | number;
    automation_type: string;
    createdAt: string;
  }>;
}

interface Appointment {
  id: string;
  clients: ClientWithAppointments;
  startDate: string;
  endDate: string;
  status: string;
  details?: string;
  serviceType?: string;
}

async function sendAutomatedEmail(appointment: Appointment, config: AutomationConfig) {
  if (!appointment || !appointment.clients) {
    console.error('Appointment data missing:', appointment?.id);
    return;
  }

  const client = appointment.clients;

  // Prepare template data
  const templateData = {
    appointment: {
      id: appointment.id,
      title: appointment.serviceType || 'Tattoo Appointment',
      date: new Date(appointment.startDate).toLocaleDateString(),
      time: new Date(appointment.startDate).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: Math.round(
        (new Date(appointment.endDate).getTime() - new Date(appointment.startDate).getTime()) /
          (1000 * 60),
      ),
      details: appointment.details || '',
    },
    client: {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
    },
    studio: {
      name: process.env.STUDIO_NAME || 'Ink 37 Tattoo Studio',
      address: process.env.STUDIO_ADDRESS || '123 Main St, Dallas, TX 75001',
      phone: process.env.STUDIO_PHONE || '(555) 123-4567',
      email: process.env.STUDIO_EMAIL || 'studio@ink37.com',
      website: process.env.NEXT_PUBLIC_DOMAIN || 'ink37.com',
    },
    // Add current date
    currentDate: new Date().toLocaleDateString(),
    // Any additional dynamic data
    ...(config.templateData || {}),
  };

  // Track email sending
  console.info('Sending automated email:', config.type, 'to', client.email);

  // Client recipient
  const clientRecipient: EmailRecipient = {
    email: client.email,
    name: `${client.first_name} ${client.last_name}`,
  };

  // Render email content
  const htmlContent = renderTemplate(config.template, templateData);
  // Generate plain text version as a fallback (not currently used)
  renderPlainText(config.template, templateData);

  // Send email
  if (config.sendToClient) {
    await sendEmail(clientRecipient, config.subject, htmlContent, {
      isHtml: true,
      replyTo: {
        email: process.env.STUDIO_EMAIL || 'studio@example.com',
        name: process.env.STUDIO_NAME || 'Tattoo Studio',
      },
    });
  }

  // Track successful email send
  console.info('Successfully sent email:', config.type, 'to client', client.id);
}

async function sendClientReengagementEmail(
  client: ClientWithAppointments,
  config: AutomationConfig,
) {
  if (!client || !client.email) {
    console.error('Client data missing:', client?.id);
    return;
  }

  // Prepare template data
  const templateData = {
    client: {
      id: client.id,
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email,
    },
    // Last appointment details (if available in the client record)
    lastAppointment:
      client.appointments && client.appointments[0]
        ? {
            date: new Date(client.appointments[0].startDate).toLocaleDateString(),
            title: client.appointments[0].title || 'Previous Appointment',
          }
        : null,
    // Any additional dynamic data
    ...(config.templateData || {}),
    // Add current date
    currentDate: new Date().toLocaleDateString(),
    studioDomain: process.env.NEXT_PUBLIC_DOMAIN || 'ink37.com',
  };

  // Track email sending
  console.info('Sending reengagement email to', client.email);

  const clientRecipient: EmailRecipient = {
    email: client.email,
    name: `${client.first_name} ${client.last_name}`,
  };

  const htmlContent = renderTemplate(config.template, templateData);
  // Generate plain text version as a fallback (not currently used)
  renderPlainText(config.template, templateData);

  await sendEmail(clientRecipient, config.subject, htmlContent, {
    isHtml: true,
    replyTo: {
      email: process.env.STUDIO_EMAIL || 'studio@example.com',
      name: process.env.STUDIO_NAME || 'Tattoo Studio',
    },
  });

  // Track successful email send
  console.info('Successfully sent reengagement email to client', client.id);
}

/**
 * Register Handlebars helpers used in templates
 */
function registerHandlebarsHelpers() {
  // Format currency helper
  Handlebars.registerHelper('currency', function (value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  });

  // Format date helper
  Handlebars.registerHelper('formatDate', function (date, format) {
    if (!date) return '';
    const dateObj = new Date(date);

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString();
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return dateObj.toLocaleDateString();
    }
  });

  // Conditional helper
  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });
}

// Initialize handlebars helpers
registerHandlebarsHelpers();

// Export the functions for use in other parts of the application
export {
  sendAutomatedEmail,
  sendClientReengagementEmail,
  AUTOMATION_TYPES,
  DEFAULT_TEMPLATES,
  automationConfigs,
};
