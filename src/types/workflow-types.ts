/**
 * Workflow types for email automation and notification system.
 */

// Trigger types that can initiate a workflow
export type TriggerType =
  | 'appointment' // Based on upcoming appointment
  | 'appointment_status_change' // When appointment status changes
  | 'client_created' // When a new client is created
  | 'client_updated' // When client information is updated
  | 'payment_received' // When a payment is received
  | 'custom_date' // On a specific calendar date/time
  | 'manual'; // Triggered manually by staff

// Condition types for triggers
export type TriggerCondition =
  | 'before' // Time before an event (for appointments)
  | 'after' // Time after an event
  | 'equals' // Status equals a specific value
  | 'new_record' // New record created
  | 'updated' // Record was updated
  | 'specific'; // Specific date/time

// Action types that can be performed
export type ActionType =
  | 'email' // Send an email
  | 'sms' // Send an SMS
  | 'notification' // Create in-app notification
  | 'webhook'; // Call a webhook/external service

// Timeframe for triggers
export interface Timeframe {
  minutes?: number;
  hours?: number;
  days?: number;
  after?: boolean; // If true, trigger after the event; if false, before the event
}

// Trigger configuration
export interface TriggerConfig {
  type: TriggerType;
  condition: TriggerCondition;
  timeframe?: Timeframe;
  status?: string; // For status_change conditions
  date?: string; // For specific date triggers
}

// Action configuration
export interface ActionConfig {
  type: ActionType;
  template: string; // Email template name
  data: Record<string, unknown>; // Data to populate the template
  recipient?: string; // Override recipient if needed
}

// Complete workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: TriggerConfig;
  action: ActionConfig;
  isActive: boolean;
  lastRun?: string; // ISO date string of last run time
  createdAt?: string; // ISO date string of creation time
  updatedAt?: string; // ISO date string of last update time
}

// Execution record of a workflow
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'pending';
  executedAt: string;
  error?: string;
  metadata?: Record<string, unknown>;
}
