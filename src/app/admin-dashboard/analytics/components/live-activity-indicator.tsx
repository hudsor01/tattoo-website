'use client';

import React, { useState, useEffect } from 'react';
import { useLiveAnalytics } from '@/hooks/use-live-analytics';
import { BadgeInfo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { type LiveActivityIndicatorProps } from '@/types/component-types';

/**
 * A visual indicator that shows when there's live analytics activity
 * Pulses when new events are received to provide a real-time feel
 */
export function LiveActivityIndicator({ className = '' }: LiveActivityIndicatorProps) {
  const { isConnected, recentEvents, eventCounts } = useLiveAnalytics({
    autoConnect: true,
    bufferSize: 5,
  });

  const [isPulsing, setIsPulsing] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  // Pulse animation when new events arrive
  useEffect(() => {
    if (eventCounts.total > lastCount) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      setLastCount(eventCounts.total);
      return () => clearTimeout(timer);
    }
  }, [eventCounts.total, lastCount]);

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${className} cursor-default`}>
              <BadgeInfo className="h-3 w-3 mr-1" />
              <span className="text-xs">Offline</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connect to see live analytics</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`
              ${className}
              ${isPulsing ? 'bg-primary/10 border-primary' : ''}
              transition-all duration-300 cursor-default
            `}
          >
            <span
              className={`
              h-2 w-2 rounded-full mr-2 bg-green-500
              ${isPulsing ? 'animate-ping scale-150' : ''}
            `}
            />
            <span className="text-xs">
              {eventCounts.total > 0 ? `${eventCounts.total} events` : 'Live'}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {eventCounts.total > 0
              ? `${eventCounts.total} events tracked in this session`
              : 'Waiting for events...'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}