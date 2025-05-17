/**
 * Gallery Skeleton Component
 * 
 * Loading skeleton for the gallery grid to improve perceived performance.
 */
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
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
