import React from 'react';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { CreateConnectionForm } from '@/components/forms/create-connection-form';
import { Icons } from '@/components/icons';
import { Dialog } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useUser';

import { columns } from './connections-table-columns';

export function ConnectionsTable() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>(['all']);

  return (
    <Table includeTypes={includeTypes} setIncludeTypes={setIncludeTypes} />
  );
}

function Table(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'connections',
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
      isLoading={isLoading}
      columns={columns}
      data={data!}
      toolbarActions={[
        <DataTableToolbarAction
          key="create"
          title="Filters"
          Icon={Icons.filter}
          options={[
            workspaceUser?.roles.includes('MAINTAINER')
              ? {
                  label: 'All Connections',
                  value: 'all',
                }
              : {
                  label: 'Include All Workspace',
                  value: 'all',
                },
          ]}
          selectedValues={props.includeTypes}
          onChange={(values) => props.setIncludeTypes(values)}
        />,
      ]}
      emptyPlaceholder={
        <Dialog>
          <EmptyPlaceholder
            buttonLabel="New Connection"
            description="Add a new connection"
            isDialogTrigger
            title="No Connections"
            icon={<Icons.link />}
          />
          <Dialog.Content>
            <CreateConnectionForm />
          </Dialog.Content>
        </Dialog>
      }
    />
  );
}
