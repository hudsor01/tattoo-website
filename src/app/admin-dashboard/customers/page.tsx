'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AdminCustomersPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>
      <Typography variant="body1">
        This page is under construction. Customer management functionality will be implemented here.
        Refer to the main `/admin/customers` route for the current implementation.
      </Typography>
    </Box>
  );
}
