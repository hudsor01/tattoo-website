'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/styling';
import type { StatusBadgeProps, StatusType } from '@/types/component-types';

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const getVariantClass = (status: StatusType) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium px-2.5 py-0.5',
        getVariantClass(status)
      )}
    >
      {text}
    </Badge>
  );
}