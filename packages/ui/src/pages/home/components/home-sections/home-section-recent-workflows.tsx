import { useMemo } from 'react';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { SelectProjectForAgentForm } from '@/components/forms/select-project-for-agent-form';
import { SelectProjectForWorkflowForm } from '@/components/forms/select-project-for-workflow-form';
import { Icons } from '@/components/icons';
import { TableLoader } from '@/components/loaders/table-loader';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { columns } from '@/pages/workflows/components/table/workflows-table-columns';

export function HomeSectionRecentWorkflows() {
  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getRecentWorkflowsForUser',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        //This is so that if someone makes a project and goes into a workflow,
        //the workflow will show up in the recent workflows immediately.
        staleTime: 1000 * 60 * 0, //0 minutes
      },
    },
  });

  const slicedWorkflows = useMemo(() => workflows?.slice(0, 5), [workflows]);

  if (isLoadingWorkflows || !slicedWorkflows) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  if (slicedWorkflows.length === 0) {
    return (
      <div className="w-full flex flex-col space-y-6 my-8">
        <h2 className="text-2xl font-bold">Create your first automation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          <Dialog>
            <Dialog.Trigger>
              <Card
                onClick={() => {
                  //To add hover effect
                }}
                className="h-full ring-2"
              >
                <Card.Header className="pb-2">
                  <Card.Title className="flex space-x-2 items-center">
                    <Icons.agent className="h-6 w-6" />
                    <span className="text-xl">New Agent</span>
                  </Card.Title>
                </Card.Header>
                <Card.Content className="text-left flex justify-between items-center">
                  <span className="flex-[3]">
                    Create an AI Agent to perform tasks for you.
                  </span>
                  <Icons.plus className="flex-1 size-12 text-muted-foreground animate-pulse" />
                </Card.Content>
              </Card>
            </Dialog.Trigger>
            <Dialog.Content>
              <SelectProjectForAgentForm />
            </Dialog.Content>
          </Dialog>
          <Dialog>
            <Dialog.Trigger>
              <Card
                onClick={() => {
                  //To add hover effect
                }}
                className="h-full ring-2"
              >
                <Card.Header className="pb-2">
                  <Card.Title className="flex space-x-2 items-center">
                    <Icons.workflow className="h-6 w-6" />
                    <span className="text-xl">New Workflow</span>
                  </Card.Title>
                </Card.Header>
                <Card.Content className="text-left flex justify-between items-center">
                  <span className="flex-[3]">
                    Create an automation with a trigger and actions.
                  </span>
                  <Icons.plus className="flex-1 size-12 text-muted-foreground animate-pulse" />
                </Card.Content>
              </Card>
            </Dialog.Trigger>
            <Dialog.Content>
              <SelectProjectForWorkflowForm />
            </Dialog.Content>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6 my-8">
      <h2 className="text-2xl font-bold space-x-2">
        <span>Recent Workflows</span>
        <Tooltip>
          <Tooltip.Trigger>
            <Icons.questionMarkCircled className="size-4 text-muted-foreground" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <div className="text-sm">
              <p>
                These are the workflows you have recently created or interacted
                with.
              </p>
            </div>
          </Tooltip.Content>
        </Tooltip>
      </h2>
      <DataTable
        columns={columns}
        isLoading={false}
        data={slicedWorkflows}
        hideToolbar
        hideTablePagination
        emptyPlaceholder={
          <Dialog>
            <EmptyPlaceholder
              icon={<Icons.workflow />}
              title="No Workflows"
              description="To create a workflow, click below"
              isDialogTrigger
              buttonLabel="New Workflow"
            />
            <Dialog.Content>
              <SelectProjectForWorkflowForm />
            </Dialog.Content>
          </Dialog>
        }
      />
    </div>
  );
}
