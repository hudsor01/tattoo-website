'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: Record<string, any>
  }
>(({ className, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      style={
        {
          '--color-appointments': config['appointments']?.color || 'hsl(var(--primary))',
          '--color-revenue': config['revenue']?.color || 'hsl(var(--secondary))',
          '--color-chart-1': 'hsl(var(--chart-1))',
          '--color-chart-2': 'hsl(var(--chart-2))',
          '--color-chart-3': 'hsl(var(--chart-3))',
          '--color-chart-4': 'hsl(var(--chart-4))',
          '--color-chart-5': 'hsl(var(--chart-5))',
        } as React.CSSProperties
      }
      {...props}
    />
  )
})
ChartContainer.displayName = 'ChartContainer'

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-background p-2 shadow-sm',
        className
      )}
      {...props}
    />
  )
})
ChartTooltip.displayName = 'ChartTooltip'

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: any[]
    label?: string
    labelFormatter?: (label: string) => string
    indicator?: 'line' | 'dot' | 'dashed'
  }
>(({ className, active, payload, label, labelFormatter, indicator = 'dot', ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'grid gap-2 rounded-lg border bg-background p-2 shadow-sm',
        className
      )}
      {...props}
    >
      {labelFormatter && label && (
        <div className="text-sm font-medium">{labelFormatter(label)}</div>
      )}
      <div className="grid gap-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            {indicator === 'dot' && (
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="text-sm">{entry.name}</span>
            <span className="text-sm font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = 'ChartTooltipContent'

export { ChartContainer, ChartTooltip, ChartTooltipContent }