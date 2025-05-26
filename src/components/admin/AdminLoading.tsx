'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function AdminPageLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-gray-800" />
        <Skeleton className="h-4 w-96 bg-gray-800" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-32 bg-gray-800" />
            <Skeleton className="h-4 w-48 bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-3/4 bg-gray-800" />
            <Skeleton className="h-4 w-1/2 bg-gray-800" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`admin-card-${i}`} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-gray-800" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
                <Skeleton className="h-8 w-full bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminTableLoading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48 bg-gray-800" />
        <Skeleton className="h-10 w-32 bg-gray-800" />
      </div>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`table-row-${i}`} className="flex items-center space-x-4 p-4 border-b border-gray-800 last:border-b-0">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-32 bg-gray-800" />
                <Skeleton className="h-4 w-48 bg-gray-800" />
                <Skeleton className="h-4 w-16 bg-gray-800" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}