// CONVERTED TO SERVER COMPONENT: Radix Tabs work in Server Components when controlled externally

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
React.ComponentRef<typeof TabsPrimitive.List>,
React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
<TabsPrimitive.List
ref={ref}
className={cn(
'inline-flex items-center justify-center rounded-lg bg-black/50 p-1.5 border border-white/10 shadow-lg backdrop-blur-sm',
className
)}
{...props}
/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
React.ComponentRef<typeof TabsPrimitive.Trigger>,
React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
<TabsPrimitive.Trigger
ref={ref}
className={cn(
'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium relative transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
'data-[state=inactive]:text-white/80 data-[state=inactive]:hover:bg-white/10 data-[state=inactive]:hover:text-white',
'data-[state=active]:bg-fernando-gradient data-[state=active]:text-white data-[state=active]:shadow-lg',
className
)}
{...props}
>
{children}
</TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
