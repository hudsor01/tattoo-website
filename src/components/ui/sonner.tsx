'use client';

import React from 'react';
import { Toaster as Sonner } from 'sonner';
import { useEffect, useState } from 'react';

// Custom hook to get system theme
function useTheme(): { theme: 'light' | 'dark' | 'system' } {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => setTheme(mq.matches ? 'dark' : 'light');
    updateTheme();
    mq.addEventListener('change', updateTheme);
    return () => mq.removeEventListener('change', updateTheme);
  }, []);

  return { theme };
}

type ToasterProps = React.ComponentProps<typeof Sonner>;
const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme ?? 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
