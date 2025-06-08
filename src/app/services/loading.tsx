import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="w-full max-w-none px-6 py-16 pt-24">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-16 w-96 mx-auto mb-4 bg-muted/20" />
          <Skeleton className="h-6 w-2xl mx-auto mb-8 bg-muted/20" />
          <Skeleton className="h-1 w-24 mx-auto bg-muted/20" />
        </div>
        {/* Services Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
              {/* Service Image Skeleton */}
              <Skeleton className="h-48 w-full bg-muted/20" />
              
              {/* Service Content Skeleton */}
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4 bg-muted/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted/20" />
                  <Skeleton className="h-4 w-5/6 bg-muted/20" />
                  <Skeleton className="h-4 w-4/5 bg-muted/20" />
                </div>
                
                {/* Price Skeleton */}
                <div className="flex items-center justify-between pt-4">
                  <Skeleton className="h-6 w-24 bg-muted/20" />
                  <Skeleton className="h-10 w-28 bg-muted/20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* CTA Section Skeleton */}
        <div className="text-center mt-16 space-y-6">
          <Skeleton className="h-12 w-80 mx-auto bg-muted/20" />
          <Skeleton className="h-6 w-96 mx-auto bg-muted/20" />
          <Skeleton className="h-12 w-48 mx-auto bg-muted/20 rounded-md" />
        </div>
      </div>
    </main>
  );
}