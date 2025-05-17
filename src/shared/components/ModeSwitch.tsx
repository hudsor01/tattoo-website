'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Settings, User } from 'lucide-react';

type ModeSwitchProps = {
  className?: string;
  variant?: 'subtle' | 'prominent';
  currentMode: 'admin' | 'client';
};

/**
 * ModeSwitch component
 * 
 * Allows switching between admin dashboard and client portal views
 * Only shown to users with admin privileges
 */
export function ModeSwitch({ 
  className = '', 
  variant = 'subtle',
  currentMode 
}: ModeSwitchProps) {
  const router = useRouter();

  const handleModeChange = (mode: 'admin' | 'client') => {
    if (mode === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/client');
    }
  };

  // Subtle variant is a simple dropdown in the header
  if (variant === 'subtle') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            {currentMode === 'admin' ? 'Admin View' : 'Client View'}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleModeChange('admin')}
            className={currentMode === 'admin' ? 'bg-accent' : ''}
          >
            <Settings className="mr-2 h-4 w-4" />
            Admin Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleModeChange('client')}
            className={currentMode === 'client' ? 'bg-accent' : ''}
          >
            <User className="mr-2 h-4 w-4" />
            Client Portal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Prominent variant is a more visible switcher
  return (
    <div className={`bg-primary/5 p-2 rounded-lg flex gap-1 ${className}`}>
      <Button
        variant={currentMode === 'admin' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => handleModeChange('admin')}
      >
        <Settings className="mr-2 h-4 w-4" />
        Admin
      </Button>
      <Button
        variant={currentMode === 'client' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1"
        onClick={() => handleModeChange('client')}
      >
        <User className="mr-2 h-4 w-4" />
        Client
      </Button>
    </div>
  );
}
