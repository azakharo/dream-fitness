'use client';

import * as React from 'react';
import {format, parse} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Calendar as CalendarIcon} from 'lucide-react';

import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DATE_FORMAT = 'dd.MM.yyyy';

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Выберите дату',
  disabled,
  className,
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return parse(value, DATE_FORMAT, new Date());
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, DATE_FORMAT);
      onChange?.(formatted);
    } else {
      onChange?.('');
    }
    setOpen(false);
  };

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
          {value ? value : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={disabled}
          locale={ru}
          weekStartsOn={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
