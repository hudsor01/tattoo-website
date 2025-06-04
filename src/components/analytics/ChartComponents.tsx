'use client';

import React from 'react';
import type { ChartTooltipProps } from '@prisma/client';

export function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="font-medium text-white text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-gray-300">
              {entry.dataKey === 'revenue' ? '$' : ''}{entry.value.toLocaleString()}
              {entry.dataKey === 'revenue' ? ' Revenue' : 
               entry.dataKey === 'appointments' ? ' appointments' : ' Customers'}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function CustomLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#dc2626]" />
        <span className="text-xs text-gray-400">Visitors</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-purple-500" />
        <span className="text-xs text-gray-400">appointments</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs text-gray-400">Revenue</span>
      </div>
    </div>
  );
}