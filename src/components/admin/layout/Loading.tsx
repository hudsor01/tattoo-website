/**
 * Loading UI Components
 * 
 * This file contains centralized loading components for different areas of the application.
 * It avoids duplicating loading UI across multiple files.
 */

import React from 'react';

/**
 * Helper function to generate unique keys for loading skeleton items
 */
const generateSkeletonKey = (prefix: string, index: number) => `${prefix}-${index}-${Math.random().toString(36).substring(2, 10)}`;

/**
 * Wrapper component that selects the appropriate loading UI based on the type
 */
export interface LoadingUIProps {
  type?: 'table' | 'page' | 'card' | 'form' | 'list';
  variant?: 'admin' | 'gallery' | 'default';
}

export function LoadingUI({
  type = 'page',
  variant = 'default',
}: LoadingUIProps) {
  switch (type) {
    case 'table':
      return variant === 'admin' ? <AdminTableLoading /> : <ListLoading />;
    case 'card':
      return <CardLoading />;
    case 'form':
      return <FormLoading />;
    case 'list':
      return <ListLoading />;
    case 'page':
    default:
      return variant === 'admin' ? <AdminPageLoading /> : <PageLoading />;
  }
}

/**
 * Loading UI for admin table views
 */
export function AdminTableLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Search and filters skeleton */}
      <div className="flex justify-between mb-6 gap-4">
        <div className="h-10 w-full bg-gray-800 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Table skeleton */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-900">
          <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
        </div>

        {/* Table rows */}
        {[...Array(6)].map((_, i) => (
          <div key={generateSkeletonKey('table-row', i)} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-800">
            <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between mt-4">
        <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
        <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Loading UI for admin pages
 */
export function AdminPageLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={generateSkeletonKey('admin-card', i)} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
            <div className="h-6 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading UI for standard pages
 */
export function PageLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-800 rounded-full mx-auto" />
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto absolute inset-0" />
        </div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Loading UI for card layouts
 */
export function CardLoading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={generateSkeletonKey('card-skeleton', i)} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
          <div className="h-6 w-1/2 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 w-1/3 bg-gray-800 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading UI for forms
 */
export function FormLoading() {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="h-8 w-3/4 bg-gray-800 rounded animate-pulse"></div>
      
      {/* Form fields */}
      {[...Array(4)].map((_, i) => (
        <div key={generateSkeletonKey('form-field', i)} className="space-y-2">
          <div className="h-4 w-1/4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-800 rounded animate-pulse"></div>
        </div>
      ))}
      
      {/* Submit button */}
      <div className="h-12 w-full bg-gray-800 rounded animate-pulse"></div>
    </div>
  );
}

/**
 * Loading UI for lists
 */
export function ListLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={generateSkeletonKey('list-item', i)} className="flex justify-between items-center p-3 border border-gray-800 rounded-md">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-8 w-8 bg-gray-800 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Specialized Gallery loading
 */
export function GalleryLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={generateSkeletonKey('gallery-item', i)} className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-800 animate-pulse"></div>
            <div className="p-4 space-y-2">
              <div className="h-5 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingUI;