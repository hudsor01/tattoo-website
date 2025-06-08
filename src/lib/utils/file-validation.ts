/**
 * File Validation Utilities
 * 
 * Provides utilities for validating files in upload handlers.
 */
import { logger } from '../logger';
import { ApiErrors } from '../api-errors';

// Define allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// File size limits in bytes
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileValidationOptions {
  allowedTypes?: string[];
  maxSize?: number;
  minSize?: number;
}

/**
 * Validates a file against the provided options
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  // Destructure options with defaults
  const {
    allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES],
    maxSize = MAX_IMAGE_SIZE,
    minSize = 0,
  } = options;

  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const error = `File type '${file.type}' not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    logger.warn('File type validation failed', { fileType: file.type, allowedTypes });
    return { valid: false, error };
  }

  // Check file size
  if (file.size < minSize) {
    return { valid: false, error: `File too small. Minimum size: ${minSize} bytes` };
  }

  if (file.size > maxSize) {
    const mbSize = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File too large. Maximum size: ${mbSize}MB` };
  }

  return { valid: true };
}

/**
 * Get file type validation options based on file category
 */
export function getFileValidationOptions(
  fileCategory: 'image' | 'video' | 'document' | 'any' = 'any'
): FileValidationOptions {
  switch (fileCategory) {
    case 'image':
      return {
        allowedTypes: ALLOWED_IMAGE_TYPES,
        maxSize: MAX_IMAGE_SIZE,
      };
    case 'video':
      return {
        allowedTypes: ALLOWED_VIDEO_TYPES,
        maxSize: MAX_VIDEO_SIZE,
      };
    case 'document':
      return {
        allowedTypes: ALLOWED_DOCUMENT_TYPES,
        maxSize: MAX_DOCUMENT_SIZE,
      };
    case 'any':
    default:
      return {
        allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES],
        maxSize: Math.max(MAX_IMAGE_SIZE, MAX_VIDEO_SIZE, MAX_DOCUMENT_SIZE),
      };
  }
}

/**
 * Extract a safe file extension from a filename
 * Only returns known safe extensions, returns 'bin' for unknown types
 */
export function getSafeFileExtension(filename: string): string {
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';

  // List of allowed extensions
  const safeExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
    'mp4', 'webm', 'ogg', 'mov',
    'pdf', 'doc', 'docx', 'txt'
  ];

  return ext && safeExtensions.includes(ext) ? ext : 'bin';
}

/**
 * Generate a secure random filename with the original extension
 */
export function generateSecureFilename(originalFilename: string, prefix = ''): string {
  const extension = getSafeFileExtension(originalFilename);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  
  return `${prefix ? `${prefix}/` : ''}${timestamp}-${randomString}.${extension}`;
}

/**
 * Validate file with built-in error handling
 */
export function validateFileWithErrorHandling(
  file: File | null | undefined,
  options: FileValidationOptions = {}
): void {
  if (!file) {
    throw ApiErrors.badRequest('No file provided');
  }

  const validation = validateFile(file, options);
  
  if (!validation.valid) {
    throw ApiErrors.badRequest(validation.error ?? 'Invalid file');
  }
}