"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils/styling";
import { formatTimestamp, parseTimestamp, standardizeTimestamp } from "@/lib/utils/analytics-format";
// Use the standardized timestamp utilities for consistent date handling

interface LiveActivityIndicatorProps {
  pulse?: boolean;
  activeUsers?: number;
  activeCount?: number;
  lastUpdated?: Date | string | null;
  isConnected?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export function LiveActivityIndicator({ 
  pulse = true, 
  activeUsers = 0,
  activeCount = 0,
  lastUpdated = null,
  isConnected = true,
  variant = 'default',
  className
}: LiveActivityIndicatorProps) {
  const [blink, setBlink] = useState(true);

  // Create blinking effect
  useEffect(() => {
    if (!pulse || !isConnected) return;

    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [pulse, isConnected]);

  // Compact variant - just the indicator dot and Badge
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative">
          <Circle
            className={cn(
              "h-3 w-3 transition-all duration-500",
              isConnected 
                ? (blink ? "text-green-500 fill-green-500" : "text-green-400 fill-green-400")
                : "text-gray-400 fill-gray-400"
            )}
          />
          {pulse && isConnected && (
            <div className="absolute inset-0">
              <Circle
                className={cn(
                  "h-3 w-3 text-green-500 fill-green-500 animate-ping",
                  !blink && "opacity-0"
                )}
              />
            </div>
          )}
        </div>
        
        <Badge variant={isConnected ? "success" : "secondary"} className="font-normal">
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </div>
    );
  }
  
  // Detailed variant - with active users count and last updated time
  if (variant === 'detailed') {
    return (
      <div className={cn("flex flex-col", className)}>
        <div className="flex items-center gap-2 mb-1">
          <div className="relative">
            <Circle
              className={cn(
                "h-3 w-3 transition-all duration-500",
                isConnected 
                  ? (blink ? "text-green-500 fill-green-500" : "text-green-400 fill-green-400")
                  : "text-gray-400 fill-gray-400"
              )}
            />
            {pulse && isConnected && (
              <div className="absolute inset-0">
                <Circle
                  className={cn(
                    "h-3 w-3 text-green-500 fill-green-500 animate-ping",
                    !blink && "opacity-0"
                  )}
                />
              </div>
            )}
          </div>
          
          <Badge variant={isConnected ? "success" : "secondary"} className="font-normal">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          
          {activeUsers > 0 && isConnected && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{activeUsers} active</span>
            </div>
          )}
          
          {activeCount > 0 && isConnected && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{activeCount} events</span>
            </div>
          )}
        </div>
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {formatTimestamp(lastUpdated)}
          </div>
        )}
      </div>
    );
  }
  
  // Default variant - with active users count
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Circle
          className={cn(
            "h-3 w-3 transition-all duration-500",
            isConnected 
              ? (blink ? "text-green-500 fill-green-500" : "text-green-400 fill-green-400")
              : "text-gray-400 fill-gray-400"
          )}
        />
        {pulse && isConnected && (
          <div className="absolute inset-0">
            <Circle
              className={cn(
                "h-3 w-3 text-green-500 fill-green-500 animate-ping",
                !blink && "opacity-0"
              )}
            />
          </div>
        )}
      </div>
      
      <Badge variant={isConnected ? "success" : "secondary"} className="font-normal">
        {isConnected 
          ? (activeUsers > 0 ? `${activeUsers} Live` : "Live") 
          : "Offline"}
      </Badge>
      
      {activeCount > 0 && isConnected && (
        <Badge variant="outline" className="font-normal">
          {activeCount} events
        </Badge>
      )}
      
      {lastUpdated && variant === 'default' && (
        <div className="text-xs text-muted-foreground hidden md:block">
          Last: {formatTimestamp(lastUpdated)}
        </div>
      )}
    </div>
  );
}