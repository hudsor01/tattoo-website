import { cn } from '@/utils';

// CONVERTED TO SERVER COMPONENT: Pure CSS animation with no React hooks or client-side logic

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export { Skeleton };
