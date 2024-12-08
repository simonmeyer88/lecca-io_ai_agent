import { Link, useNavigate } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Icons } from '@/components/icons';
import { TableLoader } from '@/components/loaders/table-loader';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { columns } from '@/pages/workflows/components/table/workflows-table-columns';

type Props = {
  projectId: string;
};

export function ProjectDetailsSectionRecentWorkflows(props: Props) {
  const navigate = useNavigate();
  const { data: workflows, isLoading: isLoadingWorkflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  if (isLoadingWorkflows || !workflows) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold space-x-2">
          <span>Workflows</span>
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.questionMarkCircled className="size-4 text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div className="text-sm">
                <p>These are the workflows in this project.</p>
              </div>
            </Tooltip.Content>
          </Tooltip>
        </h2>
        <Button
          variant={'expandIconOutline'}
          Icon={Icons.arrowRight}
          size={'sm'}
          iconPlacement="right"
          asChild
        >
          <Link to={`/projects/${props.projectId}/workflows`}>View all</Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        isLoading={false}
        data={workflows}
        hideToolbar={workflows.length < 10}
        hideTablePagination={workflows.length < 10}
        defaultPageSize={10}
        emptyPlaceholder={
          <EmptyPlaceholder
            icon={<Icons.workflow />}
            title="No Workflows"
            description="To create a workflow, click below"
            buttonLabel="New Workflow"
            onClick={() => {
              navigate(`/projects/${props.projectId}/workflows/new`);
            }}
          />
        }
      />
    </div>
  );
}
