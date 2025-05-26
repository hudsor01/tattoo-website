/**
 * utility-types.ts
 *
 * Consolidated utility types including general utilities, hooks, caching,
 * state management, and workflows.
 */

import { z } from 'zod';
import type { Dispatch, SetStateAction } from 'react';

/**
 * ========================================================================
 * PRIMITIVE TYPES
 * ========================================================================
 */

// Common primitive types
export type ID = string | number;
export type DateString = string;
export type OptionalString = string | null;
export type OptionalNumber = number | null;
export type OptionalBoolean = boolean | null;
export type OptionalArray<T> = T[] | null;
export type OptionalRecord<K extends string | number | symbol, V> = Record<K, V> | null;

// For general record objects with string keys
export type RecordObject = Record<string, unknown>;

// For component props with unknown structure
export type ComponentProps = Record<string, unknown>;

// For objects with numeric keys
export type NumericKeyObject = Record<number, unknown>;

// For generic configuration objects
export type ConfigObject = Record<string, unknown>;

// For filter/query objects
export type FilterOptions = Record<string, string | number | boolean | null>;

// For event handlers
export type EventHandler<T = Element> = React.EventHandler<React.SyntheticEvent<T>>;

// For function parameters that can be of any type
export type AnyParams = unknown[];

// For data transformers
export type DataTransformer<T = unknown, R = unknown> = (data: T) => R;

// For React setters from useState
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

// For API handlers
export type ApiHandler<T = unknown, R = unknown> = (data: T) => Promise<R>;

/**
 * ========================================================================
 * GENERAL UTILITY TYPES
 * ========================================================================
 */

// UUID validation schema
export const uuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

// Data grid column interface
export interface Column {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  valueGetter?: (params: unknown) => unknown;
  valueFormatter?: (params: unknown) => string;
  renderCell?: (params: unknown) => React.ReactNode;
  sortable?: boolean;
}

// Server/client type enumeration
export type ServerClientType = 'browser' | 'server' | 'admin';
export type ClientType = 'browser';

// Client interface (duplicated from general-types)
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}

// Alternative client interface (from useClients)
export interface ClientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

/**
 * ========================================================================
 * TYPE UTILITIES
 * ========================================================================
 */

/**
 * Makes all properties in T optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties in T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Makes all properties in T readonly
 */
export type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends object ? Immutable<T[P]> : T[P];
};

/**
 * Extracts keys of T where the value is of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Pick properties of T that are of type U
 */
export type PickByType<T, U> = {
  [P in KeysOfType<T, U>]: T[P];
};

/**
 * Omit properties of T that are of type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Makes specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extracts non-function properties from T
 */
export type DataProps<T> = OmitByType<T, (...args: unknown[]) => unknown>;

/**
 * Extracts function properties from T (methods)
 */
export type MethodProps<T> = PickByType<T, (...args: unknown[]) => unknown>;

/**
 * Converts a union type to an intersection type
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Defines props for a component that expects children
 */
export type WithChildren<P = Record<string, unknown>> = P & { children?: React.ReactNode };

/**
 * Makes specified properties in T non-nullable
 */
export type NonNullableProps<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? NonNullable<T[P]> : T[P];
};

/**
 * Makes all properties in T non-nullable
 */
export type NonNullableAll<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys of T that are optional
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Extract keys of T that are required
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, unknown> extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Convert array type to its element type
 */
export type ElementType<T extends ReadonlyArray<unknown>> =
  T extends ReadonlyArray<infer E> ? E : never;

/**
 * Create a type with a subset of properties in T that match predicate P
 */
export type FilterProps<T, P> = Pick<T, { [K in keyof T]: P extends T[K] ? K : never }[keyof T]>;

/**
 * Create a discriminated union from a type and property name
 */
export type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends { [key in K]: V }
  ? T
  : never;

/**
 * ========================================================================
 * HOOK TYPES
 * ========================================================================
 */

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
 * ========================================================================
 * CACHE TYPES
 * ========================================================================
 */

/**
 * Configuration options for the EnhancedCache
 */
export interface CacheConfig {
  /** Maximum number of items to store in the cache (default: 1000) */
  maxSize: number;
  /** Default TTL in seconds (default: 5 minutes) */
  defaultTtl: number;
  /** How often to clean up expired entries in ms (default: 60 seconds) */
  cleanupInterval: number;
  /** Whether to enable cache statistics (default: true) */
  enableStats: boolean;
}

