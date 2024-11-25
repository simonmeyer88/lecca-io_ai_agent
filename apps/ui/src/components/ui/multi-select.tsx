import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Command } from '@/components/ui/command';
import { cn } from '@/utils/cn';

import { Icons } from '../icons';

import { ScrollArea } from './scroll-area';

type Item = {
  label: string;
   
  value: Record<string, any> | string;
};

type MultiSelectProps = {
  items: Item[];
  value?: Item['value'][];
  placeholder?: string;
  required?: boolean;
  onChange?: (items: Item['value']) => void;
  disabled?: boolean;
  className?: string;
};

export function MultiSelect({
  items,
  value: defaultValue,
  placeholder,
  required,
  onChange,
  disabled,
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Item[]>(
    items.filter((item) =>
      (defaultValue ?? []).some?.((val) => val === item.value),
    ),
  );
  const [inputValue, setInputValue] = React.useState('');

  const handleUnselect = React.useCallback((item: Item) => {
    setSelected((prev) => prev.filter((s) => s.value !== item.value));
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '') {
            setSelected((prev) => {
              const newSelected = [...prev];
              newSelected.pop();
              return newSelected;
            });
          }
        }
        // This is not a default behaviour of the <input /> field
        if (e.key === 'Escape') {
          input.blur();
        }
      }
    },
    [],
  );

  const selectables = React.useMemo(() => {
    return items.filter((item) => {
      return !selected.includes(item);
    });
  }, [items, selected]);

  React.useEffect(() => {
    if (onChange) {
      onChange(selected.map((item) => item.value));
    }
    //Don't add onChange or it will cause infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div
        className={cn(
          'group border border-input px-3 py-[7px] text-sm rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((item) => {
            return (
              <Badge
                key={JSON.stringify(item.value)}
                variant="secondary"
                className="font-normal"
              >
                {item.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(item);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <Icons.x className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            required={required}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={
              selected.length ? undefined : placeholder ?? 'Select option(s)...'
            }
            className="py-0 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="mt-2">
        {open && selectables.length > 0 ? (
          <div
            className={cn(
              'absolute z-10 w-[calc(100%-44px)] border rounded-md bg-popover text-popover-foreground shadow-md outline-none fade-in-0 animate-in ',
            )}
          >
            <Command.Group className="h-full overflow-auto">
              <ScrollArea className="h-40">
                {selectables.map((item) => {
                  return (
                    <Command.Item
                      key={JSON.stringify(item.value)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue('');
                        setSelected((prev) => [...prev, item]);
                      }}
                      className={'cursor-pointer'}
                    >
                      {item.label}
                    </Command.Item>
                  );
                })}
              </ScrollArea>
            </Command.Group>
          </div>
        ) : null}
      </div>
    </Command>
  );
}
