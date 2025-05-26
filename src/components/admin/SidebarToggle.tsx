'use client';

import { Pin, PinOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarSettings } from '@/hooks/use-sidebar-settings';
import { toast } from 'sonner';

export function SidebarToggle() {
  const { settings, toggleFixed, toggleDefaultOpen } = useSidebarSettings();

  const handleFixedToggle = () => {
    toggleFixed();
    void toast.success(
      settings.isFixed
        ? 'Sidebar unpinned - will auto-collapse on mobile'
        : 'Sidebar pinned - will stay open across pages'
    );
  };

  const handleDefaultOpenToggle = () => {
    toggleDefaultOpen();
    void toast.success(
      settings.defaultOpen
        ? 'Sidebar will start collapsed by default'
        : 'Sidebar will start open by default'
    );
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                {settings.isFixed ? (
                  <Pin className="h-4 w-4 text-primary" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Sidebar Settings</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Sidebar Preferences
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={settings.isFixed}
            onCheckedChange={handleFixedToggle}
            className="flex items-center gap-2"
          >
            {settings.isFixed ? (
              <Pin className="h-4 w-4 text-primary" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
            <div className="flex-1">
              <div className="font-medium">Pin Sidebar</div>
              <div className="text-xs text-muted-foreground">
                Keep sidebar open across page navigation
              </div>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={settings.defaultOpen}
            onCheckedChange={handleDefaultOpenToggle}
            className="flex items-start gap-2"
          >
            <div className="flex-1 pt-0.5">
              <div className="font-medium">Default Open</div>
              <div className="text-xs text-muted-foreground">
                Start with sidebar expanded (desktop only)
              </div>
            </div>
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
            Settings are saved locally per device
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
