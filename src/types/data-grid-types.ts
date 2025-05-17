import { ReactNode } from 'react';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { SxProps, Theme } from '@mui/material';

/**
 * MUI styling props type
 */
export type MuiSxProps = SxProps<Theme>;

/**
 * Action buttons props for data tables
 */
export interface ActionButtonsProps {
  id: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  customActions?: React.ReactNode;
}

/**
 * Grid action configuration
 */
export type GridActionConfig = {
  width?: number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  customActions?: (id: string) => React.ReactNode;
};

/**
 * Enhanced MUI DataGrid props
 */
export interface EnhancedMUIDataGridProps<T extends { id: string | number }> {
  rows?: T[];
  columns?: GridColDef[];
  title?: string;
  loading?: boolean;
  onRowClick?: (params: GridRowParams) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  actions?: GridActionConfig;
  pageSize?: number;
  disableTools?: boolean;
  autoHeight?: boolean;
  containerSx?: MuiSxProps;
  gridSx?: MuiSxProps;
}
