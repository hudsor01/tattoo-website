/**
 * hook-types.ts
 *
 * Type definitions for React hooks and state management.
 */

import type { Dispatch, SetStateAction } from 'react';

/**
 * Supabase Realtime types for useRealtime hook
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export type FilterValue = string | number | boolean | null | string[] | number[];

export type RealtimeFilter = {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: FilterValue;
};

export interface RealtimeSubscriptionOptions {
  table: string;
  schema?: string;
  event?: RealtimeEventType | RealtimeEventType[];
  filter?: RealtimeFilter | RealtimeFilter[];
  throttle?: number; // Throttle update frequency in ms
}

export interface PostgresChangesConfig {
  event: RealtimeEventType;
  schema: string;
  table: string;
  filter?: string;
}

export interface UseRealtimeResult<T = Record<string, unknown>> {
  data: T[];
  error: Error | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Generic hook state result
 */
export interface UseState<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
}

/**
 * Async data hook result
 */
export interface UseAsyncData<T = unknown, E = Error> {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Form hook result
 */
export interface UseForm<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (name: keyof T, value: unknown) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setFieldTouched: (name: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  submitForm: () => Promise<void>;
}

/**
 * Pagination hook result
 */
export interface UsePagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  pageItems: <T>(items: T[]) => T[];
}

/**
 * Authentication hook result
 */
export interface UseAuth<U = Record<string, unknown>> {
  user: U | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, password: string) => Promise<boolean>;
  error: string | null;
}

/**
 * File upload hook result
 */
export interface UseFileUpload {
  files: File[];
  fileUrls: string[];
  isUploading: boolean;
  isSuccess: boolean;
  progress: number;
  error: Error | null;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  uploadFiles: () => Promise<string[]>;
  resetFiles: () => void;
}

/**
 * Local storage hook result
 */
export interface UseLocalStorage<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

/**
 * Modal/Dialog hook result
 */
export interface UseModal {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Debounce hook result
 */
export interface UseDebounce<T> {
  value: T;
  debouncedValue: T;
  setValue: Dispatch<SetStateAction<T>>;
  isPending: boolean;
}

/**
 * Infinite scroll hook result
 */
export interface UseInfiniteScroll<T = unknown> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

/**
 * Search hook result
 */
export interface UseSearch<T = unknown> {
  query: string;
  results: T[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<T[]>;
}

/**
 * Supabase upload hook params
 */
export interface SupabaseUploadParams {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

/**
 * Supabase upload hook result
 */
export interface UseSupabaseUpload {
  files: File[];
  isUploading: boolean;
  isSuccess: boolean;
  progress: number;
  error: Error | null;
  bucketName: string;
  path?: string;
  setFiles: (files: File[]) => void;
  onUpload: () => Promise<string[]>;
  removeFile: (index: number) => void;
  reset: () => void;
}
