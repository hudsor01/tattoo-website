/**
 * Unified API client for making standardized requests
 *
 * This module provides a consistent API client for making HTTP requests
 * with consistent error handling, validation, and response parsing.
 */

import { z } from 'zod';
// API types for standardized responses and requests
type ApiResponse<T = unknown> = {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
};

type ErrorResponse = {
  success: boolean;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: unknown;
  validationErrors?: Record<string, string[]>;
};


type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  validateResponse?: boolean;
  signal?: AbortSignal;
  cache?: RequestCache;
};

type FilterParams = {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
};

type RecordObject = Record<string, unknown>;

import { logger } from "@/lib/logger";

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
    if (data !== undefined) {
      this.data = data;
    }
  }
}

/**
 * Validates a response against a Zod schema if provided
 */
async function validateResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
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
      void logger.error('Response validation error:', error);
      
      const validationErrors: Record<string, string[]> = {};
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          const path = err.path.join('.');
          validationErrors[path] ??= [];
          validationErrors[path].push(err.message);
        });
      }
      
      throw new ApiError('Invalid response data', response.status, response.statusText, {
        success: false,
        error: 'Validation failed',
        message: 'Invalid response data',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        validationErrors,
      });
    }
  }

  return data as T;
}

/**
 * Helper function to create fetch options with only defined properties
 */
function createFetchOptions(method: string, options?: RequestOptions, body?: unknown): RequestInit {
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

  // Only add body if it is a string (from JSON.stringify) or valid BodyInit
  if (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream
  ) {
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
      void Object.entries(params).forEach(([key, value]) => {
        if (value !== null) {
          void searchParams.append(key, String(value));
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
    const body = data ? JSON.stringify(data) : null;
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
    const body = data ? JSON.stringify(data) : null;
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
    const body = data ? JSON.stringify(data) : null;
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

/**
 * Track video view analytics
 * @param videoId Video identifier
 * @param duration Duration watched in seconds
 * @param metadata Additional tracking metadata
 * @returns Promise resolving to tracking result
 */
export async function trackVideoView(
  videoId: string | number,
  duration?: number,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; message?: string }> {
  try {
    await api.post('/api/analytics/video-view', {
      videoId: String(videoId),
      duration: duration ?? 0,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href,
      },
    });

    return { success: true };
  } catch (error) {
    void void logger.error('Failed to track video view:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Share content on social media platforms
 * @param contentType Type of content (tattoo, video)
 * @param contentId Content identifier (string or number)
 * @param platform Platform to share on
 * @returns Object containing success status and share URL
 */
export async function shareContent(
  contentType: 'tattoo' | 'video',
  contentId: string | number,
  platform: 'facebook' | 'twitter' | 'instagram' | 'pinterest' | 'email' | 'linkedin'
): Promise<{ success: boolean; shareUrl: string }> {
  try {
    // Base URL for the content
    const baseUrl = `${window.location.origin}/${contentType}s/${contentId}`;

    // Encode title and URL for sharing
    const encodedUrl = encodeURIComponent(baseUrl);
    const encodedTitle = encodeURIComponent(
      `Check out this amazing ${contentType} on Ink 37 Tattoo Gallery`
    );

    // Define share URLs for different platforms
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      instagram: baseUrl, // Instagram doesn't have a direct share URL, so we'll just return the content URL
      email: `mailto:?subject=${encodedTitle}&body=Check out this link: ${baseUrl}`,
    };

    // Return success with the share URL
    return {
      success: true,
      shareUrl: shareUrls[platform] ?? baseUrl,
    };
  } catch (error) {
    void void logger.error('Share content error:', error);
    // Return error with default URL
    return {
      success: false,
      shareUrl: `${window.location.origin}/${contentType}s/${contentId}`,
    };
  }
}
