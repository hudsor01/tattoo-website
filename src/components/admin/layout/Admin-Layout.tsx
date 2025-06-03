'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { AdminPageHeaderProps, AdminPageStructureProps } from '@prisma/client';

// Types moved to @/types/component-types:
// AdminPageHeaderProps, AdminPageStructureProps

/**
 * AdminPageHeader component for consistent page headers across admin pages
 */
export function AdminPageHeader({ title, description, badge, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {badge && (
            <Badge variant={badge.variant ?? 'secondary'} className="h-7 px-3">
              {badge.text}
            </Badge>
          )}
        </div>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * AdminPageStructure component for consistent page layout across admin pages
 */
export function AdminPageStructure({ header, children, sidebar }: AdminPageStructureProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader {...header} />
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {sidebar && (
          <div className="lg:col-span-1 space-y-6">
            {sidebar}
          </div>
        )}
        
        <div className={sidebar ? "lg:col-span-3 space-y-6" : "lg:col-span-4 space-y-6"}>
          {children}
        </div>
      </div>
    </div>
  );
}
