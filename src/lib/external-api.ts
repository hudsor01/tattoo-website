/**
 * External API client with Zod validation
 * 
 * For making requests to external APIs, not for internal API routes.
 * For internal API routes, use the tRPC client instead.
 */

import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { ApiRequestError } from '@/types/api-types';

// Create axios instance with defaults
const externalApiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
externalApiClient.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      throw ApiRequestError.fromAxiosError(error);
    }
    throw error;
  },
);

/**
 * Validate request and response data with Zod schemas
 */
function validateWithZod<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiRequestError.fromZodError(error);
    }
    throw error;
  }
}

/**
 * Type-safe external API client that validates request and response data
 */
export const externalApi = {
  /**
   * Send a GET request to an external API
   */
  async get<TResponse>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
    responseSchema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    const response = await externalApiClient.get(url, {
      params,
      ...config,
    });

    return responseSchema ? validateWithZod(responseSchema, response.data) : response.data;
  },

  /**
   * Send a POST request to an external API
   */
  async post<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: AxiosRequestConfig,
    requestSchema?: z.ZodType<TRequest>,
    responseSchema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    // Validate request data if schema is provided
    const validatedData = requestSchema ? validateWithZod(requestSchema, data) : data;

    const response = await externalApiClient.post(url, validatedData, config);

    return responseSchema ? validateWithZod(responseSchema, response.data) : response.data;
  },

  /**
   * Send a PUT request to an external API
   */
  async put<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: AxiosRequestConfig,
    requestSchema?: z.ZodType<TRequest>,
    responseSchema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    // Validate request data if schema is provided
    const validatedData = requestSchema ? validateWithZod(requestSchema, data) : data;

    const response = await externalApiClient.put(url, validatedData, config);

    return responseSchema ? validateWithZod(responseSchema, response.data) : response.data;
  },

  /**
   * Send a PATCH request to an external API
   */
  async patch<TRequest, TResponse>(
    url: string,
    data: TRequest,
    config?: AxiosRequestConfig,
    requestSchema?: z.ZodType<TRequest>,
    responseSchema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    // Validate request data if schema is provided
    const validatedData = requestSchema ? validateWithZod(requestSchema, data) : data;

    const response = await externalApiClient.patch(url, validatedData, config);

    return responseSchema ? validateWithZod(responseSchema, response.data) : response.data;
  },

  /**
   * Send a DELETE request to an external API
   */
  async delete<TResponse>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
    responseSchema?: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    const response = await externalApiClient.delete(url, {
      params,
      ...config,
    });

    return responseSchema ? validateWithZod(responseSchema, response.data) : response.data;
  },
};

export default externalApi;