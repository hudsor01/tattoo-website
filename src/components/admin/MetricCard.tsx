'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number | undefined;
  trend?: 'up' | 'down' | 'neutral' | undefined;
  icon: React.ReactNode;
  description?: string;
  href?: string;
}

export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  description,
  href,
}: MetricCardProps) {
  const cardContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <CardTitle className="text-sm font-semibold text-slate-400 tracking-wide uppercase">
          {title}
        </CardTitle>
        <div className="p-3 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-slate-700 transition-colors duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-3">
          <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
          {(change !== undefined || description) && (
            <div className="flex items-center gap-2">
              {change !== undefined && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border-0',
                    trend === 'up' && 'bg-green-900/50 text-green-400',
                    trend === 'down' && 'bg-red-900/50 text-red-400',
                    trend === 'neutral' && 'bg-slate-800 text-slate-400'
                  )}
                >
                  {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                  {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                  {change > 0 && '+'}
                  {change}%
                </Badge>
              )}
              <p className="text-xs text-slate-400 font-medium">
                {description ?? 'from last month'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <Card
          className={cn(
            'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group h-full',
            'cursor-pointer bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-xl',
            'flex flex-col justify-between min-h-[140px]'
          )}
        >
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group bg-slate-900 border border-slate-800 h-full flex flex-col justify-between min-h-[140px]">
      {cardContent}
    </Card>
  );
}
