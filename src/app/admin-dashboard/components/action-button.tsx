'use client';

import React from 'react';
import { Button } from '@mui/material';
import { ActionButtonProps } from '@/types/Components';

export default function ActionButton({
  variant,
  disabled = false,
  children,
  onClick,
}: ActionButtonProps) {
  const buttonVariants = {
    primary: {
      bgcolor: '#E53935', // tattoo-red
      color: '#ffffff',
      '&:hover': {
        bgcolor: 'rgba(229, 57, 53, 0.9)',
      },
    },
    secondary: {
      bgcolor: '#0A0A0A', // tattoo-black
      color: '#ffffff',
      '&:hover': {
        bgcolor: 'rgba(10, 10, 10, 0.8)',
      },
    },
    danger: {
      bgcolor: '#d32f2f', // red-700
      color: '#ffffff',
      '&:hover': {
        bgcolor: 'rgba(211, 47, 47, 0.9)',
      },
    },
    success: {
      bgcolor: '#388e3c', // green-700
      color: '#ffffff',
      '&:hover': {
        bgcolor: 'rgba(56, 142, 60, 0.9)',
      },
    },
  };
  function onClickAction(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    if (typeof onClick === 'function') {
      onClick(event);
    }
  }
  return (
    <Button
      variant="contained"
      onClick={onClickAction}
      disabled={disabled}
      size="small"
      sx={{
        ...buttonVariants[variant],
        borderRadius: '4px',
        textTransform: 'none',
        fontSize: '0.8rem',
        py: 0.5,
        px: 1.5,
        minWidth: '60px',
      }}
    >
      {children}
    </Button>
  );
}