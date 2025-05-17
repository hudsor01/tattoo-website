'use client';

/**
 * Factory for creating standardized React Query hooks for API endpoints
 * 
 * This module provides a common pattern for interacting with REST APIs
 * using React Query with full TypeScript support and Zod validation.
 */

import { z } from 'zod';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useErrorHandling } from '@/hooks/use-error-handling';

// Generic type for API response data
type ApiResponse<T> = {
  data: T;
  status: number;
  statusText: string;
};

// Configuration options for each endpoint type
interface EndpointConfig {
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
}

// Options for hook factory
interface CreateStandardQueryHooksOptions<
  ListParams = any,
  ListResponse = any,
  DetailResponse = any,
  CreateRequest = any,
  CreateResponse = any,
  UpdateRequest = any,
  UpdateResponse = any,
> {
  // Resource name (for query keys)
  resource: string;
  
  // Human-readable name (for error messages)
  displayName: string;
  
  // API endpoints
  endpoints: {
    list: string;
    detail: (id: string | number) => string;
    create: string;
    update: (id: string | number) => string;
    delete: (id: string | number) => string;
  };
  
  // Zod schemas for validation
  schemas: {
    list?: {
      params?: z.ZodType<ListParams>;
      response: z.ZodType<ListResponse>;
    };
    detail?: {
      response: z.ZodType<DetailResponse>;
    };
    create?: {
      request?: z.ZodType<CreateRequest>;
      response?: z.ZodType<CreateResponse>;
    };
    update?: {
      request?: z.ZodType<UpdateRequest>;
      response?: z.ZodType<UpdateResponse>;
    };
  };
  
  // Configuration options
  config?: {
    list?: EndpointConfig;
    detail?: EndpointConfig;
    create?: EndpointConfig;
    update?: EndpointConfig;
    delete?: EndpointConfig;
  };
  
  // Custom success messages
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  
  // Custom error messages
  errorMessages?: {
    fetchList?: string;
    fetchDetail?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
}

/**
 * Creates a set of standardized React Query hooks for a resource
 */
export function createStandardQueryHooks<
  ListParams extends Record<string, any>,
  ListResponse,
  DetailResponse,
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateResponse,
>({
  const toast = useToast();
  resource,
  displayName,
  endpoints,
  schemas,
  config = {},
  successMessages = {},
  errorMessages = {},
}: CreateStandardQueryHooksOptions<
  ListParams,
  ListResponse,
  DetailResponse,
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateResponse
>) {
  // Generate standard query keys
  const queryKeys = {
    all: [resource] as const,
    lists: () => [...queryKeys.all, 'list'] as const,
    list: (params: ListParams) => [...queryKeys.lists(), params] as const,
    details: () => [...queryKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.details(), id] as const,
  };

  // Default messages
  const defaultSuccessMessages = {
    create: `${displayName} created successfully`,
    update: `${displayName} updated successfully`,
    delete: `${displayName} deleted successfully`,
  };

  const defaultErrorMessages = {
    fetchList: `Failed to load ${displayName.toLowerCase()}`,
    fetchDetail: `Failed to load ${displayName.toLowerCase()} details`,
    create: `Failed to create ${displayName.toLowerCase()}`,
    update: `Failed to update ${displayName.toLowerCase()}`,
    delete: `Failed to delete ${displayName.toLowerCase()}`,
  };

  // Merge with provided messages
  const finalSuccessMessages = { ...defaultSuccessMessages, ...successMessages };
  const finalErrorMessages = { ...defaultErrorMessages, ...errorMessages };

  // List hook
  function useList(
    params?: ListParams,
    options?: UseQueryOptions<ListResponse, Error, ListResponse, QueryKey>
  ) {
    const finalParams = params || ({} as ListParams);
    
    // Validate params if schema is provided
    if (schemas.list?.params) {
      try {
        schemas.list.params.parse(finalParams);
      } catch (error) {
        console.error('Invalid list params:', error);
      }
    }

    return useQuery<ListResponse, Error, ListResponse, QueryKey>({
      queryKey: queryKeys.list(finalParams),
      queryFn: async () => {
        try {
          const searchParams = new URLSearchParams();
          
          // Add query parameters
          Object.entries(finalParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          
          const queryString = searchParams.toString();
          const url = queryString 
            ? `${endpoints.list}?${queryString}`
            : endpoints.list;
          
          // Make API request with validation
          const response = await api.get(
            url,
            undefined,
            undefined,
            schemas.list?.response
          );
          
          return response;
        } catch (error) {
          console.error(finalErrorMessages.fetchList, error);
          throw error;
        }
      },
      staleTime: config.list?.staleTime,
      gcTime: config.list?.gcTime,
      retry: config.list?.retry,
      refetchOnWindowFocus: config.list?.refetchOnWindowFocus,
      ...options,
    });
  }

  // Detail hook
  function useDetail(
    id: string | number,
    options?: UseQueryOptions<DetailResponse, Error, DetailResponse, QueryKey>
  ) {
    return useQuery<DetailResponse, Error, DetailResponse, QueryKey>({
      queryKey: queryKeys.detail(id),
      queryFn: async () => {
        try {
          // Make API request with validation
          const response = await api.get(
            endpoints.detail(id),
            undefined,
            undefined,
            schemas.detail?.response
          );
          
          return response;
        } catch (error) {
          console.error(finalErrorMessages.fetchDetail, error);
          throw error;
        }
      },
      staleTime: config.detail?.staleTime,
      gcTime: config.detail?.gcTime,
      retry: config.detail?.retry,
      refetchOnWindowFocus: config.detail?.refetchOnWindowFocus,
      ...options,
    });
  }

  // Create hook
  function useCreate(
    options?: UseMutationOptions<
      CreateResponse,
      Error,
      CreateRequest,
      unknown
    >
  ) {
    const queryClient = useQueryClient();
    
    return useMutation<CreateResponse, Error, CreateRequest, unknown>({
      mutationFn: async (data: CreateRequest) => {
        try {
          // Validate request data if schema is provided
          if (schemas.create?.request) {
            schemas.create.request.parse(data);
          }
          
          // Make API request with validation
          const response = await api.post(
            endpoints.create,
            data,
            undefined,
            schemas.create?.response
          );
          
          return response;
        } catch (error) {
          console.error(finalErrorMessages.create, error);
          throw error;
        }
      },
      onSuccess: (data, variables, context) => {
        // Invalidate list queries to refresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        
        // Show success toast
        toast.success(finalSuccessMessages.create);
        
        // Call provided onSuccess handler
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        // Show error toast
        toast.error(finalErrorMessages.create);
        
        // Call provided onError handler
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  }

  // Update hook
  function useUpdate(
    options?: UseMutationOptions<
      UpdateResponse,
      Error,
      { id: string | number; data: UpdateRequest },
      unknown
    >
  ) {
    const queryClient = useQueryClient();
    
    return useMutation<
      UpdateResponse,
      Error,
      { id: string | number; data: UpdateRequest },
      unknown
    >({
      mutationFn: async ({ id, data }) => {
        try {
          // Validate request data if schema is provided
          if (schemas.update?.request) {
            schemas.update.request.parse(data);
          }
          
          // Make API request with validation
          const response = await api.patch(
            endpoints.update(id),
            data,
            undefined,
            schemas.update?.response
          );
          
          return response;
        } catch (error) {
          console.error(finalErrorMessages.update, error);
          throw error;
        }
      },
      onSuccess: (data, variables, context) => {
        // Invalidate affected queries
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        
        // Show success toast
        toast.success(finalSuccessMessages.update);
        
        // Call provided onSuccess handler
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        // Show error toast
        toast.error(finalErrorMessages.update);
        
        // Call provided onError handler
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  }

  // Delete hook
  function useDelete(
    options?: UseMutationOptions<void, Error, string | number, unknown>
  ) {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string | number, unknown>({
      mutationFn: async (id: string | number) => {
        try {
          // Make API request
          await api.delete(endpoints.delete(id));
        } catch (error) {
          console.error(finalErrorMessages.delete, error);
          throw error;
        }
      },
      onSuccess: (_, id, context) => {
        // Invalidate affected queries
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
        queryClient.removeQueries({ queryKey: queryKeys.detail(id) });
        
        // Show success toast
        toast.success(finalSuccessMessages.delete);
        
        // Call provided onSuccess handler
        options?.onSuccess?.(_, id, context);
      },
      onError: (error, id, context) => {
        // Show error toast
        toast.error(finalErrorMessages.delete);
        
        // Call provided onError handler
        options?.onError?.(error, id, context);
      },
      ...options,
    });
  }

  // Return all hooks and utils
  return {
    queryKeys,
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}