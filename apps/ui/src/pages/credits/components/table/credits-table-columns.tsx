import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Credit } from '@/models/credits-model';
import { toLocaleStringOrUndefined } from '@/utils/dates';

import { CreditDetailsDialogContent } from '../credit-details-dialog-content';

import { DataTableRowActions } from './credits-table-row-actions';

export const columns: ColumnDef<Credit>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.createdAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Dialog>
          <Dialog.Trigger className="cursor-pointer">
            <div className="flex -space-y-0.5 flex-col">
              <span className="max-w-[500px] truncate font-medium">
                {toLocaleStringOrUndefined(getValue() as Date)}
              </span>
            </div>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreditDetailsDialogContent creditId={row.original.id} />
          </Dialog.Content>
        </Dialog>
      );
    },
  },
  {
    id: 'Credits Used',
    accessorFn: (row) => row.creditsUsed,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Credits Used" />
    ),
    cell: ({ getValue, row }) => {
      const credits = getValue() as number;

      return (
        <Dialog>
          <Dialog.Trigger className="cursor-pointer">
            <div className="flex space-x-2">
              <span className="max-w-[500px] truncate">
                <Badge variant="outline">{`${credits} ${credits === 1 ? 'credit' : 'credits'}`}</Badge>
              </span>
            </div>
          </Dialog.Trigger>
          <Dialog.Content>
            <CreditDetailsDialogContent creditId={row.original.id} />
          </Dialog.Content>
        </Dialog>
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
            <span className="max-w-[500px] truncate hover:underline">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Conversation',
    accessorFn: (row) => row.task?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Conversation" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/tasks/${row.original.task?.id}`}>
          <div className="flex space-x-2 items-center">
            <span className="max-w-[500px] truncate hover:underline">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Execution',
    accessorFn: (row) => row.execution?.executionNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Execution" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/executions/${row.original.execution?.id}`}>
          <div className="flex space-x-2 items-center">
            <span className="max-w-[500px] truncate hover:underline">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'Knowledge',
    accessorFn: (row) => row.knowledge?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Knowledge" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/knowledge/${row.original.knowledge?.id}`}>
          <div className="flex space-x-2 items-center">
            <span className="max-w-[500px] truncate hover:underline">
              {getValue() as string}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
