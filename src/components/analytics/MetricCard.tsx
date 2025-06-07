'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
// MetricCard props interface
interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  change, 
  trend,
  description 
}: MetricCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:scale-[1.01] transition-all duration-300 shadow-md">
      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <p className="text-sm font-medium tracking-tight uppercase text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight leading-none text-white">
            {value}
          </p>
        </div>
        
        <div className="p-2.5 rounded-lg bg-gray-700 text-gray-300">
          {icon}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 pt-0">
        {(change !== undefined) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md',
                  trend === 'up' && 'bg-emerald-900/30 text-emerald-400',
                  trend === 'down' && 'bg-red-900/30 text-red-400',
                  trend === 'neutral' && 'bg-gray-800 text-gray-400'
                )}
              >
                {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                {trend === 'neutral' && <TrendingUp className="h-3 w-3" />}
                {change.value > 0 && trend !== 'down' && '+'}
                {change.value}%
              </Badge>
            </div>
            
            <p className="text-xs text-gray-400">
              {description ?? 'vs last period'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}