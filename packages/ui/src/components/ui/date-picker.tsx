import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

type DatePickerProps = {
  value?: Date;
  onChange: (value?: Date) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  required,
  placeholder,
  disabled,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] pl-3 text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          {value ? (
            format(value, 'PPP')
          ) : (
            <span>{placeholder ?? 'Pick a date'}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          required={required}
          onSelect={onChange}
          captionLayout="dropdown-buttons"
          initialFocus
        />
      </Popover.Content>
    </Popover>
  );
}
