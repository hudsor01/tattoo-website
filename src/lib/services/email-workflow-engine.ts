/**
 * Email Workflow Engine
 * 
 * This module handles automated email workflows based on application events.
 * It provides a framework for defining, executing and monitoring email sequences.
 */

import { sendEmail } from '@/lib/email/email-service';
import type { WorkflowDefinition, WorkflowTrigger, WorkflowStep } from '@/types/utility-types';

/**
 * Defines the structure of an email workflow
 */
export interface EmailWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  isActive: boolean;
}

/**
 * Registry of available workflows
 */
export const workflowRegistry: Record<string, WorkflowDefinition> = {};

/**
 * Register a new workflow
 */
export function registerWorkflow(workflow: WorkflowDefinition): void {
  workflowRegistry[workflow.id] = workflow;
}

/**
 * Execute a workflow based on an event
 */
export async function executeWorkflow(
  workflowId: string, 
  context: Record<string, unknown>
): Promise<boolean> {
  const workflow = workflowRegistry[workflowId];
  
  if (!workflow || !workflow.isActive) {
    return false;
  }
  
  try {
    // TODO: Log workflow execution start when workflowExecution model is added to Prisma
    // await prisma.workflowExecution.create({
    //   data: {
    //     workflowId,
    //     status: 'started',
    //     context: JSON.stringify(context),
    //   }
    // });
    
    // Execute the workflow action
    if (workflow.action.type === 'email') {
      await sendEmail({
        to: resolveValue(workflow.action.to || '', context) as string,
          subject: resolveValue(workflow.action.subject || '', context) as string,
          html: '', // Required field for EmailParams
          recipientId: workflowId,
          emailType: 'generic_notification',
          template: {
            id: workflow.action.template,
            name: workflow.action.template,
            content: '',
          },
          data: context,
        });
      
      // Add delay if specified
      if (workflow.action.delay) {
        await new Promise(resolve => setTimeout(resolve, workflow.action.delay));
      }
    }
    
    // TODO: Log workflow execution completion when workflowExecution model is added to Prisma
    // await prisma.workflowExecution.update({
    //   where: { workflowId_startedAt: { workflowId, startedAt: new Date() } },
    //   data: { status: 'completed' }
    // });
    
    return true;
  } catch (error) {
    // TODO: Log workflow execution failure when workflowExecution model is added to Prisma
    // await prisma.workflowExecution.update({
    //   where: { workflowId_startedAt: { workflowId, startedAt: new Date() } },
    //   data: { 
    //     status: 'failed',
    //     error: error instanceof Error ? error.message : 'Unknown error'
    //   }
    // });
    
    console.error('Workflow execution failed:', error);
    return false;
  }
}

/**
 * Resolve a template value using context data
 */
function resolveValue(
  template: string | ((context: Record<string, unknown>) => string),
  context: Record<string, unknown>
): string {
  if (typeof template === 'function') {
    return template(context);
  }
  
  // Replace {{variable}} patterns in the template
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, key) => {
    const keys = key.trim().split('.');
    let value: unknown = context;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return '';
      }
    }
    
    return String(value ?? '');
  });
}
