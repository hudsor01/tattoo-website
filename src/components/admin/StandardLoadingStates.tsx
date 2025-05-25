'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

interface LoadingCardProps {
  title?: boolean;
  rows?: number;
  className?: string;
}

interface TableLoadingProps {
  columns: number;
  rows?: number;
}

// Standard loading spinner component
export function LoadingSpinner({ 
  size = 'md', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-red-500`} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}

// Full page loading state
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Card loading skeleton
export function CardLoading({ 
  title = true, 
  rows = 3, 
  className = '' 
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {title && <Skeleton className="h-6 w-48" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => `card-skeleton-${i}`).map((key) => (
            <Skeleton key={key} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Table loading skeleton
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4">
        {Array.from({ length: columns }, (_, i) => `table-header-${i}`).map((key) => (
          <Skeleton key={key} className="h-6 flex-1" />
        ))}
      </div>
      
      {/* Rows skeleton */}
      {Array.from({ length: rows }, (_, rowIndex) => `table-row-${rowIndex}`).map((rowKey) => (
        <div key={rowKey} className="flex gap-4">
          {Array.from({ length: columns }, (_, colIndex) => `${rowKey}-col-${colIndex}`).map((cellKey) => (
            <Skeleton key={cellKey} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Button loading state
export function ButtonLoading({ 
  text = 'Loading...'
}: { 
  text?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`h-4 w-4 animate-spin`} />
      <span>{text}</span>
    </div>
  );
}

// Refresh loading state
export function RefreshLoading() {
  return (
    <RefreshCw className="h-4 w-4 animate-spin" />
  );
}

// Stats card loading
export function StatsCardLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

// Chart loading state
export function ChartLoading({ height = '320px' }: { height?: string }) {
  return (
    <div 
      className="flex items-center justify-center bg-muted/20 rounded-lg"
      style={{ height }}
    >
      <LoadingSpinner text="Loading chart..." />
    </div>
  );
}