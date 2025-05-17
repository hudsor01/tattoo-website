/**
 * API Error Classes
 * 
 * This module provides custom error classes for API-related errors.
 */

import type { AxiosError } from 'axios';
import { z } from 'zod';

/**
 * Custom error class for API request failures
 */
export class ApiRequestError extends Error {
  public statusCode: number | undefined;
  public data?: unknown;
  public isApiError: boolean;

  constructor(message: string, statusCode?: number, data?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.data = data;
    this.isApiError = true;
  }

  static fromAxiosError(error: AxiosError): ApiRequestError {
    const statusCode = error.response?.status;
    const data = error.response?.data;
    const message =
      (typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error?: string }).error
        : undefined) ||
      error.message ||
      'An error occurred with the API request';

    return new ApiRequestError(message, statusCode, data);
  }

  static fromZodError(error: z.ZodError): ApiRequestError {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return new ApiRequestError('Validation error', 400, { errors: formattedErrors });
  }
}