/**
 * Entry in the cache
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Expiration timestamp in ms since epoch */
  expires: number;
  /** Last accessed timestamp for LRU tracking */
  lastAccessed: number;
  /** Size estimation in bytes (approximate) */
  size: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of items currently in the cache */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Cache hit rate percentage */
  hitRate: number;
  /** Number of evictions due to size limit */
  evictions: number;
  /** Number of expired entries cleared */
  expired: number;
  /** Total size of cached data in bytes */
  totalSize: number;
}

/**
 * Options for cache operations
 */
export interface CacheOptions {
  /** TTL in seconds for this specific entry */
  ttl?: number;
  /** Priority level for eviction (higher = less likely to evict) */
  priority?: number;
  /** Tags to associate with the entry for bulk operations */
  tags?: string[];
}

/**
 * ========================================================================
 * STORE TYPES (State Management)
 * ========================================================================
 */

/**
 * UI state interface
 */
export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toasts: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * App global state interface
 */
export interface AppState {
  initialized: boolean;
  currentRoute: string | null;
  pageTitle: string;
  permissions: Record<string, boolean>;
  activeModal: string | null;
  loading: {
    global: boolean;
    routes: Record<string, boolean>;
    actions: Record<string, boolean>;
  };
  errors: {
    global: Error | null;
    form: Record<string, string>;
  };

  // Actions
  initialize: () => Promise<void>;
  setRoute: (route: string) => void;
  setPageTitle: (title: string) => void;
  setPermissions: (permissions: Record<string, boolean>) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | Error | null) => void;
  clearErrors: () => void;
}

/**
 * ========================================================================
 * WORKFLOW TYPES
 * ========================================================================
 */

// Trigger types that can initiate a workflow
export type TriggerType =
  | 'appointment'
  | 'appointment_status_change'
  | 'client_created'
  | 'client_updated'
  | 'payment_received'
  | 'custom_date'
  | 'manual';

// Condition types for triggers
export type TriggerCondition =
  | 'before'
  | 'after'
  | 'equals'
  | 'new_record'
  | 'updated'
  | 'specific';

// Action types that can be performed
export type ActionType = 'email' | 'sms' | 'notification' | 'webhook';

// Timeframe for triggers
export interface Timeframe {
  minutes?: number;
  hours?: number;
  days?: number;
  after?: boolean;
}

// Trigger configuration
export interface TriggerConfig {
  type: TriggerType;
  condition: TriggerCondition;
  timeframe?: Timeframe;
  status?: string;
  date?: string;
}

// Action configuration
export interface ActionConfig {
  type: ActionType;
  template: string;
  data: Record<string, unknown>;
  recipient?: string;
  to?: string | ((context: Record<string, unknown>) => string);
  subject?: string | ((context: Record<string, unknown>) => string);
  delay?: number;
}

// Step in a workflow
export interface WorkflowStep {
  id: string;
  type: ActionType;
  to: string | ((context: Record<string, unknown>) => string);
  subject: string | ((context: Record<string, unknown>) => string);
  template: string;
  delay?: number;
}

// Trigger for a workflow
export interface WorkflowTrigger {
  type: TriggerType;
  condition: TriggerCondition;
  timeframe?: Timeframe;
  status?: string;
  date?: string;
}

// Complete workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  action: ActionConfig;
  isActive: boolean;
  lastRun?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Execution record of a workflow
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'failed' | 'pending';
  executedAt: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * ========================================================================
 * VALIDATION UTILITY TYPES
 * ========================================================================
 */

// Basic pagination schema for list endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type DateRangeParams = z.infer<typeof dateRangeSchema>;

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: z.array(z.string()).optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;

// Common address schema
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).max(2),
  zipCode: z.string().min(5).max(10),
  country: z.string().default('US'),
});

export type AddressInput = z.infer<typeof addressSchema>;

// Contact information schema
export const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;

// ID parameter schemas
export const uuidValidationSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export type UuidValidationParam = z.infer<typeof uuidValidationSchema>;

export const numericIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export type NumericIdParam = z.infer<typeof numericIdParamSchema>;

// Generic ID parameter schema
export const idParamSchema = z.object({
  id: z.union([z.string(), z.coerce.number()]),
});

export type IdParam = z.infer<typeof idParamSchema>;

// Response schemas
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResponseType<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// Standard response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

// Utility to help share types between frontend and backend
export type InferResponseType<T extends z.ZodType> = {
  success: boolean;
  data: z.infer<T>;
  message?: string;
};
