import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from '../../../../../components/data-table/data-table-column-header';
import { Icons } from '../../../../../components/icons';
import { Dialog } from '../../../../../components/ui/dialog';
import { Popover } from '../../../../../components/ui/popover';
import { KnowledgeVectorRef } from '../../../../../models/knowledge-vector-ref-model';
import { toLocaleDateStringOrUndefined } from '../../../../../utils/dates';
import { ViewVectorRefDataContent } from '../view-vector-ref-data-content';

import { DataTableRowActions } from './vector-ref-table-row-actions';

export const columns: ColumnDef<KnowledgeVectorRef>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row, getValue }) => {
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
            <ViewVectorRefDataContent vectorRefId={row.original.id} />
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
    id: 'Batch',
    accessorFn: (row) => row.part,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Multipart" />
    ),
    cell: ({ getValue }) => {
      const partNumber = getValue() as number;

      if (partNumber) {
        return (
          <span className="max-w-[500px] truncate">
            #{getValue() as string}
          </span>
        );
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
