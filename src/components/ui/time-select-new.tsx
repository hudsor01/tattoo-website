'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Generate times from 9:00 to 19:00 with 30 minute intervals
const generateTimeSlots = (): Array<{ value: string; label: string }> => {
  const slots: Array<{ value: string; label: string }> = [];

  for (let hour = 9; hour <= 19; hour++) {
    for (const minute of [0, 30]) {
      // Skip 19:30
      if (hour === 19 && minute === 30) continue;

      const hourFormatted = hour.toString().padStart(2, '0');
      const minuteFormatted = minute.toString().padStart(2, '0');
      const value = `${hourFormatted}:${minuteFormatted}`;

      const isPm = hour >= 12;
      const displayHour = hour % 12 || 12;
      const label = `${displayHour}:${minuteFormatted} ${isPm ? 'PM' : 'AM'}`;

      slots.push({
        value,
        label,
      });
    }
  }

  return slots;
};

const timeSlots = generateTimeSlots();

interface TimeSelectProps {
  value: string;
  onChangeAction: (value: string) => void;
  className?: string;
}

export function TimeSelect({ value, onChangeAction, className }: TimeSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedTime = React.useMemo(() => {
    return timeSlots.find(slot => slot.value === value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select appointment time"
          className={cn('w-full justify-between', className)}
        >
          {selectedTime ? selectedTime.label : 'Select time...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search time..." aria-label="Search available times" />
          <CommandList>
            <CommandEmpty>No time slot found.</CommandEmpty>
            <CommandGroup heading="Available Times">
              {timeSlots.map(slot => (
                <CommandItem
                  key={slot.value}
                  value={slot.value}
                  onSelect={currentValue => {
                    onChangeAction(currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === slot.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {slot.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
