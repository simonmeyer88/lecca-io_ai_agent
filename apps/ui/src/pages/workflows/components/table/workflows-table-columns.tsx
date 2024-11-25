import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Popover } from '@/components/ui/popover';
import { WorkflowAppActionType } from '@/models/workflow/workflow-app-action-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';
import { WorkflowAppTriggerType } from '@/models/workflow/workflow-app-trigger-model';
import { Workflow } from '@/models/workflow/workflow-model';
import { AppOverviewContent } from '@/pages/apps/components/app-overview-content';
import { cn } from '@/utils/cn';
import { toLocaleDateStringOrUndefined } from '@/utils/dates';

import { DataTableRowActions } from './workflows-table-row-actions';

export const columns: ColumnDef<Workflow>[] = [
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
            to={`/projects/${row.original.project.id}/workflows/${row.original.id}`}
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
    id: 'Steps',
    accessorFn: (row) => row.triggerAndActionIds,
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" className="border-r" />
    ),
    cell: ({ getValue }) => {
      /**
       * THIS IS SUPER INEFFICIENT
       * We should make this column a function that passed in the mapped values of all the app actions
       * and triggers so it's n0 intead of n^2.  If someone has hundreds of workflows, this will be super slow.
       */

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { data: apps, isLoading } = useApiQuery({
        service: 'workflowApps',
        method: 'getList',
        apiLibraryArgs: {},
      });

      const triggerAndActionIds = getValue() as string[];

      if (isLoading) {
        return null;
      }

      //Should create a map for this to be more efficient
      const triggerAndActions =
        triggerAndActionIds
          .map((id) => {
            let actionOrTrigger:
              | WorkflowAppActionType
              | WorkflowAppTriggerType
              | undefined;

            let foundApp: WorkflowApp | undefined;

            apps?.some((app) => {
              if (id.includes('_trigger_')) {
                const foundTrigger = app.triggers.find(
                  (trigger) => trigger.id === id,
                );
                if (foundTrigger) {
                  actionOrTrigger = foundTrigger;
                  foundApp = app;
                  return true;
                }
              }

              if (id.includes('_action_')) {
                const foundAction = app.actions.find(
                  (action) => action.id === id,
                );

                if (foundAction) {
                  actionOrTrigger = foundAction;
                  foundApp = app;
                  return true;
                }
              }

              return false;
            });

            return { app: foundApp, actionOrTrigger };
          })
          .filter(({ app, actionOrTrigger }) => app && actionOrTrigger) ??
        ([] as (WorkflowAppActionType | WorkflowAppTriggerType)[]);

      return (
        triggerAndActionIds && (
          <Avatar.Group limit={3} className="items-center mr-4">
            <Avatar.GroupList>
              {triggerAndActions!.map(({ actionOrTrigger, app }, index) => {
                return (
                  <Avatar
                    key={actionOrTrigger!.id + index}
                    className={cn(
                      'flex items-center justify-center border rounded-full bg-background cursor-pointer',
                      {
                        'dark:bg-accent-foreground dark:border-border/20 dark:invert':
                          actionOrTrigger?.iconUrl,
                      },
                    )}
                  >
                    <Dialog>
                      <Dialog.Trigger asChild>
                        <Avatar.Image
                          src={
                            actionOrTrigger!.iconUrl ??
                            app?.logoUrl ??
                            undefined
                          }
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
                    {triggerAndActions
                      .slice(3)!
                      .map(({ actionOrTrigger }) => actionOrTrigger!.name)
                      .join(', ')}
                  </p>
                </div>
              </Popover.Content>
            </Popover>
          </Avatar.Group>
        )
      );
    },
  },
  {
    id: 'Active',
    accessorFn: (row) => row.isActive,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ getValue }) => {
      let variant: 'good' | 'error' | 'warning' | 'unknown' = 'good';
      const value = getValue() as boolean;

      if (value === true) {
        variant = 'good';
      } else {
        variant = 'unknown';
      }

      //capitalize first letter
      const valueLabel = value ? 'Active' : 'Inactive';

      return <Badge variant={variant}>{valueLabel}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) === true ? 'active' : 'inactive');
    },
  },
  {
    id: 'Project',
    accessorFn: (row) => row.project.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
    cell: ({ getValue, row }) => {
      return (
        <Link to={`/projects/${row.original.project.id}`}>
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
