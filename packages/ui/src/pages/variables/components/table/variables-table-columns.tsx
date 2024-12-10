import { ColumnDef } from '@tanstack/react-table';
import { isValid } from 'date-fns';
import { Link } from 'react-router-dom';

import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header';
import { UpdateVariableForm } from '../../../../components/forms/update-variable-form';
import { Icons } from '../../../../components/icons';
import { Badge } from '../../../../components/ui/badge';
import { Dialog } from '../../../../components/ui/dialog';
import { Popover } from '../../../../components/ui/popover';
import { Variable } from '../../../../models/variable-model';
import { toLocaleDateStringOrUndefined } from '../../../../utils/dates';

import { DataTableRowActions } from './variables-table-row-actions';

export const columns: ColumnDef<Variable>[] = [
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
            <UpdateVariableForm variableId={row.original.id} />
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
    id: 'Value',
    accessorFn: (row) => row.value,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ getValue }) => {
      let valueLabel = getValue();
      if (isValid(new Date(valueLabel as string))) {
        valueLabel = new Date(getValue() as string).toLocaleString();
      }

      if (typeof valueLabel === 'boolean') {
        valueLabel = valueLabel ? 'True' : 'False';
      }

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">{valueLabel as string}</span>
        </div>
      );
    },
  },
  {
    id: 'Data Type',
    accessorFn: (row) => row.dataType,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Data Type" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string;

      let valueLabel =
        value.charAt(0).toUpperCase() + value.slice(1).toLocaleLowerCase();

      if (valueLabel === 'String') {
        valueLabel = 'Text';
      }

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate">
            <Badge variant="outline">{valueLabel}</Badge>
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
