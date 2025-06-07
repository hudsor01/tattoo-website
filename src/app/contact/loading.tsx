import { Skeleton } from '@/components/ui/skeleton';

export default function ContactLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="w-full max-w-none px-6 py-16 pt-24">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-16">
          <Skeleton className="h-16 w-80 mx-auto mb-4 bg-muted/20" />
          <Skeleton className="h-6 w-2xl mx-auto mb-8 bg-muted/20" />
          <Skeleton className="h-1 w-24 mx-auto bg-muted/20" />
        </div>

        {/* Contact Form and Info Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
            <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
            <Skeleton className="h-10 w-full bg-muted/20 rounded-md" />
            <Skeleton className="h-32 w-full bg-muted/20 rounded-md" />
            <Skeleton className="h-12 w-full bg-muted/20 rounded-md" />
          </div>
          
          {/* Contact Info Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 bg-muted/20" />
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6 bg-muted/20 rounded" />
                  <Skeleton className="h-5 w-40 bg-muted/20" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6 bg-muted/20 rounded" />
                  <Skeleton className="h-5 w-48 bg-muted/20" />
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6 bg-muted/20 rounded" />
                  <Skeleton className="h-5 w-32 bg-muted/20" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-8 w-32 bg-muted/20" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full bg-muted/20" />
                <Skeleton className="h-5 w-5/6 bg-muted/20" />
                <Skeleton className="h-5 w-4/5 bg-muted/20" />
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 bg-muted/20" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-10 bg-muted/20 rounded" />
                <Skeleton className="h-10 w-10 bg-muted/20 rounded" />
                <Skeleton className="h-10 w-10 bg-muted/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}