 
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import React from 'react';

import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { priorities } from './data/data';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  toolbarActions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  toolbarActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={(table.getColumn('Name')?.getFilterValue() as string) ?? ''}
          onChange={(event: any) => {
            return table.getColumn('Name')?.setFilterValue(event.target.value);
          }}
          className="py-2 w-[150px] lg:w-[250px]"
        />
        {table.getAllColumns().map((column: any) => {
          switch (column.id) {
            case 'Active':
              return (
                <DataTableFacetedFilter
                  key="Active"
                  column={table.getColumn('Active')}
                  title="Status"
                  options={[
                    {
                      label: 'Active',
                      value: 'active',
                    },
                    {
                      label: 'Inactive',
                      value: 'inactive',
                    },
                  ]}
                />
              );
            case 'Status':
              return (
                <DataTableFacetedFilter
                  column={table.getColumn('Status')}
                  key="Status"
                  title="Status"
                  options={[
                    {
                      label: 'Running',
                      value: 'RUNNING',
                    },
                    {
                      label: 'Success',
                      value: 'SUCCESS',
                    },
                    {
                      label: 'Failed',
                      value: 'FAILED',
                    },
                    {
                      label: 'Needs Input',
                      value: 'NEEDS_INPUT',
                    },
                    {
                      label: 'Scheduled',
                      value: 'SCHEDULED',
                    },
                  ]}
                />
              );
            case 'Data Type':
              return (
                <DataTableFacetedFilter
                  column={table.getColumn('Data Type')}
                  key="Data Type"
                  title="Data Type"
                  options={[
                    {
                      label: 'Text',
                      value: 'string',
                    },
                    {
                      label: 'Number',
                      value: 'number',
                    },
                    {
                      label: 'Boolean',
                      value: 'boolean',
                    },
                    {
                      label: 'Date',
                      value: 'date',
                    },
                  ]}
                />
              );
            case 'Type':
              return (
                <DataTableFacetedFilter
                  column={table.getColumn('Type')}
                  key="Type"
                  title="Type"
                  options={[
                    {
                      label: 'Workspace',
                      value: 'workspace',
                    },
                    {
                      label: 'System',
                      value: 'system',
                    },
                  ]}
                />
              );
            case 'priority':
              return (
                <DataTableFacetedFilter
                  key={'Key'}
                  column={table.getColumn('priority')}
                  title="Priority"
                  options={priorities}
                />
              );
            default:
              return null;
          }
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {toolbarActions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
