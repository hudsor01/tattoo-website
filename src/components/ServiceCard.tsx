'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/styling';
import type { Service } from '@/types/component-types';

interface ServiceCardProps {
  service: Service;
  index?: number;
}

/**
 * ServiceCard Component
 * 
 * Displays a service card with icon, title, short description,
 * and a "Learn More" link to the service details page.
 */
export function ServiceCard({ service }: ServiceCardProps) {
  const { id, title, shortDescription, icon: Icon } = service;

  return (
    <div 
      className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all shadow-lg hover:shadow-xl"
    >
      <div className="flex flex-col space-y-4">
        {/* Icon with animated background */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center transition-transform group-hover:scale-110">
          {Icon && <Icon className="h-6 w-6 text-white" />}
        </div>
        
        {/* Title with subtle animation */}
        <h3 className="text-xl font-bold text-white mt-2 group-hover:translate-x-1 transition-transform">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-zinc-400 line-clamp-3">
          {shortDescription}
        </p>
        
        {/* Learn More Link */}
        <Link 
          href={`/services#${id}`}
          className={cn(
            "mt-4 inline-flex items-center font-medium text-red-500 hover:text-red-400 transition-colors",
            "group-hover:translate-x-1 transition-transform"
          )}
        >
          Learn more
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default ServiceCard;