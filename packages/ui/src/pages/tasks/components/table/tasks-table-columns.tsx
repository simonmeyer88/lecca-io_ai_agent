import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header';
import { Task } from '../../../../models/task/task-model';
import { timeAgo, toLocaleStringOrUndefined } from '../../../../utils/dates';

import { DataTableRowActions } from './tasks-table-row-actions';

export const columns: ColumnDef<Task>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/tasks/${row.original.id}`}>
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
    id: 'Agent',
    accessorFn: (row) => row.agent?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agent" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/agents/${row.original.agent?.id}`}>
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
    id: 'Created',
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
