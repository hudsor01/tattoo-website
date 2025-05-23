/**
 * Consolidated Validation Utilities
 * 
 * This file provides utilities for creating consistent validation schemas.
 * It includes factory functions for common field types and schema generation.
 */

import { z } from 'zod';
import { patterns } from './validation-core';

// Field factory creator
export const createField = {
  // Agreement field validator
  agreement: (errorMessage: string = 'You must agree to continue') => {
    return z.boolean().refine(val => val === true, {
      message: errorMessage,
    });
  },
  // Name field with common validation
  name: (options: { required?: boolean | string; minLength?: number; maxLength?: number } = {}) => {
    const { 
      required = true, 
      minLength = 2, 
      maxLength = 50 
    } = options;
    
    const schema = z.string()
      .min(minLength, { message: `Name must be at least ${minLength} characters` })
      .max(maxLength, { message: `Name cannot exceed ${maxLength} characters` })
      .refine(val => /^[a-zA-Z\s-.']+$/.test(val), {
        message: 'Name can only contain letters, spaces, and basic punctuation',
      });
    
    return required ? schema : schema.optional();
  },
  
  // Text field with common options
  text: (options: { required?: boolean | string; minLength?: number; maxLength?: number; fieldName?: string } = {}) => {
    let schema = z.string();
    const fieldName = options.fieldName || 'This field';
    
    if (options.required) {
      schema = schema.min(1, { message: options.required === true ? `${fieldName} is required` : options.required });
    }
    
    if (options.minLength) {
      schema = schema.min(options.minLength, { 
        message: `${fieldName} must be at least ${options.minLength} characters` 
      });
    }
    
    if (options.maxLength) {
      schema = schema.max(options.maxLength, { 
        message: `${fieldName} cannot exceed ${options.maxLength} characters` 
      });
    }
    
    return schema;
  },
  
  // Email field
  email: (options: { required?: boolean | string } = {}) => {
    let schema = z.string().email({ message: 'Invalid email address' });
    
    if (options.required) {
      schema = schema.min(1, { message: options.required === true ? 'Email is required' : options.required });
    }
    
    return schema;
  },
  
  // Password field
  password: (options: { required?: boolean | string; strong?: boolean } = {}) => {
    let schema = z.string();
    
    if (options.required) {
      schema = schema.min(1, { message: options.required === true ? 'Password is required' : options.required });
    }
    
    if (options.strong) {
      schema = schema.regex(patterns.password, { 
        message: 'Password must include uppercase, lowercase, number, and special character' 
      });
    }
    
    return schema;
  },
  
  // Phone field
  phone: (options: { required?: boolean | string } = {}) => {
    let schema = z.string().regex(patterns.phone, { 
      message: 'Please enter a valid phone number' 
    });
    
    if (options.required) {
      schema = schema.min(1, { message: options.required === true ? 'Phone number is required' : options.required });
    }
    
    return schema;
  },
  
  // Boolean field
  boolean: (options: { required?: boolean | string } = {}) => {
    const schema = z.boolean();
    
    if (options.required) {
      return z.boolean().refine(val => val === true, {
        message: options.required === true ? 'This field is required' : options.required as string
      });
    }
    
    return schema;
  },
  
  // Date field
  date: (options: { required?: boolean | string } = {}) => {
    const schema = z.coerce.date();
    
    if (options.required) {
      return z.coerce.date().refine(val => !isNaN(val.getTime()), {
        message: options.required === true ? 'Valid date is required' : options.required as string
      });
    }
    
    return schema;
  }
};

// Schema factory
export const createSchema = (fields: Record<string, z.ZodType<any>>) => {
  return z.object(fields);
};