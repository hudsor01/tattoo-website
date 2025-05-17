/**
 * base-types.ts
 *
 * Most primitive type definitions shared across the application.
 */

// Common primitive types
export type ID = string | number;
export type DateString = string;
export type OptionalString = string | null | undefined;
export type OptionalNumber = number | null | undefined;
export type OptionalBoolean = boolean | null | undefined;
export type OptionalArray<T> = T[] | null | undefined;
export type OptionalRecord<K extends string | number | symbol, V> = Record<K, V> | null | undefined;

// Common metadata interface used across entities
export interface Metadata {
  createdAt: DateString;
  updatedAt: DateString;
  [key: string]: unknown;
}

// Core entity base interface (used for inheritance)
export interface BaseEntity {
  id: ID;
  createdAt?: DateString;
  updatedAt?: DateString;
}

// For general record objects with string keys
export type RecordObject = Record<string, unknown>;

// For component props with unknown structure
export type ComponentProps = Record<string, unknown>;

// For objects with numeric keys
export type NumericKeyObject = Record<number, unknown>;

// For generic configuration objects
export type ConfigObject = Record<string, unknown>;

/**
 * API response envelope
 *
 * This is the standard response format for all API endpoints.
 * It includes fields for both error and success responses.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: { path: string; message: string }[];
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

// For filter/query objects
export type FilterOptions = Record<string, string | number | boolean | null | undefined>;

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

// File/Media types
export interface FileData {
  id?: ID;
  name?: string;
  url?: string;
  path?: string;
  size?: number;
  type?: string;
  rawFile?: File;
  title?: string;
  description?: string;
  createdAt?: DateString;
  updatedAt?: DateString;
}

// Common form submission states
export interface FormState {
  isSubmitting: boolean;
  isError: boolean;
  isSuccess: boolean;
  message?: string;
}

export interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  showLogo?: boolean;
  customClassName?: string;
}
