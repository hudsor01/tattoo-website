/**
 * Gallery Skeleton Component
 *
 * Loading skeleton for the gallery grid to improve perceived performance.
 */
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardFooter } from '@/components/ui/card';

export function GallerySkeleton() {
  return (
    <div className="space-y-6">
      {/* Filter controls skeleton */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="w-48">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Design grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }, (_, i) => `skeleton-${i}`).map((key) => (
          <Card key={key} className="overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <CardFooter className="p-4">
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
