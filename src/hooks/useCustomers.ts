/**
 * Standardized Customer API Hooks
 *
 * These hooks provide consistent data fetching patterns for customer resources.
 * Built with React Query and Zod validation for type safety and optimal performance.
 */

import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
/**
 * Zod schemas for customer data validation
 */

// Customer list parameters
const CustomerListParamsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(50),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

// Customer entity schema
const CustomerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthdate: z.string().or(z.date()).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  source: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  // Relationships can be expanded as needed
  appointments: z.array(z.unknown()).optional(),
  interactions: z.array(z.unknown()).optional(),
});

// List response schema
const CustomerListResponseSchema = z.object({
  customers: z.array(CustomerSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Create customer schema
const CustomerCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  birthdate: z.string().or(z.date()).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  source: z.string().optional().nullable(),
});

// Update customer schema
const CustomerUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z.string().optional().nullable(),
  birthdate: z.string().or(z.date()).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  source: z.string().optional().nullable(),
});

// Type exports for external use
export type CustomerListParams = z.infer<typeof CustomerListParamsSchema>;
export type CustomerCreateInput = z.infer<typeof CustomerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof CustomerUpdateSchema>;
export type Customer = z.infer<typeof CustomerSchema>;

/**
 * Create standardized customer hooks
 */
const {
  queryKeys: standardCustomerKeys,
  useList,
  useDetail,
  useCreate,
  useUpdate,
  useDelete,
} = createStandardQueryHooks({
  resource: 'customers',
  displayName: 'Customers',
  endpoints: {
    list: '/api/admin/customers',
    detail: (id: string) => `/api/admin/customers/${id}`,
    create: '/api/admin/customers',
    update: (id: string) => `/api/admin/customers/${id}`,
    delete: (id: string) => `/api/admin/customers/${id}`,
  },
  schemas: {
    list: {
      params: CustomerListParamsSchema,
      response: CustomerListResponseSchema,
    },
    detail: {
      response: CustomerSchema,
    },
    create: {
      request: CustomerCreateSchema,
      response: z.object({
        success: z.boolean(),
        customerId: z.string(),
      }),
    },
    update: {
      request: CustomerUpdateSchema,
      response: z.object({
        success: z.boolean(),
      }),
    },
  },
  config: {
    list: {
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
    detail: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
  successMessages: {
    create: 'Customer created successfully',
    update: 'Customer updated successfully',
    delete: 'Customer deleted successfully',
  },
  errorMessages: {
    fetchList: 'Failed to load customers',
    fetchDetail: 'Failed to load customer details',
    create: 'Failed to create customer',
    update: 'Failed to update customer',
    delete: 'Failed to delete customer',
  },
});

/**
 * Expose basic hooks with original names for consistency
 */
export const useCustomers = useList;
export const useCustomer = useDetail;
export const useCreateCustomer = useCreate;
export const useUpdateCustomer = useUpdate;
export const useDeleteCustomer = useDelete;

/**
 * Hook for searching customers with fuzzy matching
 */
// No need for a separate interface; use Record<string, unknown> inline

export function useSearchCustomers(
  searchTerm: string | undefined,
): ReturnType<typeof useCustomers> {
  const options: Record<string, unknown> = {
    enabled: !!searchTerm && searchTerm.length >= 2,
  };
  return useCustomers(searchTerm ? { search: searchTerm } : undefined, options);
}

/**
 * Export standardized keys as well
 */
export { standardCustomerKeys as customerQueryKeys };
function createStandardQueryHooks({
  resource,
  endpoints,
  schemas,
  config,
  errorMessages,
}: {
  resource: string;
  displayName: string;
  endpoints: {
    list: string;
    detail: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
  };
  schemas: {
    list: {
      params: z.ZodTypeAny;
      response: z.ZodTypeAny;
    };
    detail: {
      response: z.ZodTypeAny;
    };
    create: {
      request: z.ZodTypeAny;
      response: z.ZodTypeAny;
    };
    update: {
      request: z.ZodTypeAny;
      response: z.ZodTypeAny;
    };
  };
  config: {
    list?: { staleTime?: number };
    detail?: { staleTime?: number };
  };
  successMessages: { create: string; update: string; delete: string };
  errorMessages: {
    fetchList: string;
    fetchDetail: string;
    create: string;
    update: string;
    delete: string;
  };
}) {
  const queryKeys = {
    all: [resource] as const,
    list: (params?: unknown) => [resource, 'list', params] as const,
    detail: (id: string) => [resource, 'detail', id] as const,
  };

  // List hook
  function useList(params?: unknown, options?: Record<string, unknown>) {
    type ListData = z.infer<typeof schemas.list.response>;
    type ListParams = ReturnType<typeof queryKeys.list>;
    const queryOptions: UseQueryOptions<ListData, Error, ListData, ListParams> = {
      queryKey: queryKeys.list(params),
      queryFn: async () => {
        const url = new URL(endpoints.list, window.location.origin);
        if (params) {
          const parsed = schemas.list.params.parse(params);
          Object.entries(parsed).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
          });
        }
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(errorMessages.fetchList);
        const data = await res.json();
        return schemas.list.response.parse(data);
      },
      ...(options && typeof options === 'object' ? options : {}),
    };
    if (typeof config.list?.['staleTime'] !== 'undefined') {
      (queryOptions as any)['staleTime'] = config.list['staleTime'];
    }
    return useQuery<ListData, Error, ListData, ListParams>(queryOptions);
  }

  // Detail hook
  function useDetail(id: string, options?: Record<string, unknown>) {
    // Import UseQueryOptions at the top if not already imported:
    type DetailData = z.infer<typeof schemas.detail.response>;
    const queryOptions: import('@tanstack/react-query').UseQueryOptions<
      DetailData,
      Error,
      DetailData,
      ReturnType<typeof queryKeys.detail>
    > = {
      queryKey: queryKeys.detail(id),
      queryFn: async () => {
        const res = await fetch(endpoints.detail(id));
        if (!res.ok) throw new Error(errorMessages.fetchDetail);
        const data = await res.json();
        return schemas.detail.response.parse(data);
      },
      enabled: !!id,
      ...(options && typeof options === 'object' ? options : {}),
    };
    if (typeof config.detail?.['staleTime'] !== 'undefined') {
      queryOptions['staleTime'] = config.detail['staleTime'];
    }
    return useQuery(queryOptions);
  }

  // Create hook
  function useCreate(options?: { [key: string]: unknown }) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (input: unknown) => {
        const parsed = schemas.create.request.parse(input);
        const res = await fetch(endpoints.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        if (!res.ok) throw new Error(errorMessages.create);
        const data = await res.json();
        return schemas.create.response.parse(data);
      },
      onSuccess: (data, variables, ctx) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
        if (typeof options?.['onSuccess'] === 'function')
          (options['onSuccess'] as (data: unknown, variables: unknown, ctx: unknown) => void)(
            data,
            variables,
            ctx,
          );
      },
      ...(options && typeof options === 'object' ? options : {}),
    });
  }

  // Update hook
  function useUpdate(options: { [key: string]: unknown } = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, input }: { id: string; input: unknown }) => {
        const parsed = schemas.update.request.parse(input);
        const res = await fetch(endpoints.update(id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        if (!res.ok) throw new Error(errorMessages.update);
        const data = await res.json();
        return schemas.update.response.parse(data);
      },
      onSuccess: (data, variables, ctx) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
        if (typeof options['onSuccess'] === 'function')
          (options['onSuccess'] as (data: unknown, variables: unknown, ctx: unknown) => void)(
            data,
            variables,
            ctx,
          );
      },
      ...(options && typeof options === 'object' ? options : {}),
    });
  }

  function useDelete(options: { [key: string]: unknown } = {}) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const res = await fetch(endpoints.delete(id), { method: 'DELETE' });
        if (!res.ok) throw new Error(errorMessages.delete);
        return { success: true };
      },
      onSuccess: (data, variables, ctx) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
        if (typeof options['onSuccess'] === 'function')
          (options['onSuccess'] as (data: unknown, variables: unknown, ctx: unknown) => void)(
            data,
            variables,
            ctx,
          );
      },
      ...(options && typeof options === 'object' ? options : {}),
    });
  }

  return {
    queryKeys,
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}
