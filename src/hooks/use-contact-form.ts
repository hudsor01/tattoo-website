/**
 * Contact form hooks
 * 
 * This file provides hooks for contact form submission and admin dashboard display.
 */

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

/**
 * Hook for submitting contact form data
 */
export const useContactForm = () => {
  const submitContactMutation = trpc.user.submitContact.useMutation();
  
  const submitContactForm = useCallback(
    (contactData: {
      name: string;
      email: string;
      phone?: string;
      message: string;
    }) => {
      try {
        return submitContactMutation.mutate(contactData);
      } catch (error) {
        console.error('Error submitting contact form:', error);
        throw error;
      }
    },
    [submitContactMutation],
  );

  return {
    submitContactForm,
    isSubmitting: submitContactMutation.isPending,
    isSuccess: submitContactMutation.isSuccess,
    isError: submitContactMutation.isError,
    error: submitContactMutation.error,
  };
};

/**
 * Hook for fetching contact form submissions for admin dashboard
 */
export const useAdminContactSubmissions = () => {
  const { data, isLoading, error, refetch } = trpc.dashboard.getRecentContacts.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return {
    submissions: data || [],
    isLoading,
    error,
    refetchSubmissions: refetch,
  };
};