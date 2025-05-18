'use client';

import React from 'react';
import { AdminStatProps } from '@/types/Components';

export default function AdminStat({ value, label, color = '#fff' }: AdminStatProps) {
  return (
    <Card
      sx={{
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: color,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
