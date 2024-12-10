import React from 'react';

import { appQueryClient } from '../../../../api/api-library';
import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { DataTableToolbarAction } from '../../../../components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { Icons } from '../../../../components/icons';
import { Button } from '../../../../components/ui/button';
import { useUser } from '../../../../hooks/useUser';

import { columns } from './tasks-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export default function TasksTableWithData() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>([]);

  return (
    <TasksTable includeTypes={includeTypes} setIncludeTypes={setIncludeTypes} />
  );
}

function TasksTable(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'tasks',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          includeType: props.includeTypes,
        },
      },
    },
  });

  return (
    <DataTable
      columns={columns}
      isLoading={isLoading}
      data={data}
      toolbarActions={
        workspaceUser?.roles.includes('MAINTAINER')
          ? [
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="space-x-1 group"
                onClick={() => {
                  appQueryClient.invalidateQueries({
                    queryKey: ['tasks', 'getList'],
                  });
                }}
              >
                <span className="group-hover:text-primary text-muted-foreground">
                  Refresh Data
                </span>
                {isLoading ? (
                  <Icons.spinner className="group-hover:text-primary text-muted-foreground size-3 animate-spin" />
                ) : (
                  <Icons.refresh className="group-hover:text-primary text-muted-foreground size-3" />
                )}
              </Button>,
              <DataTableToolbarAction
                key="create"
                title="Filters"
                Icon={Icons.filter}
                options={[
                  {
                    label: 'All Conversations',
                    value: 'all',
                  },
                ]}
                selectedValues={props.includeTypes}
                onChange={(values) => props.setIncludeTypes(values)}
              />,
            ]
          : []
      }
      emptyPlaceholder={
        <EmptyPlaceholder
          icon={<Icons.chat />}
          title="No Conversations"
          description="Chat with your Agents or Message them within Workflows to see conversations here."
        />
      }
    />
  );
}
