'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MetricCardSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-700 shadow-md">
      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1 w-3/4">
          <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
          <div className="h-7 bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-700 h-10 w-10 animate-pulse"></div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-700 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="h-6 bg-gray-700 rounded w-40 animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-60 mt-2 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-8 animate-pulse"></div>
          <div className="h-8 bg-gray-700 rounded w-8 animate-pulse"></div>
        </div>
      </div>
      
      <div className="h-80 bg-gray-700/30 rounded-lg animate-pulse flex items-center justify-center">
        <svg 
          className="w-12 h-12 text-gray-600 animate-spin" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50">
      <div className="w-full sm:w-1/2">
        <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>
      <div className="flex items-center gap-4 mt-3 sm:mt-0">
        <div className="text-center">
          <div className="h-6 bg-gray-700 rounded w-16 animate-pulse mx-auto"></div>
          <div className="h-3 bg-gray-700 rounded w-14 mt-1 animate-pulse mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-gray-700 rounded w-16 animate-pulse mx-auto"></div>
          <div className="h-3 bg-gray-700 rounded w-14 mt-1 animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  );
}