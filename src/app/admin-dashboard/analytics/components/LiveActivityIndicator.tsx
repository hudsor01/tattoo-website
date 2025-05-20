"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils/styling";

interface LiveActivityIndicatorProps {
  pulse?: boolean;
  activeCount?: number;
  className?: string;
}

export function LiveActivityIndicator({ 
  pulse = true, 
  activeCount = 0,
  className
}: LiveActivityIndicatorProps) {
  const [blink, setBlink] = useState(true);

  // Create blinking effect
  useEffect(() => {
    if (!pulse) return;

    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [pulse]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Circle
          className={cn(
            "h-3 w-3 transition-all duration-500",
            blink ? "text-green-500 fill-green-500" : "text-green-400 fill-green-400"
          )}
        />
        {pulse && (
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
      
      <Badge variant="secondary" className="font-normal">
        {activeCount > 0 ? `${activeCount} Live` : "Live"}
      </Badge>
    </div>
  );
}