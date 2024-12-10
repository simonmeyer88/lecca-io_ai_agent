import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { SelectProjectForAgentForm } from '../../../../components/forms/select-project-for-agent-form';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Button } from '../../../../components/ui/button';
import { Dialog } from '../../../../components/ui/dialog';
import { Tooltip } from '../../../../components/ui/tooltip';
import { columns } from '../../../agents/components/table/agents-table-columns';

type Props = {
  projectId: string;
};

export function ProjectDetailsSectionRecentAgents(props: Props) {
  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  if (isLoadingAgents || !agents) {
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
          <span>Agents</span>
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.questionMarkCircled className="size-4 text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div className="text-sm">
                <p>These are the agents in this project.</p>
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
          <Link to={`/projects/${props.projectId}/agents`}>View all</Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        isLoading={false}
        data={agents}
        hideToolbar={agents.length < 10}
        hideTablePagination={agents.length < 10}
        defaultPageSize={10}
        emptyPlaceholder={
          <Dialog>
            <EmptyPlaceholder
              icon={<Icons.agent />}
              title="No Agents"
              description="To create an agent, click below"
              buttonLabel="New Agent"
              isDialogTrigger
            />
            <Dialog.Content>
              <SelectProjectForAgentForm />
            </Dialog.Content>
          </Dialog>
        }
      />
    </div>
  );
}
