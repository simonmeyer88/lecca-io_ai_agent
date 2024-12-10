import { CheckIcon } from '@radix-ui/react-icons';
import React from 'react';

import { cn } from '../../utils/cn';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Command } from '../ui/command';
import { Popover } from '../ui/popover';
import { Separator } from '../ui/separator';

export function DataTableToolbarAction(props: {
  title: string;

  Icon: React.ComponentType<any>;
  options: {
    label: string;
    value: string;
  }[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
}) {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <props.Icon className="mr-2 h-4 w-4" />
          {props.title}
          {props.selectedValues?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {props.selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {props.selectedValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {props.selectedValues.length} selected
                  </Badge>
                ) : (
                  props.options
                    .filter((option) =>
                      props.selectedValues.includes(option.value),
                    )
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[200px] p-0" align="start">
        <Command>
          <Command.Input placeholder={props.title} />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group>
              {props.options.map((option) => {
                const isSelected = props.selectedValues.includes(option.value);
                return (
                  <Command.Item
                    key={option.value}
                    onSelect={() => {
                      let newSelectedValues = [...props.selectedValues];
                      if (isSelected) {
                        newSelectedValues = newSelectedValues.filter(
                          (value) => value !== option.value,
                        );
                      } else {
                        newSelectedValues.push(option.value);
                      }
                      props.onChange(newSelectedValues);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className={cn('h-4 w-4')} />
                    </div>
                    <span>{option.label}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
}
