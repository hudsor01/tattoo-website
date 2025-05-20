/**
 * Unified API client for making standardized requests
 * 
 * This module provides a consistent API client for making HTTP requests
 * with consistent error handling, validation, and response parsing.
 */

import { z } from 'zod';
import type { ApiResponse, ErrorResponse } from '@/types/api-types';
import { type RecordObject } from '@/types/utility-types';

/**
 * Common options for all API requests
 */
interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
}

/**
 * Parameters for filtering API results
 */
export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Error from API requests with status code and structured data
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: ErrorResponse;

  constructor(message: string, status: number, statusText: string, data?: ErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Validates a response against a Zod schema if provided
 */
async function validateResponse<T>(
  response: Response,
  schema?: z.ZodType<T>
): Promise<T> {
  // Check for error response
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // If parsing fails, use null
    }
    
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      response.statusText,
      errorData
    );
  }
  
  // For 204 No Content responses, return empty object
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response
  const data = await response.json();
  
  // Validate with Zod if schema is provided
  if (schema) {
    try {
      return schema.parse(data);
    } catch (error) {
      console.error('Response validation error:', error);
      throw new ApiError(
        'Invalid response data',
        response.status,
        response.statusText,
        { validationError: error, data }
      );
    }
  }
  
  return data as T;
}

/**
 * Helper function to create fetch options with only defined properties
 */
function createFetchOptions(
  method: string,
  options?: RequestOptions,
  body?: any
): RequestInit {
  // Start with required properties
  const fetchOptions: RequestInit = {
    method,
    credentials: 'include', // Always include cookies
  };

  // Add headers
  fetchOptions.headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Only add body if it exists
  if (body !== undefined) {
    fetchOptions.body = body;
  }

  // Only add signal if it exists
  if (options?.signal) {
    fetchOptions.signal = options.signal;
  }

  // Only add cache if it exists
  if (options?.cache) {
    fetchOptions.cache = options.cache;
  }

  return fetchOptions;
}

/**
 * Main API client object with methods for different HTTP verbs
 */
export const api = {
  /**
   * Make a GET request
   */
  async get<T = RecordObject>(
    url: string,
    options?: RequestOptions,
    params?: FilterParams,
    schema?: z.ZodType<T>
  ): Promise<T> {
    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    // Make request
    const fetchOptions = createFetchOptions('GET', options);
    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },

  /**
   * Make a POST request
   */
  async post<T = ApiResponse<RecordObject>, D = RecordObject>(
    url: string,
    data?: D,
    options?: RequestOptions,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    const fetchOptions = createFetchOptions('POST', options, body);
    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },

  /**
   * Make a PUT request
   */
  async put<T = ApiResponse<RecordObject>, D = RecordObject>(
    url: string,
    data?: D,
    options?: RequestOptions,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    const fetchOptions = createFetchOptions('PUT', options, body);
    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },

  /**
   * Make a PATCH request
   */
  async patch<T = ApiResponse<RecordObject>, D = RecordObject>(
    url: string,
    data?: D,
    options?: RequestOptions,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined;
    const fetchOptions = createFetchOptions('PATCH', options, body);
    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },

  /**
   * Make a DELETE request
   */
  async delete<T = ApiResponse<RecordObject>>(
    url: string,
    options?: RequestOptions,
    schema?: z.ZodType<T>
  ): Promise<T> {
    const fetchOptions = createFetchOptions('DELETE', options);
    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },

  /**
   * Make a multipart form data request (for file uploads)
   */
  async upload<T = ApiResponse<{ url: string }>>(
    url: string,
    formData: FormData,
    options?: RequestOptions,
    schema?: z.ZodType<T>
  ): Promise<T> {
    // For uploads, we need a different approach since we don't want to set Content-Type
    const fetchOptions: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Always include cookies
    };

    // Only add headers if they exist
    if (options?.headers) {
      fetchOptions.headers = options.headers;
    }

    // Only add signal if it exists
    if (options?.signal) {
      fetchOptions.signal = options.signal;
    }

    // Only add cache if it exists
    if (options?.cache) {
      fetchOptions.cache = options.cache;
    }

    const response = await fetch(url, fetchOptions);

    return validateResponse(response, schema);
  },
};