'use client'

import * as React from 'react'
import { Calendar, ChevronDown, Clock, Filter } from 'lucide-react'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import type { DateRange as ReactDayPickerDateRange } from 'react-day-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator' // unused

export interface DateRange {
  from: Date
  to: Date
}

export interface TimeRangeOption {
  label: string
  value: string
  range: DateRange
  description?: string
}

const getPresetRanges = (): TimeRangeOption[] => {
  const now = new Date()
  
  return [
    {
      label: 'Today',
      value: 'today',
      range: {
        from: startOfDay(now),
        to: endOfDay(now),
      },
      description: 'Current day',
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      range: {
        from: startOfDay(subDays(now, 1)),
        to: endOfDay(subDays(now, 1)),
      },
      description: 'Previous day',
    },
    {
      label: 'Last 7 days',
      value: '7d',
      range: {
        from: startOfDay(subDays(now, 6)),
        to: endOfDay(now),
      },
      description: 'Past week including today',
    },
    {
      label: 'Last 30 days',
      value: '30d',
      range: {
        from: startOfDay(subDays(now, 29)),
        to: endOfDay(now),
      },
      description: 'Past month including today',
    },
    {
      label: 'Last 3 months',
      value: '90d',
      range: {
        from: startOfDay(subDays(now, 89)),
        to: endOfDay(now),
      },
      description: 'Past quarter including today',
    },
    {
      label: 'Last 6 months',
      value: '6m',
      range: {
        from: startOfDay(subMonths(now, 6)),
        to: endOfDay(now),
      },
      description: 'Past 6 months including today',
    },
    {
      label: 'Last year',
      value: '1y',
      range: {
        from: startOfDay(subYears(now, 1)),
        to: endOfDay(now),
      },
      description: 'Past year including today',
    },
    {
      label: 'This week',
      value: 'this-week',
      range: {
        from: startOfDay(subDays(now, now.getDay())),
        to: endOfDay(now),
      },
      description: 'Current week (Sunday to today)',
    },
    {
      label: 'This month',
      value: 'this-month',
      range: {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
      },
      description: 'Current month',
    },
  ]
}

interface TimeRangeFilterProps {
  value?: DateRange
  onChange: (range: DateRange) => void
  presets?: TimeRangeOption[]
  className?: string
  placeholder?: string
  showDescription?: boolean
}

export function TimeRangeFilter({
  value,
  onChange,
  presets = getPresetRanges(),
  className,
  placeholder = 'Select date range',
  showDescription = true,
}: TimeRangeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>(value)

  // Find matching preset for current value
  React.useEffect(() => {
    if (value) {
      const matchingPreset = presets.find(preset => 
        preset.range.from.getTime() === value.from.getTime() &&
        preset.range.to.getTime() === value.to.getTime()
      )
      setSelectedPreset(matchingPreset?.value ?? null)
    }
  }, [value, presets])

  const handlePresetSelect = (preset: TimeRangeOption) => {
    setSelectedPreset(preset.value)
    setCustomRange(undefined)
    onChange(preset.range)
    setIsOpen(false)
  }

  const handleCustomRangeSelect = (range: ReactDayPickerDateRange | undefined) => {
    if (range?.from && range?.to) {
      const validRange: DateRange = {
        from: range.from,
        to: range.to
      }
      setCustomRange(validRange)
      setSelectedPreset(null)
      onChange(validRange)
      setIsOpen(false)
    } else {
      setCustomRange(undefined)
    }
  }

  const formatDateRange = (range: DateRange) => {
    const from = format(range.from, 'MMM d')
    const to = format(range.to, 'MMM d, yyyy')
    
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, 'MMM d, yyyy')
    }
    
    if (range.from.getFullYear() === range.to.getFullYear()) {
      return `${from} - ${to}`
    }
    
    return `${format(range.from, 'MMM d, yyyy')} - ${to}`
  }

  const getDisplayText = () => {
    if (!value) return placeholder
    
    const matchingPreset = presets.find(preset => 
      preset.range.from.getTime() === value.from.getTime() &&
      preset.range.to.getTime() === value.to.getTime()
    )
    
    return matchingPreset?.label ?? formatDateRange(value)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal ${className}`}
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset options */}
          <div className="border-r">
            <div className="p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Quick Select
              </h4>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <motion.button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent ${
                      selectedPreset === preset.value
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{preset.label}</span>
                      {selectedPreset === preset.value && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    {showDescription && preset.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {preset.description}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom calendar */}
          <div className="p-3">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Custom Range
            </h4>
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={customRange as ReactDayPickerDateRange | undefined}
              onSelect={handleCustomRangeSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
            
            {customRange?.from && customRange?.to && (
              <div className="mt-3 p-2 bg-muted rounded-md">
                <div className="text-sm font-medium">Selected Range:</div>
                <div className="text-sm text-muted-foreground">
                  {formatDateRange(customRange)}
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Quick time range selector for common use cases
interface QuickTimeRangeProps {
  value?: string
  onChange: (value: string, range: DateRange) => void
  options?: TimeRangeOption[]
  className?: string
}

export function QuickTimeRange({
  value,
  onChange,
  options = getPresetRanges().slice(2, 7), // Most common ranges
  className,
}: QuickTimeRangeProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value, option.range)}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-accent border-border'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  )
}

// Hook for managing time range state
export function useTimeRange(initialRange?: string) {
  const presets = getPresetRanges()
  const [selectedRange, setSelectedRange] = React.useState<string>(
    initialRange ?? '30d'
  )
  
  const currentRange = React.useMemo(() => {
    const preset = presets.find(p => p.value === selectedRange)
    return preset?.range ?? presets[3]?.range ?? presets[0]?.range ?? {
      from: new Date(),
      to: new Date()
    } // Default to 30 days or first preset or today
  }, [selectedRange, presets])

  const setRange = React.useCallback((value: string) => {
    setSelectedRange(value)
  }, [])

  return {
    selectedRange,
    currentRange,
    setRange,
    presets,
  }
}

// Utility functions for date range operations
export const dateRangeUtils = {
  isToday: (range: DateRange) => {
    const today = new Date()
    return (
      startOfDay(range.from).getTime() === startOfDay(today).getTime() &&
      endOfDay(range.to).getTime() === endOfDay(today).getTime()
    )
  },

  getDaysDifference: (range: DateRange) => {
    const diffTime = range.to.getTime() - range.from.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  },

  formatForAPI: (range: DateRange) => ({
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  }),

  isValidRange: (range: Partial<DateRange>) => {
    return range.from && range.to && range.from <= range.to
  },
}