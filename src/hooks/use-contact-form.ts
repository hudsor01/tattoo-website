'use client';

declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: unknown;
      }
    ) => void;
  }
}

import { useState, useCallback, useRef, useEffect } from 'react';

import { logger } from "@/lib/logger";
function useRealtime<T = unknown>(
  channel: string,
  options: {
    enabled?: boolean;
    endpoint?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const {
    enabled = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const subscribe = useCallback(() => {
    if (typeof window === 'undefined' || !enabled || eventSourceRef.current) return false;

    try {
      setIsConnected(true);
      onConnect?.();
      return true;
    } catch (error) {
      void logger.error('Failed to establish real-time connection:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to connect'));
      return false;
    }
  }, [enabled, onConnect, onError]);

  const unsubscribe = useCallback(() => {
    if (!eventSourceRef.current) return;
    
    eventSourceRef.current.close();
    eventSourceRef.current = null;
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const sendData = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    isConnected,
    data,
    subscribe,
    unsubscribe,
    sendData,
  };
}

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  contactId?: number;
  phone?: string;
  service?: string;
  referralSource?: string;
  preferredTime?: string;
  budget?: string;
  hasReference?: boolean;
  preferredContactMethod?: 'email' | 'phone' | 'either';
  agreeToTerms?: boolean;
};

type SubmissionState = {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  lastSubmissionId?: string;
};

export function useContactForm() {
  const [state, setState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const isMounted = useRef(true);
  const analyticsCompleted = useRef(false);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const submitContactForm = useCallback(
    async (contactData: ContactFormData): Promise<{ success: boolean; submissionId?: string }> => {
      if (!contactData.name || !contactData.email || !contactData.message) {
        const error = new Error('Please fill out all required fields');
        setState((prev) => ({ ...prev, isError: true, error }));
        return { success: false };
      }

      try {
        setState((prev) => ({ ...prev, isSubmitting: true, isError: false, error: null }));
        
        if (typeof window !== 'undefined') {
          try {
            if (!analyticsCompleted.current) {
              analyticsCompleted.current = true;
              
              if (window.gtag) {
                window.gtag('event', 'form_submission', {
                  event_category: 'contact',
                  event_label: contactData.subject || 'Contact Form',
                });
              }
            }
          } catch (analyticsError) {
            void logger.error('Analytics error:', analyticsError);
          }
        }

        if (isMounted.current) {
          setState({
            isSubmitting: false,
            isSuccess: true,
            isError: false,
            error: null,
            lastSubmissionId: 'server-action-handled',
          });
        }

        return { 
          success: true,
          submissionId: 'server-action-handled'
        };
      } catch (error) {
        void logger.error('Error in contact form submission:', error);
        
        if (isMounted.current) {
          setState({
            isSubmitting: false,
            isSuccess: false,
            isError: true,
            error: error instanceof Error ? error : new Error('Unknown error occurred'),
          });
        }

        return { success: false };
      }
    },
    []
  );

  return {
    ...state,
    submitContactForm,
  };
}

type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export function useAdminContactSubmissions(limit = 10) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const currentPage = useRef(1);

  const fetchSubmissions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/contacts?limit=${limit}&page=${page}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching contacts: ${response.status}`);
      }

      const data = await response.json();
      
      setSubmissions(prev => page === 1 ? data.contacts : [...prev, ...data.contacts]);
      setUnreadCount(data.unreadCount ?? 0);
      setHasNextPage(data.hasNextPage ?? false);
      currentPage.current = page;
      
      return data;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch contacts');
      void logger.error('Error fetching contact submissions:', fetchError);
      setError(fetchError);
      return null;
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchSubmissions(1);
  }, [fetchSubmissions]);

  const refetchSubmissions = useCallback(async () => {
    return fetchSubmissions(1);
  }, [fetchSubmissions]);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      return fetchSubmissions(currentPage.current + 1);
    }
    return null;
  }, [fetchSubmissions, hasNextPage, isFetchingNextPage]);

  const deleteSubmission = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting contact: ${response.status}`);
      }

      setSubmissions(prev => prev.filter(sub => sub.id !== id));
      
      return true;
    } catch (err) {
      void logger.error('Error deleting contact submission:', err);
      return false;
    }
  }, []);

  return {
    submissions,
    isLoading,
    error,
    refetchSubmissions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    deleteSubmission,
    unreadCount,
  };
}

export function useContactFormMetrics() {
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    submissionsThisWeek: 0,
    submissionsThisMonth: 0,
    averageResponseTime: 0,
    responseRate: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const lastFetchTime = useRef<number | null>(null);
  
  const fetchMetrics = useCallback(async (force = false) => {
    const now = Date.now();
    const cacheDuration = 5 * 60 * 1000;
    if (
      !force && 
      lastFetchTime.current && 
      now - lastFetchTime.current < cacheDuration
    ) {
      return metrics;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/contacts/stats');
      
      if (!response.ok) {
        throw new Error(`Error fetching metrics: ${response.status}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      lastFetchTime.current = now;
      
      return data;
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch metrics');
      void logger.error('Error fetching contact metrics:', fetchError);
      setError(fetchError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [metrics]);
  
  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);
  
  const refreshMetrics = useCallback(() => {
    return fetchMetrics(true);
  }, [fetchMetrics]);
  
  return {
    metrics,
    isLoading,
    error,
    refreshMetrics,
  };
}

export function useContactFormRealtime() {
  type Submission = ContactSubmission;
  
  const { 
    isConnected,
    subscribe,
    unsubscribe,
    data: realtimeData
  } = useRealtime<Submission[]>('contact-submissions');

  const [newSubmissions, setNewSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    subscribe();
    
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    if (realtimeData) {
      setNewSubmissions(realtimeData);
    }
  }, [realtimeData]);

  const markAsRead = useCallback(async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${submissionId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`Error marking as read: ${response.status}`);
      }
      
      setNewSubmissions(prev => 
        prev.filter(sub => sub.id !== Number(submissionId))
      );
      
      return true;
    } catch (error) {
      void logger.error('Error marking submission as read:', error);
      return false;
    }
  }, []);

  return {
    isConnected,
    newSubmissions,
    markAsRead,
  };
}
