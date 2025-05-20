/**
 * Design Detail Skeleton Component
 * 
 * Loading skeleton for the design detail page to improve perceived performance.
 */
import { Skeleton } from '@/components/ui/skeleton';

export function DesignDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-24" />
      
      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <Skeleton className="aspect-square w-full rounded-lg" />
        
        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          
          <Skeleton className="h-12 w-full max-w-[200px]" />
        </div>
      </div>
    </div>
  );
}
