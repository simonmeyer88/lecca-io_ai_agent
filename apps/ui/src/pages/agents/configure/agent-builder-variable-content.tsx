import { Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

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
import { Variable } from '@/models/variable-model';
import { columns } from '@/pages/variables/components/table/variables-table-columns';

import { AddAgentVariableForm } from './add-agent-variable-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderVariableContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledVariableIds = form.watch('variableIds');
  const { data: variables, isLoading: isLoadingVariables } = useApiQuery({
    service: 'variables',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const enabledVariables = useMemo(() => {
    return (
      variables?.filter((k) => (enabledVariableIds ?? []).includes(k.id)) ?? []
    );
  }, [variables, enabledVariableIds]);

  const addToAgentCallback = (values: { variableId: string }) => {
    form.setValue('variableIds', [
      ...((form.getValues('variableIds') as string[]) ?? []),
      values.variableId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (variableIds: string) => {
      form.setValue(
        'variableIds',
        ((form.getValues('variableIds') as string[]) ?? []).filter(
          (id) => id !== variableIds,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentVariableColumns = useMemo(() => {
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
          <span>Variables</span>
          <div className="space-x-2">
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.braces className="mr-2 size-4" />
                  <span>Enable Variable</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentVariableForm
                  onSubmit={addToAgentCallback}
                  enabledVariableIds={enabledVariableIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Give your agent access to your variables.
          <br />
          Your agent will use these variables when performing tasks for you.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingVariables}
          columns={agentVariableColumns}
          data={enabledVariables!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Variable"
                description="Give your agent access to your variables."
                isDialogTrigger
                title="No Variables Enabled"
                icon={<Icons.braces />}
              />
              <Dialog.Content>
                <AddAgentVariableForm
                  onSubmit={addToAgentCallback}
                  enabledVariableIds={enabledVariableIds}
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
  row: Row<Variable>;
  onRemove: (variableIds: string) => void;
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
              Remove Variable
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Remove</AlertDialog.Title>
              <AlertDialog.Description>
                This agent will no longer be able to use this variable.
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
