import React from 'react';

import useApiQuery from '../../../../api/use-api-query';
import { DataTable } from '../../../../components/data-table/data-table';
import { DataTableToolbarAction } from '../../../../components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '../../../../components/empty-placeholder';
import { SelectProjectForWorkflowForm } from '../../../../components/forms/select-project-for-workflow-form';
import { Icons } from '../../../../components/icons';
import { Dialog } from '../../../../components/ui/dialog';
import { useUser } from '../../../../hooks/useUser';

import { columns } from './workflows-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export default function WorkflowsTableWithData() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>([]);

  return (
    <WorkflowsTable
      includeTypes={includeTypes}
      setIncludeTypes={setIncludeTypes}
    />
  );
}

function WorkflowsTable(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          includeType: [...props.includeTypes, 'internal'],
        },
      },
    },
  });

  return (
    <DataTable
      columns={columns}
      isLoading={isLoading}
      data={data?.filter((d) => !d.isInternal)}
      toolbarActions={
        workspaceUser?.roles.includes('MAINTAINER')
          ? [
              <DataTableToolbarAction
                key="create"
                title="Filters"
                Icon={Icons.filter}
                options={[
                  {
                    label: 'All Workflows',
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
  );
}
