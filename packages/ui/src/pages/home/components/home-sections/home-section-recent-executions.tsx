import { useMemo } from 'react';

import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { Icons } from '../../../../components/icons';
import { TableLoader } from '../../../../components/loaders/table-loader';
import { Tooltip } from '../../../../components/ui/tooltip';
import { columns } from '../../../executions/components/table/executions-table-columns';

export function HomeSectionRecentExecutions() {
  const { data: executions, isLoading: isLoadingExecutions } = useApiQuery({
    service: 'executions',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const slicedExecutions = useMemo(() => executions?.slice(0, 5), [executions]);

  if (isLoadingExecutions || !slicedExecutions) {
    return (
      <div className="w-full">
        <TableLoader exactLength={5} />
      </div>
    );
  }

  if (!slicedExecutions.length) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <h2 className="text-2xl font-semibold space-x-2 flex items-center">
        <span>Recent Executions</span>
      </h2>
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

export function AdminHomeSectionRecentExecutions() {
  const { data: executions, isLoading: isLoadingExecutions } = useApiQuery({
    service: 'executions',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          includeType: ['all'],
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
    <div className="w-full flex flex-col space-y-6">
      <h2 className="text-lg font-semibold space-x-2">
        <span>Recent Executions</span>
        <Tooltip>
          <Tooltip.Trigger>
            <Icons.questionMarkCircled className="size-4 text-muted-foreground" />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <div className="text-sm">
              <p>These are the recent executions for your workspace</p>
            </div>
          </Tooltip.Content>
        </Tooltip>
      </h2>
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
