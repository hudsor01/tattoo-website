import { WorkflowDefinition } from '@/types';

/**
 * Default email automation workflows for the tattoo studio
 */
export const defaultWorkflows: WorkflowDefinition[] = [
  // Appointment reminder workflow - 24 hours before appointment
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Sends a reminder email 24 hours before a scheduled appointment',
    trigger: {
      type: 'appointment',
      condition: 'before',
      timeframe: {
        hours: 24,
      },
    },
    action: {
      type: 'email',
      template: 'appointment-reminder',
      data: {
        subject: 'Reminder: Your Upcoming Tattoo Appointment',
        clientName: '{{client.first_name}}',
        appointmentDate: '{{appointment.start_time}}',
        appointmentTime: '{{appointment.start_time_formatted}}',
        tattooType: '{{appointment.title}}',
        studioName: 'Ink 37',
        studioAddress: '123 Tattoo Lane, Inkville, CA 90210',
        studioPhone: '(555) 123-4567',
        studioEmail: 'appointments@ink37.com',
        studioWebsite: 'https://ink37.com',
        clientPortalLink: 'https://ink37.com/client',
      },
    },
    isActive: true,
  },

  // Aftercare instructions - 2 hours after appointment completed
  {
    id: 'aftercare-instructions',
    name: 'Aftercare Instructions',
    description: 'Sends aftercare instructions email 2 hours after appointment is completed',
    trigger: {
      type: 'appointment_status_change',
      condition: 'equals',
      status: 'completed',
      timeframe: {
        hours: 2,
        after: true,
      },
    },
    action: {
      type: 'email',
      template: 'aftercare-reminder',
      data: {
        clientName: '{{client.first_name}}',
        tattooType: '{{appointment.title}}',
        appointmentDate: '{{appointment.date_formatted}}',
        artistName: '{{artist.name}}',
        studioName: 'Ink 37',
        studioAddress: '123 Tattoo Lane, Inkville, CA 90210',
        studioPhone: '(555) 123-4567',
        studioEmail: 'care@ink37.com',
        studioWebsite: 'https://ink37.com',
        clientPortalLink: 'https://ink37.com/client/appointments',
      },
    },
    isActive: true,
  },

  // Feedback request - 2 weeks after appointment
  {
    id: 'request-review',
    name: 'Request Review',
    description: 'Requests a review 2 weeks after a completed appointment',
    trigger: {
      type: 'appointment_status_change',
      condition: 'equals',
      status: 'completed',
      timeframe: {
        days: 14,
        after: true,
      },
    },
    action: {
      type: 'email',
      template: 'request-review',
      data: {
        clientName: '{{client.first_name}}',
        tattooType: '{{appointment.title}}',
        appointmentDate: '{{appointment.date_formatted}}',
        artistName: '{{artist.name}}',
        studioName: 'Ink 37',
        studioPhone: '(555) 123-4567',
        studioEmail: 'reviews@ink37.com',
        studioWebsite: 'https://ink37.com',
        reviewLink: 'https://ink37.com/review?client={{client.id}}',
      },
    },
    isActive: true,
  },

  // Welcome email - sent when a new client signs up
  {
    id: 'welcome-new-client',
    name: 'Welcome New Client',
    description: 'Sends a welcome email when a new client registers',
    trigger: {
      type: 'client_created',
      condition: 'new_record',
    },
    action: {
      type: 'email',
      template: 'welcome',
      data: {
        clientName: '{{client.first_name}}',
        studioName: 'Ink 37',
        studioAddress: '123 Tattoo Lane, Inkville, CA 90210',
        studioPhone: '(555) 123-4567',
        studioEmail: 'hello@ink37.com',
        studioWebsite: 'https://ink37.com',
        clientPortalLink: 'https://ink37.com/client',
        bookingLink: 'https://ink37.com/booking',
      },
    },
    isActive: true,
  },
];
