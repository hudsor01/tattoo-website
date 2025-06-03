/**
 * Data Table Types
 * Types for the admin data table component
 */

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';

// Generic record object type
export type RecordObject = Record<string, any>;

// Admin data table column definition
export interface AdminDataTableColumn<T extends RecordObject> {
  id: string;
  accessorKey?: keyof T | string;
  header: string | ((props: any) => ReactNode);
  cell?: (props: { getValue: () => any; row: { original: T } }) => ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  meta?: {
    className?: string;
  };
}

// Admin data table action
export interface AdminDataTableAction<T extends RecordObject> {
  label: string;
  onClick: (row: T) => void;
  icon?: ReactNode;
}

// Data table props
export interface DataTableProps<T extends RecordObject> {
  data: T[];
  columns: AdminDataTableColumn<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  actions?: AdminDataTableAction<T>[];
  enableRowSelection?: boolean;
  enableSearch?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  className?: string;
}
