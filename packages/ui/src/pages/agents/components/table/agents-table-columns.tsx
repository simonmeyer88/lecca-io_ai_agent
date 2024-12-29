import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header';
import { Icons } from '../../../../components/icons';
import { Avatar } from '../../../../components/ui/avatar';
import { Dialog } from '../../../../components/ui/dialog';
import { Popover } from '../../../../components/ui/popover';
import { Agent } from '../../../../models/agent/agent-model';
import { WorkflowApp } from '../../../../models/workflow/workflow-app-model';
import { toLocaleDateStringOrUndefined } from '../../../../utils/dates';
import { AppOverviewContent } from '../../../apps/components/app-overview-content';

import { DataTableRowActions } from './agents-table-row-actions';

export const columns: ColumnDef<Agent>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" className="pl-10" />
    ),
    cell: ({ getValue, row }) => {
      const agent = row.original;

      return (
        <div className="flex items-center space-x-4">
          <Link to={`/projects/${agent.project?.id}/agents/${agent.id}`}>
            <div className="flex space-x-2 text-blue-400 hover:underline">
              <div className="flex items-center space-x-4 max-w-[500px]">
                <Avatar className="size-8 border">
                  <Avatar.Image
                    src={agent.profileImageUrl ?? undefined}
                    alt="Agent icon url"
                  />
                  <Avatar.Fallback className="text-muted-foreground">
                    <Icons.agent className="size-5" />
                  </Avatar.Fallback>
                </Avatar>
                <span className="truncate">{getValue() as string}</span>
              </div>
            </div>
          </Link>
          {agent.description && (
            <Popover>
              <Popover.Trigger>
                <Icons.infoCircle className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Popover.Trigger>
              <Popover.Content>
                <div className="p-4 text-sm">
                  <p>{agent.description}</p>
                </div>
              </Popover.Content>
            </Popover>
          )}
        </div>
      );
    },
  },
  {
    id: 'Tools',
    accessorFn: (row) => row.connections,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tools"
        className="border-r"
      />
    ),
    cell: ({ row }) => {
      const agent = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: apps, isLoading: isLoadingApps } = useApiQuery({
        service: 'workflowApps',
        method: 'getList',
        apiLibraryArgs: {},
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const mappedApps = useMemo(() => {
        if (!apps) {
          return {};
        }

        return apps.reduce(
          (acc, app) => {
            acc[app.id] = app;
            return acc;
          },
          {} as { [key: string]: WorkflowApp },
        );
      }, [apps]);

      if (isLoadingApps) {
        return null;
      }

      return (
        <Avatar.Group limit={3} className="items-center mr-4">
          <Avatar.GroupList>
            {agent.toolIds!.map((toolId, index) => {
              const appId = toolId.split('_action_')[0];

              const app = mappedApps[appId];
              const action = app?.actions.find((a) => a.id === toolId);

              const imgUrl = action?.iconUrl ?? app?.logoUrl;

              return (
                <Avatar
                  key={app!.id + index}
                  className="flex items-center justify-center border rounded-full bg-background cursor-pointer"
                >
                  <Dialog>
                    <Dialog.Trigger asChild>
                      <Avatar.Image
                        src={imgUrl}
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
          <Avatar.OverflowIndicator className="border cursor-pointer object-contain size-9" />
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
