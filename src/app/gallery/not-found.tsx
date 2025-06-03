import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Images } from 'lucide-react';

export default function GalleryNotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl font-bold text-red-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Design Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The tattoo design you're looking for doesn't exist or has been removed from our gallery.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            <Link href="/gallery" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
          </Button>

          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/contact" className="flex items-center gap-2">
              <Images className="h-4 w-4" />
              Request Custom Design
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
