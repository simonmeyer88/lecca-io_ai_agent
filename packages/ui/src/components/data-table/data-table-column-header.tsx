import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from '@radix-ui/react-icons';
import { Column } from '@tanstack/react-table';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2 h-full', className)}>
      {!column.getCanSort() ? null : (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>{title}</span>
              {column.getIsSorted() === 'desc' ? (
                <ArrowDownIcon className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'asc' ? (
                <ArrowUpIcon className="ml-2 h-4 w-4" />
              ) : (
                <CaretSortIcon className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {column.getCanSort() && (
              <>
                <DropdownMenu.Item onClick={() => column.toggleSorting(false)}>
                  <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Asc
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => column.toggleSorting(true)}>
                  <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  Desc
                </DropdownMenu.Item>
              </>
            )}
            {column.getCanSort() && column.getCanHide() && (
              <DropdownMenu.Separator />
            )}
            {column.getCanHide() && (
              <DropdownMenu.Item onClick={() => column.toggleVisibility(false)}>
                <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Hide
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
}
