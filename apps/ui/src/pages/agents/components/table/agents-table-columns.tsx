import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Dialog } from '@/components/ui/dialog';
import { Popover } from '@/components/ui/popover';
import { Agent } from '@/models/agent/agent-model';
import { AppOverviewContent } from '@/pages/apps/components/app-overview-content';
import { toLocaleDateStringOrUndefined } from '@/utils/dates';

import { DataTableRowActions } from './agents-table-row-actions';

export const columns: ColumnDef<Agent>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue, row }) => {
      const description = row.original.description;

      return (
        <div className="flex items-center space-x-4">
          <Link
            to={`/projects/${row.original.project?.id}/agents/${row.original.id}`}
          >
            <div className="flex space-x-2 text-blue-400 hover:underline">
              <span className="max-w-[500px] truncate ">
                {getValue() as string}
              </span>
            </div>
          </Link>
          {description && (
            <Popover>
              <Popover.Trigger>
                <Icons.infoCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Popover.Trigger>
              <Popover.Content>
                <div className="p-4 text-sm">
                  <p>{description}</p>
                </div>
              </Popover.Content>
            </Popover>
          )}
        </div>
      );
    },
  },
  {
    id: 'Apps',
    accessorFn: (row) => row.connections,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" className="border-r" />
    ),
    cell: ({ getValue }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: apps, isLoading: isLoadingApps } = useApiQuery({
        service: 'workflowApps',
        method: 'getList',
        apiLibraryArgs: {},
      });

      const { data: connections, isLoading: isLoadingConnections } =
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useApiQuery({
          service: 'connections',
          method: 'getList',
          apiLibraryArgs: {
            config: {
              params: {
                includeType: ['all'],
              },
            },
          },
        });

      const agentConnections = getValue() as Agent['connections'];

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const workflowApps = useMemo(() => {
        const fullAgentConnections = connections?.filter((connection) =>
          agentConnections?.some(
            (agentConnection) => agentConnection.id === connection.id,
          ),
        );

        return fullAgentConnections?.map((connection) => {
          const app = apps?.find((app) => app.id === connection.workflowAppId);
          return app;
        });
      }, [agentConnections, apps, connections]);

      if (isLoadingApps || isLoadingConnections || !workflowApps) {
        return null;
      }

      return (
        <Avatar.Group limit={3} className="items-center mr-4">
          <Avatar.GroupList>
            {workflowApps!.map((app, index) => {
              return (
                <Avatar
                  key={app!.id + index}
                  className="flex items-center justify-center border rounded-full bg-background cursor-pointer"
                >
                  <Dialog>
                    <Dialog.Trigger asChild>
                      <Avatar.Image
                        src={app!.logoUrl ?? undefined}
                        className="rounded-none object-contain size-5"
                      />
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <AppOverviewContent app={app!} />
                    </Dialog.Content>
                  </Dialog>
                </Avatar>
              );
            })}
          </Avatar.GroupList>
          <Popover>
            <Popover.Trigger asChild>
              <Avatar.OverflowIndicator className="border cursor-pointer object-contain size-9" />
            </Popover.Trigger>
            <Popover.Content>
              <div className="p-4 text-sm">
                <p>
                  {workflowApps
                    .slice(3)!
                    .map((app) => app!.name)
                    .join(', ')}
                </p>
              </div>
            </Popover.Content>
          </Popover>
        </Avatar.Group>
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
    id: 'Last Updated',
    accessorFn: (row) => row.updatedAt,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ getValue }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate ">
            {toLocaleDateStringOrUndefined(getValue() as Date)}
          </span>
        </div>
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
          <span className="max-w-[500px] truncate ">
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
