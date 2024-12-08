import { Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Icons } from '@/components/icons';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { UpdateAgentType } from '@/models/agent/agent-model';
import { Workflow } from '@/models/workflow/workflow-model';
import { columns } from '@/pages/workflows/components/table/workflows-table-columns';

import { AddAgentWorkflowForm } from './add-agent-workflow-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderWorkflowContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledWorkflowIds = form.watch('workflowIds');
  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`, `agentCanTrigger:${true}`],
        },
      },
    },
  });

  const enabledWorkflows = useMemo(() => {
    return (
      workflows?.filter((w) => (enabledWorkflowIds ?? []).includes(w.id)) ?? []
    );
  }, [workflows, enabledWorkflowIds]);

  const addAgentCallback = (values: { workflowId: string }) => {
    form.setValue('workflowIds', [
      ...((form.getValues('workflowIds') as string[]) ?? []),
      values.workflowId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (workflowId: string) => {
      form.setValue(
        'workflowIds',
        ((form.getValues('workflowIds') as string[]) ?? []).filter(
          (id) => id !== workflowId,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentWorkflowColumns = useMemo(() => {
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
          <span>Workflows</span>
          <div className="space-x-2 flex items-center">
            <Button variant={'ghost'} asChild>
              <Link
                to={`/projects/${projectId}/workflows/new`}
                className="space-x-2"
              >
                <span>Create Workflow</span>
                <Icons.plus />
              </Link>
            </Button>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.workflow className="mr-2 size-4" />
                  <span>Enable Workflow</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentWorkflowForm
                  onSubmit={addAgentCallback}
                  enabledWorkflowIds={enabledWorkflowIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Give your agent access to your workflows.
          <br />
          Your agent will be able to trigger these workflows for you.
          <br />
          <br />
          The <strong>name</strong> and <strong>description</strong> of the
          workflow will be displayed to the agent so it can determine when to
          execute it.
          <br />
          <br />
          Only workflows with a <strong>Manually Run</strong> or{' '}
          <strong>Recurring Schedule</strong> Trigger can be enabled for agents.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingWorkflows}
          columns={agentWorkflowColumns}
          data={enabledWorkflows!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Workflow"
                description="Give your agent access to your workflows."
                isDialogTrigger
                title="No Workflows Enabled"
                icon={<Icons.workflow />}
              />
              <Dialog.Content>
                <AddAgentWorkflowForm
                  onSubmit={addAgentCallback}
                  enabledWorkflowIds={enabledWorkflowIds}
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
  row: Row<Workflow>;
  onRemove: (workflowId: string) => void;
}) {
  const navigate = useNavigate();

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
        <DropdownMenu.Item
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/workflows/${row.original.id}`);
          }}
        >
          Open
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              Remove Workflow
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Remove</AlertDialog.Title>
              <AlertDialog.Description>
                This agent will no longer be able to use this workflow.
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
