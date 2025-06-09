'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">Page Not Found</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <p className="text-sm font-medium mb-2">Popular pages:</p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/gallery" className="text-primary hover:text-primary/80 underline">
                  View our gallery
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-primary hover:text-primary/80 underline">
                  Book an appointment
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-primary hover:text-primary/80 underline">
                  Our services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary hover:text-primary/80 underline">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="default" className="flex-1">
            <Link href="/" className="inline-flex items-center justify-center">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>

          <Button onClick={() => window.history.back()} variant="outline" className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>

        <div className="p-4 border-t text-center">
          <p className="text-xs text-neutral-500">
            Lost? Try our{' '}
            <Link href="/contact" className="text-primary hover:text-primary/80 underline">
              contact page
            </Link>{' '}
            for help.
          </p>
        </div>
      </Card>
    </div>
  );
}
