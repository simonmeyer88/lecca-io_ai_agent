import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

import { ScrollArea } from './scroll-area';
import { Skeleton } from './skeleton';

export function ComboBox({
  items,
  variant,
  fallbackLabel,
  searchLabel,
  isLoading,
  defaultSelectedItem: selectedItem,
  searchable,
  toggle,
  className,
  onChange,
  dropdownWidthMatchesButton,
  trigger: customTrigger,
  disabled,
  portal,
}: {
  items:
    | {
        value: string;
        label: string;
        subLabel?: string;
        prefix?: React.ReactNode;
      }[]
    | undefined;
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  fallbackLabel?: string;
  searchLabel?: string;
  isLoading?: boolean;
  /**
   * @default true
   */
  searchable?: boolean;
  defaultSelectedItem?: {
    value: string;
    label: string;
    logoUrl?: React.ReactNode;
  };
  portal?: boolean;
  onChange: (value: string | null) => void;
  /**
   * If you select a selected item, it will deselect it.
   */
  toggle?: boolean;
  className?: string;
  createDialog?: (args: { trigger: React.ReactElement }) => React.ReactElement;
  dropdownWidthMatchesButton?: boolean;
  trigger?: React.ReactElement;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedItem?.value ?? '');
  const [label, setLabel] = React.useState(selectedItem?.label ?? '');
  const [buttonRefWidth, setButtonRefWidth] = React.useState(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      setButtonRefWidth(buttonRef.current.offsetWidth);
    }
  }, []);

  return isLoading ? (
    <Skeleton className={cn('w-full h-10', className)} />
  ) : (
    <Popover open={open} onOpenChange={setOpen} key={buttonRefWidth}>
      <Popover.Trigger asChild>
        {customTrigger ?? (
          <Button
            variant={variant ?? 'outline'}
            disabled={disabled}
            className={cn(
              'space-x-1 flex-inline justify-between !py-2 h-[30px] px-2',
              className,
            )}
            ref={buttonRef}
          >
            <span
              className={cn('font-normal', {
                'text-muted-foreground': !label.length,
              })}
            >
              {label.length ? label : fallbackLabel ?? 'Select an option'}
            </span>
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </Popover.Trigger>
      {!buttonRefWidth && !customTrigger ? null : (
        <Popover.Content
          portal={portal != null && portal === false}
          className={cn('p-0 -mt-2')}
          style={
            dropdownWidthMatchesButton
              ? { width: `${buttonRefWidth}px` }
              : undefined
          }
        >
          <Command>
            <Command.List>
              {searchable === false ? null : (
                <>
                  <Command.Input placeholder={searchLabel ?? 'Search...'} />
                  <Command.Empty>No results found.</Command.Empty>
                </>
              )}
              <Command.Group>
                <ScrollArea
                  className={cn({
                    'h-72': items && items.length > 10,
                  })}
                >
                  {items?.length ? (
                    items?.map((item) => (
                      <Command.Item
                        key={item.value}
                        // value={item.value} //The search is based off the value. We want the value to be the label for searching.
                        onSelect={() => {
                          const selectedValue = item.value;

                          if (toggle) {
                            setValue(
                              selectedValue === value ? '' : selectedValue,
                            );
                            setLabel(item.label === label ? '' : item.label);
                            setOpen(false);
                            onChange(
                              selectedValue === value ? null : selectedValue,
                            );
                          } else {
                            setValue(selectedValue);
                            setLabel(item.label);
                            setOpen(false);
                            onChange(selectedValue);
                          }
                        }}
                      >
                        {item.prefix ? (
                          <span className="mr-2">{item.prefix}</span>
                        ) : null}
                        <div
                          className={cn('flex flex-row', {
                            'flex-col': item.subLabel,
                          })}
                        >
                          <span
                            className={cn('text-sm', {
                              'text-xs': item.subLabel,
                            })}
                            dangerouslySetInnerHTML={{
                              //This is a hack. Css escapes all the bad characters but then there are backslashes everywhere.
                              //So then we remove the back slashes. The only problem is you can never see a backslack in a combobox label now.
                              __html: CSS.escape(item.label).replace(/\\/g, ''),
                            }}
                          ></span>
                          {item.subLabel ? (
                            <span className="text-muted-foreground text-xs">
                              {item.subLabel}
                            </span>
                          ) : null}
                        </div>
                        <CheckIcon
                          className={cn(
                            'ml-auto size-4',
                            value === item.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </Command.Item>
                    ))
                  ) : (
                    <Command.Item value={undefined}>No Results</Command.Item>
                  )}
                </ScrollArea>
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      )}
    </Popover>
  );
}
