/**
 * general-types.ts
 *
 * General type definitions extracted from components
 */
import { z } from 'zod';
import type { AxiosRequestConfig } from 'axios';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

// From carousel.tsx
export type CarouselApi = UseEmblaCarouselType[1];
export type ApiGetFn = <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
export type ApiPostFn = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
export type ApiPutFn = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
export type ApiPatchFn = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => Promise<T>;
export type ApiDeleteFn = <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;

/**
 * general-types.ts
 *
 * General type definitions extracted from components
 */

export const uuidParamSchema = z.object({
  uuid: z.string().uuid(),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

// From ToolpadComponents.tsx
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

// From useUIStore.ts
export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toasts: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;
}

/**
 * general-types.ts
 *
 * General type definitions extracted from components
 */

// From index.ts
export type ServerClientType = 'browser' | 'server' | 'admin';

// From index-client.ts
export type ClientType = 'browser';

// From page.tsx
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}

// From useClients.ts
export interface Client {
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
