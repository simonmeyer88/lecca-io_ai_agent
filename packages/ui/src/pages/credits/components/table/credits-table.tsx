import React from 'react';

import { appQueryClient } from '@/api/api-library';
import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

import { columns } from './credits-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export default function CreditsTableWithData() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>([]);

  return (
    <CreditsTable
      includeTypes={includeTypes}
      setIncludeTypes={setIncludeTypes}
    />
  );
}

function CreditsTable(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'credits',
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
                    queryKey: ['credits', 'getList'],
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
                    label: 'All Usage',
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
          icon={<Icons.creditCard />}
          title="No Credit Usage"
          description="Once you start using credits, you'll see them here."
        />
      }
    />
  );
}
