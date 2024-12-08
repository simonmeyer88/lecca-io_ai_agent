import { Row } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { CreateKnowledgeForm } from '@/components/forms/create-knowledge-form';
import { Icons } from '@/components/icons';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { UpdateAgentType } from '@/models/agent/agent-model';
import { Knowledge } from '@/models/knowledge-model';
import { columns } from '@/pages/knowledge/components/table/knowledge-table-columns';

import { AddAgentKnowledgeForm } from './add-agent-knowledge-form';

type PropType = {
  form: UseFormReturn<UpdateAgentType>;
  save: () => void;
};

export function AgentBuilderKnowledgeContent({ form, save }: PropType) {
  const { projectId } = useParams();

  const enabledKnowledgeIds = form.watch('knowledgeIds');
  const { data: knowledge, isLoading: isLoadingKnowledge } = useApiQuery({
    service: 'knowledge',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectAccessId:${projectId}`],
        },
      },
    },
  });

  const enabledKnowledge = useMemo(() => {
    return (
      knowledge?.filter((k) => (enabledKnowledgeIds ?? []).includes(k.id)) ?? []
    );
  }, [knowledge, enabledKnowledgeIds]);

  const addAgentCallback = (values: { knowledgeId: string }) => {
    form.setValue('knowledgeIds', [
      ...((form.getValues('knowledgeIds') as string[]) ?? []),
      values.knowledgeId,
    ]);

    save();
  };

  const removeAgentCallback = useCallback(
    (knowledgeId: string) => {
      form.setValue(
        'knowledgeIds',
        ((form.getValues('knowledgeIds') as string[]) ?? []).filter(
          (id) => id !== knowledgeId,
        ),
      );

      save();
    },
    [form, save],
  );

  const agentKnowledgeColumns = useMemo(() => {
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
          <span>Knowledge</span>
          <div className="space-x-2 flex items-center">
            <Dialog>
              <Dialog.Trigger asChild>
                <Button variant={'ghost'} className="space-x-1">
                  <span>Create Notebook</span>
                  <Icons.plus />
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <CreateKnowledgeForm />
              </Dialog.Content>
            </Dialog>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button className="space-x-2" variant={'outline'} type="button">
                  <Icons.knowledge className="mr-2 size-4" />
                  <span>Enable Knowledge</span>
                </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <AddAgentKnowledgeForm
                  onSubmit={addAgentCallback}
                  enabledKnowledgeIds={enabledKnowledgeIds}
                />
              </Dialog.Content>
            </Dialog>
          </div>
        </Form.Title>
        <Form.Subtitle>
          Give your agent access to your knowledge notebooks.
          <br />
          Your agent will use this knowledge to perform tasks for you.
        </Form.Subtitle>
      </Form.Header>
      <Form.Content className="space-y-6">
        <DataTable
          defaultPageSize={10}
          isLoading={isLoadingKnowledge}
          columns={agentKnowledgeColumns}
          data={enabledKnowledge!}
          emptyPlaceholder={
            <Dialog>
              <EmptyPlaceholder
                buttonLabel="Enable Knowledge"
                description="Give your agent access to your knowledge notebooks."
                isDialogTrigger
                title="No Knowledge Enabled"
                icon={<Icons.knowledge />}
              />
              <Dialog.Content>
                <AddAgentKnowledgeForm
                  onSubmit={addAgentCallback}
                  enabledKnowledgeIds={enabledKnowledgeIds}
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
  row: Row<Knowledge>;
  onRemove: (knowledgeId: string) => void;
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
            navigate(`/knowledge/${row.original.id}`);
          }}
        >
          Open
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
              Remove Knowledge
            </DropdownMenu.Item>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Remove</AlertDialog.Title>
              <AlertDialog.Description>
                This agent will no longer be able to use this knowledge.
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
