 
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Popover } from '@/components/ui/popover';
import { Project } from '@/models/project/project-model';
import { toLocaleDateStringOrUndefined } from '@/utils/dates';

import { DataTableRowActions } from './projects-table-row-actions';

export const columns: ColumnDef<Project>[] = [
  {
    id: 'Name',
    accessorFn: (row) => (row as any).name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/projects/${row.original.id}`}>
          <div className="flex space-x-2 text-blue-400 hover:underline">
            <span className="max-w-[500px] truncate">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Description',
    accessorFn: (row) => row.description,
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
    id: 'Created',
    accessorFn: (row) => (row as any).createdAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ getValue }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            {toLocaleDateStringOrUndefined(getValue() as string)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'Updated',
    accessorFn: (row) => (row as any).updatedAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modified" />
    ),
    cell: ({ getValue }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            {toLocaleDateStringOrUndefined(getValue() as Date)}
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
