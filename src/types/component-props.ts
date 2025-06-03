/**
 * Component prop types
 * Only props for components that can't use inline definitions
 * Database entities should come from @prisma/client
 */

import type { LucideIcon } from 'lucide-react';

// Reusable base props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Auth related props
export interface AuthContextType {
  user: any; // Use User from @prisma/client when importing
  session: any; // Use Session from @prisma/client when importing
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

// Table/DataGrid props
export interface DataTableColumn<T = any> {
  id: string;
  accessorKey?: string;
  header: string | (() => React.ReactNode);
  cell?: (props: { row: { original: T }; getValue: () => unknown }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export interface DataTableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

// Chart props
export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color?: string;
  }>;
  label?: string;
}

// Service/Gallery types (not database models, but display types)
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category?: string;
  width?: number;
  height?: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  icon: LucideIcon;
  color: string;
  features: string[];
  process: string[];
  featured?: boolean;
}
