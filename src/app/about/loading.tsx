import { Skeleton } from '@/components/ui/skeleton';

export default function AboutLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="w-full max-w-none px-6 py-16 pt-24">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-16 w-96 mx-auto mb-4 bg-muted/20" />
          <Skeleton className="h-6 w-2xl mx-auto mb-8 bg-muted/20" />
          <Skeleton className="h-1 w-24 mx-auto bg-muted/20" />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Skeleton */}
          <Skeleton className="h-[500px] rounded-xl bg-muted/20" />
          
          {/* Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 bg-muted/20" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-muted/20" />
              <Skeleton className="h-4 w-full bg-muted/20" />
              <Skeleton className="h-4 w-3/4 bg-muted/20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-muted/20" />
              <Skeleton className="h-4 w-5/6 bg-muted/20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-muted/20" />
              <Skeleton className="h-4 w-4/5 bg-muted/20" />
            </div>
            <Skeleton className="h-12 w-48 bg-muted/20 rounded-md" />
          </div>
        </div>

        {/* Values Section Skeleton */}
        <div className="py-16 mt-12">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-80 mx-auto mb-4 bg-muted/20" />
            <Skeleton className="h-6 w-96 mx-auto bg-muted/20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-6 rounded-lg border border-zinc-800">
                <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted/20" />
                <Skeleton className="h-8 w-32 mx-auto mb-3 bg-muted/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted/20" />
                  <Skeleton className="h-4 w-4/5 mx-auto bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}