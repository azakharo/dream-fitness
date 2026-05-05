'use client';

import * as React from 'react';
import {format} from 'date-fns';
import {Calendar as CalendarIcon} from 'lucide-react';
import {type DayPickerProps} from 'react-day-picker';

import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/Button';
import {Calendar} from '@/components/ui/Calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/Popover';
import {DATE_FORMAT} from '@/lib/constants';

export interface DatePickerProps extends Omit<
  DayPickerProps,
  'mode' | 'selected' | 'onSelect'
> {
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Выберите дату',
  disabled,
  className,
  ...dayPickerProps
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  const formattedValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return format(value, DATE_FORMAT);
    } catch {
      return undefined;
    }
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {formattedValue ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          {...dayPickerProps}
        />
      </PopoverContent>
    </Popover>
  );
};
