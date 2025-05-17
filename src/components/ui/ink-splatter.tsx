'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface InkSplatterProps {
  className?: string;
  color?: string;
  opacity?: number;
  size?: number;
  variant?: 1 | 2 | 3 | 4 | 5;
  style?: CSSProperties;
}

export function InkSplatter({
  className,
  color = '#E60000',
  opacity = 0.1,
  size = 200,
  variant = 1,
  style,
}: InkSplatterProps) {
  const splatters = {
    1: (
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute", className)}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <path
          d="M100,20 C120,30 140,50 130,80 C135,85 145,75 160,90 C175,105 165,125 150,130 C140,135 130,140 120,145 C110,150 100,155 90,150 C80,145 70,140 60,130 C50,120 40,110 35,100 C30,90 25,80 30,70 C35,60 45,55 55,50 C65,45 75,40 85,35 C95,30 100,20 100,20"
          fill={color}
          opacity={1}
        />
        <ellipse cx="145" cy="65" rx="15" ry="10" fill={color} transform="rotate(25 145 65)" />
        <ellipse cx="55" cy="85" rx="12" ry="8" fill={color} transform="rotate(-30 55 85)" />
        <ellipse cx="100" cy="140" rx="20" ry="15" fill={color} transform="rotate(45 100 140)" />
      </svg>
    ),
    2: (
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute", className)}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <path
          d="M80,40 Q100,30 120,40 Q140,50 150,70 Q160,90 150,110 Q140,130 120,140 Q100,150 80,140 Q60,130 50,110 Q40,90 50,70 Q60,50 80,40"
          fill={color}
          opacity={1}
        />
        <ellipse cx="130" cy="55" rx="20" ry="15" fill={color} transform="rotate(15 130 55)" />
        <ellipse cx="70" cy="125" rx="18" ry="12" fill={color} transform="rotate(-45 70 125)" />
        <circle cx="45" cy="80" r="10" fill={color} />
        <circle cx="155" cy="100" r="8" fill={color} />
      </svg>
    ),
    3: (
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute", className)}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <path
          d="M100,30 C130,35 150,55 160,80 C170,105 165,130 150,145 C135,160 115,165 95,160 C75,155 55,145 40,130 C25,115 20,95 25,75 C30,55 45,40 65,35 C85,30 100,30 100,30"
          fill={color}
          opacity={1}
        />
        <ellipse cx="125" cy="75" rx="25" ry="18" fill={color} transform="rotate(35 125 75)" />
        <ellipse cx="75" cy="115" rx="22" ry="16" fill={color} transform="rotate(-25 75 115)" />
      </svg>
    ),
    4: (
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute", className)}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <path
          d="M60,60 Q80,40 100,45 Q120,50 135,65 Q150,80 155,100 Q160,120 150,135 Q140,150 120,155 Q100,160 80,155 Q60,150 45,135 Q30,120 35,100 Q40,80 55,65 Q70,50 60,60"
          fill={color}
          opacity={1}
        />
        <circle cx="120" cy="80" r="12" fill={color} />
        <circle cx="80" cy="120" r="15" fill={color} />
        <ellipse cx="100" cy="100" rx="30" ry="20" fill={color} transform="rotate(45 100 100)" />
      </svg>
    ),
    5: (
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("absolute", className)}
        style={{
          width: size,
          height: size,
          opacity,
          ...style,
        }}
      >
        <path
          d="M100,50 C110,45 125,50 135,60 C145,70 150,85 145,100 C140,115 130,125 115,130 C100,135 85,130 75,120 C65,110 60,95 65,80 C70,65 80,55 95,50 C110,45 100,50 100,50"
          fill={color}
          opacity={1}
        />
        <ellipse cx="115" cy="85" rx="20" ry="15" fill={color} transform="rotate(45 115 85)" />
        <ellipse cx="85" cy="105" rx="18" ry="13" fill={color} transform="rotate(-35 85 105)" />
        <circle cx="130" cy="110" r="8" fill={color} />
        <circle cx="70" cy="75" r="10" fill={color} />
      </svg>
    ),
  };

  return splatters[variant];
}

interface InkSplatterBackgroundProps {
  className?: string;
  count?: number;
  color?: string;
  minOpacity?: number;
  maxOpacity?: number;
  minSize?: number;
  maxSize?: number;
}

export function InkSplatterBackground({
  className,
  count = 5,
  color = '#E60000',
  minOpacity = 0.03,
  maxOpacity = 0.08,
  minSize = 100,
  maxSize = 300,
}: InkSplatterBackgroundProps) {
  // Generate random splatters with fixed positions to avoid hydration issues
  const splatters = Array.from({ length: count }, (_, i) => ({
    id: i,
    variant: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    size: minSize + (i * (maxSize - minSize) / count),
    opacity: minOpacity + (i * (maxOpacity - minOpacity) / count),
    style: {
      top: `${(i * 20) % 80}%`,
      left: `${(i * 25) % 90}%`,
      transform: `rotate(${i * 72}deg)`,
    },
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {splatters.map((splatter) => (
        <InkSplatter
          key={splatter.id}
          variant={splatter.variant}
          size={splatter.size}
          opacity={splatter.opacity}
          color={color}
          style={splatter.style}
        />
      ))}
    </div>
  );
}