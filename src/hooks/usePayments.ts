/**
 * Payment Hooks
 * 
 * This file provides hooks for interacting with payment functionality.
 * It leverages tRPC for type-safe API communication and React Query
 * for caching, invalidation, and loading states.
 */

import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentIntentRequest } from '@/types/api-types';

/**
 * Hook for creating payment intents
 * @returns Mutation for creating payment intents
 */
export function useCreatePaymentIntent() {
  const toast = useToast();
  const { toast } = useToast();
  
  return trpc.payment.createPaymentIntent.useMutation({
    onError: (error) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create payment intent',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook for getting payment status
 * @param paymentIntentId - The ID of the payment intent to check
 * @param options - Additional options for the query
 * @returns Query for the payment status
 */
export function usePaymentStatus(paymentIntentId: string | undefined, options?: { 
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return trpc.payment.getPaymentStatus.useQuery(
    { paymentIntentId: paymentIntentId || '' },
    {
      // Only run if we have a payment intent ID
      enabled: !!paymentIntentId && (options?.enabled !== false),
      // Default to no refetching, but allow override
      refetchInterval: options?.refetchInterval || false,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook for admin to get all payments
 * @param params - Parameters for filtering and pagination
 * @returns Query for payments list
 */
export function useAdminPayments(params?: {
  limit?: number;
  cursor?: string;
  status?: string;
  customerId?: string;
  enabled?: boolean;
}) {
  return trpc.payment.adminGetPayments.useQuery(
    {
      limit: params?.limit || 10,
      cursor: params?.cursor,
      status: params?.status,
      customerId: params?.customerId,
    },
    {
      enabled: params?.enabled !== false,
      // Keep relatively fresh, but don't spam the server
      staleTime: 1000 * 60, // 1 minute
    }
  );
}

/**
 * Hook for admin to create manual payments
 * @returns Mutation for creating manual payments
 */
export function useAdminCreatePayment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return trpc.payment.adminCreatePayment.useMutation({
    onSuccess: () => {
      toast({
        title: 'Payment Created',
        description: 'Manual payment was created successfully',
      });
      
      // Invalidate queries that might be affected
      queryClient.invalidateQueries({
        queryKey: [['payment', 'adminGetPayments']],
      });
    },
    onError: (error) => {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to create manual payment',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Helper function to format payment amount from cents to dollars
 * @param amount - Amount in cents
 * @returns Formatted amount as currency string
 */
export function formatPaymentAmount(amount: number | undefined): string {
  if (amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

/**
 * Helper function to get human-readable payment status
 * @param status - Payment status from Stripe
 * @returns Human-readable status
 */
export function getPaymentStatusLabel(status: string | undefined): string {
  if (!status) return 'Unknown';
  
  const statusMap: Record<string, string> = {
    'succeeded': 'Paid',
    'processing': 'Processing',
    'requires_payment_method': 'Requires Payment',
    'requires_confirmation': 'Requires Confirmation',
    'requires_action': 'Requires Action',
    'canceled': 'Canceled',
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

/**
 * Helper function to get color for payment status
 * @param status - Payment status from Stripe
 * @returns Color class for the status
 */
export function getPaymentStatusColor(status: string | undefined): string {
  if (!status) return 'bg-gray-200';
  
  const colorMap: Record<string, string> = {
    'succeeded': 'bg-green-100 text-green-800',
    'processing': 'bg-blue-100 text-blue-800',
    'requires_payment_method': 'bg-yellow-100 text-yellow-800',
    'requires_confirmation': 'bg-yellow-100 text-yellow-800',
    'requires_action': 'bg-orange-100 text-orange-800',
    'canceled': 'bg-red-100 text-red-800',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}