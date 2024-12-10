import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Button } from '../../../../components/ui/button';
import { Tooltip } from '../../../../components/ui/tooltip';
import { columns } from '../../../executions/components/table/executions-table-columns';

type Props = {
  projectId: string;
};

export function ProjectDetailsSectionRecentExecutions(props: Props) {
  const { data: executions, isLoading: isLoadingExecutions } = useApiQuery({
    service: 'executions',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${props.projectId}`],
        },
      },
    },
  });

  const slicedExecutions = useMemo(() => executions?.slice(0, 5), [executions]);

  if (isLoadingExecutions || !slicedExecutions) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6 max-w-full">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold space-x-2">
          <span>Recent Executions</span>
          <Tooltip>
            <Tooltip.Trigger>
              <Icons.questionMarkCircled className="size-4 text-muted-foreground" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div className="text-sm">
                <p>These are the recent executions for this project.</p>
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
          <Link to={`executions`}>View all</Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        isLoading={false}
        data={slicedExecutions}
        hideToolbar
        hideTablePagination
        emptyPlaceholder={
          <EmptyPlaceholder
            icon={<Icons.executions />}
            title="No Executions"
            description="Once your workflows run, you'll see the executions here."
          />
        }
      />
    </div>
  );
}
