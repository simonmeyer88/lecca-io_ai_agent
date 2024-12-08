import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import React, { useEffect } from 'react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

type DateRangePickerProps = {
  value?: DateRange;
  onChange: (value?: DateRange) => void;
  placeholder?: string;
  required?: boolean; //Keep this so we can register: HACK for dynamic-form-field
  triggerClassName?: string;
  disabled?: boolean;
};

export function DateRangePicker({
  value,
  onChange,
  // required, //Required doesn't work when it's a range
  placeholder,
  className,
  triggerClassName,
  disabled,
}: DateRangePickerProps & React.HTMLAttributes<HTMLDivElement>) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    value,
  );

  useEffect(() => {
    if (onChange) {
      onChange(dateRange);
    }
    //Don't add onChange to the dependency array, or it will cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <Popover.Trigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              triggerClassName,
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder ?? 'Pick a date'}</span>
            )}
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </Popover.Content>
      </Popover>
    </div>
  );
}
