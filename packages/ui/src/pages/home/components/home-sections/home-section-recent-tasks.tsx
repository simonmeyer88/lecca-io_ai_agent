import { useMemo } from 'react';

import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { SelectProjectForWorkflowForm } from '../../../../components/forms/select-project-for-workflow-form';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Dialog } from '../../../../components/ui/dialog';
import { columns } from '../../../tasks/components/table/tasks-table-columns';

export function HomeSectionRecentTasks() {
  const { data: tasks, isLoading: isLoadingTasks } = useApiQuery({
    service: 'tasks',
    method: 'getList',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        staleTime: 1000 * 60 * 0, //0 minutes - immediately refetch when component is loaded.
      },
    },
  });

  //Once we have pagination we will just request the last 5 tasks.
  const slicedTasks = useMemo(() => tasks?.slice(0, 5), [tasks]);

  if (isLoadingTasks || !slicedTasks) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  if (!slicedTasks.length) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <h2 className="text-2xl font-bold space-x-2 flex items-center">
        <Icons.messageAgent className="size-6" />
        <span>Recent Conversations</span>
      </h2>
      <DataTable
        columns={columns}
        isLoading={false}
        data={slicedTasks}
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
