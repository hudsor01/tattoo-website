/**
 * Cal.com Integration Configuration
 * 
 * Configuration settings for Cal.com integration
 */

import type { CalIntegrationConfig } from '@/types/booking-types';

export const calConfig: CalIntegrationConfig = {
  namespace: 'tattoo-booking',
  username: process.env.NEXT_PUBLIC_CAL_USERNAME || 'fernando-govea',
  eventTypes: [
    'tattoo-consultation',
    'deposit-payment',
    'follow-up',
    'touch-up',
    'design-review'
  ],
  webhookSecret: process.env.CAL_WEBHOOK_SECRET,
  branding: {
    color: '#000000',
    textColor: '#ffffff',
    backgroundColor: '#f8f8f8'
  },
  customFields: {
    tattooType: true,
    size: true,
    placement: true,
    description: true,
    referenceImages: true,
    budget: true
  }
};

/**
 * Cal.com booking form questions configuration
 */
export const calFormQuestions = {
  tattooType: {
    label: 'Tattoo Type',
    type: 'select',
    required: true,
    options: [
      'Traditional',
      'Realism',
      'Japanese',
      'Black & Grey',
      'Watercolor',
      'Minimalist',
      'Geometric',
      'Custom'
    ]
  },
  size: {
    label: 'Approximate Size',
    type: 'select',
    required: true,
    options: [
      'Small (2-4 inches)',
      'Medium (4-6 inches)',
      'Large (6-8 inches)',
      'Extra Large (8+ inches)',
      'Full Sleeve',
      'Half Sleeve',
      'Back Piece'
    ]
  },
  placement: {
    label: 'Body Placement',
    type: 'text',
    required: true,
    placeholder: 'e.g., Upper arm, back, chest, etc.'
  },
  description: {
    label: 'Design Description',
    type: 'textarea',
    required: true,
    placeholder: 'Please describe your tattoo idea in detail...'
  },
  referenceImages: {
    label: 'Reference Images URLs',
    type: 'textarea',
    required: false,
    placeholder: 'Please provide links to any reference images (separate each URL with a new line)'
  },
  budget: {
    label: 'Budget Range',
    type: 'select',
    required: false,
    options: [
      'Under $500',
      '$500 - $1,000',
      '$1,000 - $2,000',
      '$2,000 - $3,000',
      '$3,000+',
      'Let\'s discuss'
    ]
  }
};

/**
 * Cal.com event type configurations
 */
export const calEventTypes = {
  'tattoo-consultation': {
    name: 'Tattoo Consultation',
    duration: 30,
    description: 'Initial consultation to discuss your tattoo design and requirements',
    color: '#000000',
    paymentRequired: false
  },
  'deposit-payment': {
    name: 'Deposit Payment Appointment',
    duration: 15,
    description: 'Quick meeting to finalize your design and collect deposit',
    color: '#1e40af',
    paymentRequired: true,
    paymentAmount: 200 // $200 deposit
  },
  'follow-up': {
    name: 'Follow-up Appointment',
    duration: 15,
    description: 'Check on healing progress and answer any questions',
    color: '#059669',
    paymentRequired: false
  },
  'touch-up': {
    name: 'Touch-up Session',
    duration: 60,
    description: 'Touch-up work for existing tattoos',
    color: '#dc2626',
    paymentRequired: false
  },
  'design-review': {
    name: 'Design Review',
    duration: 30,
    description: 'Review and finalize your custom tattoo design',
    color: '#7c3aed',
    paymentRequired: false
  }
};