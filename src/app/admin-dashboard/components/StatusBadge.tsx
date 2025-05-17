'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { StatusBadgeProps } from '@/types/Components';

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const colors = {
    success: {
      bgcolor: 'rgba(0, 128, 0, 0.2)',
      color: '#4caf50',
      borderColor: 'rgba(0, 128, 0, 0.5)',
    },
    warning: {
      bgcolor: 'rgba(255, 193, 7, 0.2)',
      color: '#ffeb3b',
      borderColor: 'rgba(255, 193, 7, 0.5)',
    },
    error: {
      bgcolor: 'rgba(178, 34, 34, 0.2)',
      color: '#f44336',
      borderColor: 'rgba(178, 34, 34, 0.5)',
    },
    info: {
      bgcolor: 'rgba(3, 169, 244, 0.2)',
      color: '#03a9f4',
      borderColor: 'rgba(3, 169, 244, 0.5)',
    },
  };

  return (
    <Chip
      label={text}
      size="small"
      sx={{
        bgcolor: colors[status].bgcolor,
        color: colors[status].color,
        border: 1,
        borderColor: colors[status].borderColor,
        fontSize: '0.75rem',
        fontWeight: 'medium',
        borderRadius: '16px',
        height: '24px',
      }}
    />
  );
}
