import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { UpdateConnectionForm } from '@/components/forms/update-connection-form';
import { Icons } from '@/components/icons';
import { Dialog } from '@/components/ui/dialog';
import { Popover } from '@/components/ui/popover';
import { Connection } from '@/models/connections-model';
import { toLocaleDateStringOrUndefined } from '@/utils/dates';

import { DataTableRowActions } from './connections-table-row-actions';

export const columns: ColumnDef<Connection>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Dialog>
          <Dialog.Trigger className="cursor-pointer">
            <div className="flex space-x-2 text-blue-400 hover:underline">
              <span className="max-w-[500px] truncate">
                {getValue() as string}
              </span>
            </div>
          </Dialog.Trigger>
          <Dialog.Content>
            <UpdateConnectionForm connectionId={row.original.id} />
          </Dialog.Content>
        </Dialog>
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
    id: 'App',
    accessorFn: (row) => row.workflowApp?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="App" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <div className="flex space-x-2">
          <img
            src={row.original.workflowApp?.logoUrl}
            alt={row.original.workflowApp?.name}
            className="size-5 bg-white rounded p-[1px]"
          />
          <span className="max-w-[500px] truncate">{getValue() as string}</span>
        </div>
      );
    },
  },
  {
    id: 'Project',
    accessorFn: (row) => row.project?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/projects/${row.original.project?.id}`}>
          <div className="flex space-x-2 items-center">
            <span className="max-w-[500px] truncate">
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
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            {toLocaleDateStringOrUndefined(getValue() as Date)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'Updated',
    accessorFn: (row) => row.updatedAt,
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
