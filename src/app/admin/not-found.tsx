import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl font-bold text-red-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Page Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The admin page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </Link>
          </Button>

          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
