import { ColumnDef, Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Icons } from '@/components/icons';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { Popover } from '@/components/ui/popover';
import { UpdateAgentType } from '@/models/agent/agent-model';
import { Connection } from '@/models/connections-model';
import { WorkflowAppActionType } from '@/models/workflow/workflow-app-action-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';

import { AddAgentActionForm } from './add-agent-action-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderActionsContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledConnectionIds = form.watch('connectionIds');
  const enabledActionIds = form.watch('actionIds');

  const { data: apps, isLoading: isLoadingApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: connections } = useApiQuery({
    service: 'connections',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const enabledActions = useMemo(() => {
    return apps?.flatMap((app) =>
      app.actions
        .filter((action) => enabledActionIds?.includes(action.id))
        .map((action) => ({ ...action, workflowApp: app })),
    );
  }, [apps, enabledActionIds]);

  const enabledAppIds = useMemo(() => {
    return (
      connections?.filter((connection) =>
        (enabledConnectionIds ?? []).includes(connection.id),
      ) ?? []
    ).map((connection) => connection.workflowAppId!);
  }, [connections, enabledConnectionIds]);

  const addAgentCallback = (values: { actionId: string }) => {
    form.setValue('actionIds', [
      ...((form.getValues('actionIds') as string[]) ?? []),
      values.actionId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (actionId: string) => {
      form.setValue(
        'actionIds',
        ((form.getValues('actionIds') as string[]) ?? []).filter(
          (id) => id !== actionId,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentActionColumns = useMemo(() => {
    return [
      ...columns.filter((column) => column.id !== 'actions'),
      {
        id: 'actions',

        cell: ({ row }: any) => (
          <RowActions row={row} onRevoke={removeAgentCallback} />
        ),
      },
    ];
  }, [removeAgentCallback]);

  return (
    <div className="">
      <Form.Header>
        <Form.Title className="flex justify-between items-center">
          <span>Quick Actions</span>
          <div className="space-x-2">
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.app className="mr-2 size-4" />
                  <span>Enable Action</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentActionForm
                  onSubmit={addAgentCallback}
                  enabledAppIds={enabledAppIds}
                  enabledActionIds={enabledActionIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Select quick actions to enable.
          <br />
          When enabled, the agent will be able to peform these actions.
          <br />
          For more complex tools, use the workflow builder.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingApps}
          columns={agentActionColumns}
          data={enabledActions!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Action"
                description="Allow your agent to perform actions."
                isDialogTrigger
                title="No Actions Enabled"
                icon={<Icons.app />}
              />
              <Dialog.Content>
                <AddAgentActionForm
                  onSubmit={addAgentCallback}
                  enabledAppIds={enabledAppIds}
                  enabledActionIds={enabledActionIds}
                />
              </Dialog.Content>
            </Dialog>
          }
        />
      </Form.Content>
    </div>
  );
}

export function RowActions({
  row,
  onRevoke,
}: {
  row: Row<Connection>;
  onRevoke: (connectionId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <Icons.dotsHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              Revoke Access
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Revoke</AlertDialog.Title>
              <AlertDialog.Description>
                This agent will no longer be able to use this action.
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action
                onClick={async () => {
                  onRevoke(row.original.id);
                }}
              >
                Revoke
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<
  WorkflowAppActionType & { workflowApp: WorkflowApp }
>[] = [
  {
    id: 'Name',
    accessorFn: (row) => row.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ getValue }) => {
      return (
        <span className="max-w-[500px] truncate">{getValue() as string}</span>
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
];
