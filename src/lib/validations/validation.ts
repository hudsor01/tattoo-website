/**
 * Unified Validation Module
 * 
 * This is the main entry point for all validation functionality.
 * It exports all validation schemas and utilities from a flat structure.
 */

// Core validation functionality
export * from './validation-consolidated';
export * from './validation-api-utils';
export * from './validation-form-utils';

// Schema exports
export * from './validation-auth';
export * from './validation-booking';
export * from './validation-contact';
export * from './validation-client';
export * from './validation-appointment';
export * from './validation-payment';
export * from './validation-email';