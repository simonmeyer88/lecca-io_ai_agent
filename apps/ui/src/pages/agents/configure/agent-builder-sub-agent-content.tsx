import { Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { SelectProjectForAgentForm } from '@/components/forms/select-project-for-agent-form';
import { Icons } from '@/components/icons';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { Agent, UpdateAgentType } from '@/models/agent/agent-model';

import { columns } from '../components/table/agents-table-columns';

import { AddAgentSubAgentForm } from './add-agent-sub-agent-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderSubAgentContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledAgentIds = form.watch('agentIds');
  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  const enabledAgents = useMemo(() => {
    return agents?.filter((a) => (enabledAgentIds ?? []).includes(a.id)) ?? [];
  }, [agents, enabledAgentIds]);

  const addToAgentCallback = (values: { agentId: string }) => {
    form.setValue('agentIds', [
      ...((form.getValues('agentIds') as string[]) ?? []),
      values.agentId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (agentIds: string) => {
      form.setValue(
        'agentIds',
        ((form.getValues('agentIds') as string[]) ?? []).filter(
          (id) => id !== agentIds,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentColumns = useMemo(() => {
    return [
      ...columns.filter((column) => column.id !== 'actions'),
      {
        id: 'actions',
         
        cell: ({ row }: any) => (
          <RowActions row={row} onRemove={removeAgentCallback} />
        ),
      },
    ];
  }, [removeAgentCallback]);

  return (
    <div className="">
      <Form.Header>
        <Form.Title className="flex justify-between items-center">
          <span>Sub-Agents</span>
          <div className="space-x-2 flex items-center">
            <Dialog>
              <Dialog.Trigger asChild>
                <Button variant={'ghost'} className="space-x-2">
                  <span>Create Agent</span>
                  <Icons.plus />
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <SelectProjectForAgentForm />
              </Dialog.Content>
            </Dialog>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.agent className="mr-2 size-4" />
                  <span>Enable Sub-Agent</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentSubAgentForm
                  onSubmit={addToAgentCallback}
                  enabledSubAgentIds={enabledAgentIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Give your agent permission to message other agents.
          <br />
          The <strong>name</strong> and <strong>description</strong> of the
          sub-agent will be displayed to this agent so it can determine when to
          message it.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingAgents}
          columns={agentColumns}
          data={enabledAgents!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Sub-Agent"
                description="Give your agent permission to message another agent."
                isDialogTrigger
                title="No Sub-Agents Enabled"
                icon={<Icons.agent />}
              />
              <Dialog.Content>
                <AddAgentSubAgentForm
                  onSubmit={addToAgentCallback}
                  enabledSubAgentIds={enabledAgentIds}
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
  onRemove,
}: {
  row: Row<Agent>;
  onRemove: (agentIds: string) => void;
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
                Remove Sub-Agent
              </DropdownMenu.Item>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Remove</AlertDialog.Title>
                <AlertDialog.Description>
                  This agent will no longer be able to message this sub-agent.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action
                  onClick={async () => {
                    onRemove(row.original.id);
                  }}
                >
                  Remove
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog>
        </DropdownMenu.Content>
      </DropdownMenu>
  );
}
