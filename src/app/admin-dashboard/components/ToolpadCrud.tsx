'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { FormData, ToolpadCrudProps } from '@/types/crm/admin-types';

export default function ToolpadCrud<T extends { id: string | number }>({
  resourceName,
  apiEndpoint,
  columns,
  formFields,
  defaultValues,
  title,
}: ToolpadCrudProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: defaultValues as FormData,
  });

  // Load data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${resourceName}`);
      }
      const data = await response.json();
      setRows(data);
      setError(null);
    } catch (err) {
      setError(
        `Error loading ${resourceName}: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint, resourceName]);

  // Handle dialog open/close
  const handleOpenDialog = (item?: T) => {
    if (item) {
      setCurrentItem(item);
      reset(item as FormData);
      setEditMode(true);
    } else {
      setCurrentItem(null);
      reset(defaultValues as FormData);
      setEditMode(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // CRUD operations
  const handleCreate = async (data: FormData) => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${resourceName}`);
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(
        `Error creating ${resourceName}: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(err);
    }
  };

  const handleUpdate = async (data: FormData) => {
    if (!currentItem) return;

    try {
      const response = await fetch(`${apiEndpoint}/${currentItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${resourceName}`);
      }

      await fetchData();
      handleCloseDialog();
    } catch (err) {
      setError(
        `Error updating ${resourceName}: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(err);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Are you sure you want to delete this ${resourceName}?`)) return;

    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${resourceName}`);
      }

      await fetchData();
    } catch (err) {
      setError(
        `Error deleting ${resourceName}: ${err instanceof Error ? err.message : String(err)}`
      );
      console.error(err);
    }
  };

  // Add action column to our columns
  const actionColumn: GridColDef = {
    field: 'actions',
    headerName: 'Actions',
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: params => (
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleOpenDialog(params.row as T)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      </Stack>
    ),
  };

  const allColumns = [...columns, actionColumn];

  // Form submission handler
  const onSubmit = (data: FormData) => {
    if (editMode) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && rows.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={fetchData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add {resourceName}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <DataGrid
        rows={rows}
        columns={allColumns}
        autoHeight
        pageSizeOptions={[5, 10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        disableRowSelectionOnClick
      />

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editMode ? `Edit ${resourceName}` : `Create new ${resourceName}`}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {formFields.map(field => (
                <Controller
                  key={String(field.name)}
                  name={String(field.name)}
                  control={control}
                  rules={{ required: field.required ? `${field.label} is required` : false }}
                  render={({ field: { onChange, value, ref } }) => (
                    <TextField
                      fullWidth
                      inputRef={ref}
                      label={field.label}
                      type={field.type}
                      value={value || ''}
                      onChange={onChange}
                      error={Boolean(errors[String(field.name)])}
                      helperText={errors[String(field.name)]?.message as string}
                    />
                  )}
                />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
