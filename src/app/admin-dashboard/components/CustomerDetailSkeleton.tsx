/**
 * Customer Detail Skeleton Component
 * 
 * Loading skeleton for the customer detail page to improve perceived performance.
 */
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList } from '@/components/ui/tabs';

export function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <Skeleton className="h-9 w-24 mr-4" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Customer overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center mb-4">
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
        
        {/* Customer details tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs defaultValue="overview">
              <TabsList>
                <Skeleton className="h-9 w-24 mx-1" />
                <Skeleton className="h-9 w-24 mx-1" />
                <Skeleton className="h-9 w-24 mx-1" />
                <Skeleton className="h-9 w-24 mx-1" />
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity items */}
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="w-full">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-20 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
