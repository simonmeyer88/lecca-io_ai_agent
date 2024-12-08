import { Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { Icons } from '@/components/icons';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { UpdateAgentType } from '@/models/agent/agent-model';
import { Connection } from '@/models/connections-model';
import { columns } from '@/pages/connections/table/connections-table-columns';

import { AddAgentConnectionForm } from './add-agent-connection-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderConnectionsContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledConnectionIds = form.watch('connectionIds');
  const { data: connections, isLoading: isLoadingConnections } = useApiQuery({
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

  const enabledConnections = useMemo(() => {
    return (
      connections?.filter((connection) =>
        (enabledConnectionIds ?? []).includes(connection.id),
      ) ?? []
    );
  }, [connections, enabledConnectionIds]);

  const addAgentCallback = (values: { connectionId: string }) => {
    form.setValue('connectionIds', [
      ...((form.getValues('connectionIds') as string[]) ?? []),
      values.connectionId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (connectionId: string) => {
      form.setValue(
        'connectionIds',
        ((form.getValues('connectionIds') as string[]) ?? []).filter(
          (id) => id !== connectionId,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentConnectionColumns = useMemo(() => {
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
          <span>Connections</span>
          <div className="space-x-2 flex items-center">
            <Dialog>
              <Dialog.Trigger asChild>
                <Button variant={'ghost'} className="space-x-1">
                  <span>Create Connection</span>
                  <Icons.plus />
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <CreateConnectionForm />
              </Dialog.Content>
            </Dialog>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.link className="mr-2 size-4" />
                  <span>Enable Connection</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentConnectionForm
                  onSubmit={addAgentCallback}
                  enabledConnectionIds={enabledConnectionIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Give your agent access to your connections.
          <br />
          Then on the <strong>Actions</strong> tab, setup actions using these
          connections
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingConnections}
          columns={agentConnectionColumns}
          data={enabledConnections!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Connection"
                description="Give your agent access to your connections."
                isDialogTrigger
                title="No Connections Enabled"
                icon={<Icons.link />}
              />
              <Dialog.Content>
                <AddAgentConnectionForm
                  onSubmit={addAgentCallback}
                  enabledConnectionIds={enabledConnectionIds}
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
                This agent will no longer be able to use this connection.
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
