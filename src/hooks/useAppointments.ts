/**
 * Standardized Appointment API Hooks
 *
 * These hooks provide consistent data fetching patterns for appointment resources.
 * Built with React Query and Zod validation for type safety and optimal performance.
 */

import { z } from 'zod';
import { createStandardQueryHooks } from '@/hooks/createStandardQueryHooks';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandling } from '@/hooks/use-error-handling';

/**
 * Zod schemas for appointment data validation
 */

// Appointment list parameters
const AppointmentListParamsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(50),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional().nullable(),
  artistId: z.string().optional(),
  customerId: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

// Appointment entity schema
const AppointmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  customerId: z.string(),
  artistId: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
  // Relationships
  customer: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  artist: z
    .object({
      id: z.string(),
      userId: z.string(),
      user: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string().email(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

// List response schema
const AppointmentListResponseSchema = z.object({
  appointments: z.array(AppointmentSchema),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
});

// Create appointment schema
const AppointmentCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  customerId: z.string(),
  artistId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

// Update appointment schema
const AppointmentUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  artistId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

// Type exports for external use
export type AppointmentStatus = z.infer<typeof AppointmentSchema>['status'];
export type AppointmentListParams = z.infer<typeof AppointmentListParamsSchema>;
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;

// Check availability request schema
const CheckAvailabilitySchema = z.object({
  artistId: z.string(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  appointmentId: z.string().optional(),
});

// Check availability response schema
const AvailabilityResponseSchema = z.object({
  isAvailable: z.boolean(),
  conflicts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        startDate: z.string().or(z.date()),
        endDate: z.string().or(z.date()),
      }),
    )
    .optional()
    .nullable(),
});

/**
 * Create standardized appointment hooks
 */
const {
  queryKeys: standardAppointmentKeys,
  useList,
  useDetail,
  useCreate,
  useUpdate,
  useDelete,
} = createStandardQueryHooks({
  resource: 'appointments',
  displayName: 'Appointments',
  endpoints: {
    list: '/api/admin/appointments',
    detail: (id: string | number) => `/api/admin/appointments/${id}`,
    create: '/api/admin/appointments',
    update: (id: string | number) => `/api/admin/appointments/${id}`,
    delete: (id: string | number) => `/api/admin/appointments/${id}`,
  },
  schemas: {
    list: {
      params: AppointmentListParamsSchema,
      response: AppointmentListResponseSchema,
    },
    detail: {
      response: AppointmentSchema,
    },
    create: {
      request: AppointmentCreateSchema,
      response: z.object({
        success: z.boolean(),
        appointmentId: z.string(),
      }),
    },
    update: {
      request: AppointmentUpdateSchema,
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
    create: 'Appointment scheduled successfully',
    update: 'Appointment updated successfully',
    delete: 'Appointment deleted successfully',
  },
  errorMessages: {
    fetchList: 'Failed to load appointments',
    fetchDetail: 'Failed to load appointment details',
    create: 'Failed to schedule appointment',
    update: 'Failed to update appointment',
    delete: 'Failed to delete appointment',
  },
});

/**
 * Expose basic hooks with original names for consistency
 */
export const useAppointments = useList;
export const useAppointment = useDetail;
export const useCreateAppointment = useCreate;
export const useUpdateAppointment = useUpdate;
export const useDeleteAppointment = useDelete;

/**
 * Hook for checking artist availability
 */
export function useCheckAvailability(
  params: z.infer<typeof CheckAvailabilitySchema>,
  enabled: boolean = true,
) {
  const toast = useToast();
  return useQuery({
    queryKey: ['appointments', 'availability', params],
    queryFn: async () => {
      try {
        const validatedParams = CheckAvailabilitySchema.parse(params);

        const searchParams = new URLSearchParams();
        searchParams.append('artistId', validatedParams.artistId);
        searchParams.append('startDate', validatedParams.startDate.toString());
        searchParams.append('endDate', validatedParams.endDate.toString());

        if (validatedParams.appointmentId) {
          searchParams.append('appointmentId', validatedParams.appointmentId);
        }

        const result = await api.get(
          `/api/admin/appointments/check-availability?${searchParams.toString()}`,
          undefined,
          undefined,
          AvailabilityResponseSchema,
        );

        return result;
      } catch (error) {
        const errorMessage = 'Failed to check artist availability';
        toast.error(errorMessage);
        throw error;
      }
    },
    enabled: enabled && !!params.artistId && !!params.startDate && !!params.endDate,
  });
}

/**
 * Hook for marking an appointment as completed
 */
export function useCompleteAppointment() {
  const update = useUpdateAppointment();

  return {
    mutate: (id: string | number) => {
      update.mutate(
        {
          id,
          data: { status: 'completed' },
        },
        {
          onSuccess: () => {
            // Toast messages will be handled by the base hook
          },
        },
      );
    },
    isPending: update.isPending,
    isError: update.isError,
    isSuccess: update.isSuccess,
    error: update.error,
  };
}

/**
 * Hook for marking an appointment as cancelled
 */
export function useCancelAppointment() {
  const update = useUpdateAppointment();

  return {
    mutate: (id: string | number) => {
      update.mutate(
        {
          id,
          data: { status: 'cancelled' },
        },
        {
          onSuccess: () => {
            // Toast messages will be handled by the base hook
          },
        },
      );
    },
    isPending: update.isPending,
    isError: update.isError,
    isSuccess: update.isSuccess,
    error: update.error,
  };
}

/**
 * Hook for marking an appointment as a no-show
 */
export function useMarkNoShow() {
  const update = useUpdateAppointment();

  return {
    mutate: (id: string | number) => {
      update.mutate(
        {
          id,
          data: { status: 'no_show' },
        },
        {
          onSuccess: () => {
            // Toast messages will be handled by the base hook
          },
        },
      );
    },
    isPending: update.isPending,
    isError: update.isError,
    isSuccess: update.isSuccess,
    error: update.error,
  };
}

/**
 * Export standardized keys as well
 */
export { standardAppointmentKeys as appointmentQueryKeys };
