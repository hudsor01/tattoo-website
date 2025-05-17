/**
 * Client Portal Skeleton Component
 * 
 * Loading skeleton for the client portal to improve perceived performance.
 */
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ClientPortalSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome section skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs skeleton */}
      <Card>
        <CardHeader className="pb-0">
          <Tabs defaultValue="appointments">
            <TabsList className="w-full max-w-md grid grid-cols-3">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Appointments tab skeleton */}
          <div className="space-y-4">
            {/* Loading skeleton items */}
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
