'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Stack,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { GridRowParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ChipColorType } from '@/types/mui-types';
import type { MuiSxProps } from '@/types/mui-types';
import type { GridActionConfig, EnhancedMUIDataGridProps, ActionButtonsProps } from '@/types/ui/data-grid-types';


export const StatusChip = ({ status }: { status: string }) => {
  // Map status to color
  let color: ChipColorType = 'default';
  if (['active', 'completed', 'confirmed', 'paid'].includes(status.toLowerCase())) {
    color = 'success';
  } else if (
    ['pending', 'inprogress', 'scheduled'].includes(status.toLowerCase().replace('-', ''))
  ) {
    color = 'primary';
  } else if (
    ['cancelled', 'failed', 'rejected', 'noshow'].includes(status.toLowerCase().replace('-', ''))
  ) {
    color = 'error';
  } else if (['draft'].includes(status.toLowerCase())) {
    color = 'secondary';
  }

  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
      color={color}
      size="small"
      sx={{
        fontWeight: 'medium',
        minWidth: 70,
        textTransform: 'capitalize',
      }}
    />
  );
};

export const ActionButtons = ({
  id,
  onView,
  onEdit,
  onDelete,
  customActions,
}: ActionButtonsProps) => {
  return (
    <Stack direction="row" spacing={1}>
      {onView && (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => onView(id)}
            sx={{
              color: 'primary.main',
              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={() => onEdit(id)}
            sx={{
              color: 'info.main',
              bgcolor: theme => alpha(theme.palette.info.main, 0.1),
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {customActions}

      {onDelete && (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(id)}
            sx={{
              color: 'error.main',
              bgcolor: theme => alpha(theme.palette.error.main, 0.1),
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};


export function DataTable<T extends { id: string | number }>({
  rows = [],
  columns = [],
  title,
  loading = false,
  onRowClick,
  onAdd,
  onRefresh,
  actions,
  pageSize = 10,
  disableTools = false,
  autoHeight = false,
  containerSx = {},
  gridSx = {},
}: EnhancedMUIDataGridProps<T>) {
  const [paginationModel, setPaginationModel] = useState({
    pageSize,
    page: 0,
  });

  const enhancedColumns = [...columns];

  // Add action column if provided
  if (actions) {
    enhancedColumns.push({
      field: 'actions',
      headerName: 'Actions',
      width: actions.width || 150,
      sortable: false,
      filterable: false,
      renderCell: params => {
        const actionButtonProps: React.ComponentProps<typeof ActionButtons> = {
          id: params.row.id as string,
          ...(actions.onView ? { onView: actions.onView } : {}),
          ...(actions.onEdit ? { onEdit: actions.onEdit } : {}),
          ...(actions.onDelete ? { onDelete: actions.onDelete } : {}),
          ...(actions.customActions ? { customActions: actions.customActions(params.row.id) } : {}),
        };
        return <ActionButtons {...actionButtonProps} />;
      },
    });
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: theme => theme.palette.divider,
        borderRadius: 1,
        bgcolor: 'background.paper',
        ...containerSx,
      }}
    >
      {(title || onAdd || onRefresh) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {title && (
            <Typography variant="h6" fontWeight="medium">
              {title}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRefresh && (
              <Tooltip title="Refresh data">
                <IconButton onClick={onRefresh} size="small" sx={{ color: 'action.active' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}

            {onAdd && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd} size="small">
                Add New
              </Button>
            )}
          </Box>
        </Box>
      )}

      <DataGrid
        rows={rows}
        columns={enhancedColumns}
        loading={loading}
        autoHeight={autoHeight}
        disableRowSelectionOnClick={!!onRowClick}
        {...(onRowClick ? { onRowClick } : {})}
        slots={disableTools ? {} : { toolbar: GridToolbar }}
        initialState={{
          pagination: {
            paginationModel: { pageSize, page: 0 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        checkboxSelection={false}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
            borderBottom: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
          },
          ...gridSx,
        }}
      />
    </Paper>
  );
}

export default DataTable;