import React from 'react';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { CreateKnowledgeForm } from '@/components/forms/create-knowledge-form';
import { Icons } from '@/components/icons';
import { Dialog } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useUser';

import { columns } from './knowledge-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export function KnowledgeTable() {
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
    service: 'knowledge',
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
      toolbarActions={[
        <DataTableToolbarAction
          key="create"
          title="Filters"
          Icon={Icons.filter}
          options={[
            workspaceUser?.roles.includes('MAINTAINER')
              ? {
                  label: 'All Knowledge Notebooks',
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
            icon={<Icons.knowledge />}
            title="No Knowledge"
            buttonLabel="Create Knowledge Notebook"
            isDialogTrigger
            description="Create notebooks that can be accessed by your AI Agents"
          />
          <Dialog.Content>
            <CreateKnowledgeForm />
          </Dialog.Content>
        </Dialog>
      }
    />
  );
}
