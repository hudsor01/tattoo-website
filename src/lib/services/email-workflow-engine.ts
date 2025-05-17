/**
 * Email Workflow Engine
 * 
 * This module handles automated email workflows based on application events.
 * It provides a framework for defining, executing and monitoring email sequences.
 */

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/email/email-service';
import type { EmailTemplate } from '@/types/email-types';
import type { WorkflowDefinition, WorkflowTrigger, WorkflowStep } from '@/types/workflow-types';

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
    // Log workflow execution start
    await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'started',
        context: JSON.stringify(context),
      }
    });
    
    // Execute each step in sequence
    for (const step of workflow.steps) {
      if (step.type === 'email') {
        await sendEmail({
          to: resolveValue(step.to, context) as string,
          subject: resolveValue(step.subject, context) as string,
          template: step.template as EmailTemplate,
          data: context,
        });
      }
      
      // Add delay if specified
      if (step.delay) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }
    }
    
    // Log workflow execution completion
    await prisma.workflowExecution.update({
      where: { workflowId_startedAt: { workflowId, startedAt: new Date() } },
      data: { status: 'completed' }
    });
    
    return true;
  } catch (error) {
    // Log workflow execution failure
    await prisma.workflowExecution.update({
      where: { workflowId_startedAt: { workflowId, startedAt: new Date() } },
      data: { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
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
