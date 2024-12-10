import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header';
import { Icons } from '../../../../components/icons';
import { Badge } from '../../../../components/ui/badge';
import { Popover } from '../../../../components/ui/popover';
import { Execution } from '../../../../models/execution-model';
import {
  newDateOrUndefined,
  timeAgo,
  toLocaleStringOrUndefined,
} from '../../../../utils/dates';

import { DataTableRowActions } from './executions-table-row-actions';

export const columns: ColumnDef<Execution>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.workflow?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workflow" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/workflows/${row.original.workflow?.id}`}>
          <div className="flex space-x-2 text-blue-400 hover:underline">
            <span className="max-w-[500px] truncate font-medium">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Description',
    accessorFn: (row) => row.statusMessage,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" className="border-r " />
    ),
    cell: ({ getValue }) => {
      return (
        getValue() && (
          <Popover>
            <Popover.Trigger>
              <Icons.infoCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </Popover.Trigger>
            <Popover.Content>
              <div className="p-4 text-sm">
                <p>{getValue() as string}</p>
              </div>
            </Popover.Content>
          </Popover>
        )
      );
    },
  },
  {
    id: 'Run',
    accessorFn: (row) => row.executionNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workflow Run #" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link
          to={`/projects/${row.original.workflow?.project?.id}/executions/${row.original.id}`}
        >
          <div className="flex space-x-2 underline text-muted-foreground">
            <span className="max-w-[500px] truncate font-medium">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      let variant: 'good' | 'error' | 'warning' | 'unknown' = 'good';
      const value = getValue() as string;

      if (value === 'RUNNING') {
        variant = 'unknown';
      } else if (value === 'SUCCESS') {
        variant = 'good';
      } else if (value === 'FAILED') {
        variant = 'error';
      } else if (value === 'NEEDS_INPUT') {
        variant = 'warning';
      } else if (value === 'SCHEDULED') {
        variant = 'warning';
      } else {
        variant = 'unknown';
      }

      // Split the value by underscore, capitalize the first letter of each part, and join them with a space
      const valueLabel = value
        .split('_') // Split the string by underscores
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        ) // Capitalize each word
        .join(' '); // Join them back with spaces

      return <Badge variant={variant}>{valueLabel}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'Started',
    accessorFn: (row) => row.startedAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Started" />
    ),
    cell: ({ getValue }) => {
      return (
        <div className="flex -space-y-0.5 flex-col">
          <span className="max-w-[500px] truncate font-medium">
            {toLocaleStringOrUndefined(getValue() as Date)}
          </span>
          <span className="max-w-[500px] truncate font-xs text-muted-foreground">
            {timeAgo(getValue() as Date)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'Stopped',
    accessorFn: (row) => row.stoppedAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stopped" />
    ),
    cell: ({ getValue }) => {
      return (
        <div className="flex -space-y-0.5 flex-col">
          <span className="max-w-[500px] truncate font-medium">
            {toLocaleStringOrUndefined(getValue() as Date)}
          </span>
          <span className="max-w-[500px] truncate font-xs text-muted-foreground">
            {timeAgo(newDateOrUndefined(getValue() as string)!)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
