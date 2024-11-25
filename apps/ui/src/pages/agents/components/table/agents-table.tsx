import React from 'react';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { SelectProjectForAgentForm } from '@/components/forms/select-project-for-agent-form';
import { Icons } from '@/components/icons';
import { Dialog } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useUser';

import { columns } from './agents-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export function AgentsTableWithData() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>([]);

  return (
    <AgentsTable
      includeTypes={includeTypes}
      setIncludeTypes={setIncludeTypes}
    />
  );
}

function AgentsTable(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'agents',
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
              <DataTableToolbarAction
                key="create"
                title="Filters"
                Icon={Icons.filter}
                options={[
                  {
                    label: 'All Agents',
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
        <Dialog>
          <EmptyPlaceholder
            icon={<Icons.agent />}
            title="No Agents"
            description="To create an agent, click below"
            isDialogTrigger
            buttonLabel="New Agent"
          />
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>
      }
    />
  );
}
