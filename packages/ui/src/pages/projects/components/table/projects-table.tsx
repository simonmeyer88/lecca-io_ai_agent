import React from 'react';

import useApiQuery from '@/api/use-api-query';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { CreateProjectForm } from '@/components/forms/create-project-form';
import { Icons } from '@/components/icons';
import { Dialog } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useUser';

import { columns } from './projects-table-columns';

/**
 * Returning this with a provider so that we can update the useApiQuery from within the table.
 * This is so includeTypes and filters can be changed.
 */
export default function ProjectsTableWithData() {
  const [includeTypes, setIncludeTypes] = React.useState<string[]>([]);

  return (
    <ProjectsTable
      includeTypes={includeTypes}
      setIncludeTypes={setIncludeTypes}
    />
  );
}

function ProjectsTable(props: {
  includeTypes: string[];
  setIncludeTypes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { workspaceUser, enabledFeatures } = useUser();
  const { isLoading, data } = useApiQuery({
    service: 'projects',
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
      columns={columns.filter((column) => {
        switch (column.id) {
          case 'Agents':
            return enabledFeatures.AGENTS;
          case 'Workflows':
            return enabledFeatures.WORKFLOWS;
          case 'Knowledge':
            return enabledFeatures.KNOWLEDGE;
          case 'Connections':
            return enabledFeatures.CONNECTIONS;
          case 'Variables':
            return enabledFeatures.VARIABLES;
          default:
            return true;
        }
      })}
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
                    label: 'All Projects',
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
            icon={<Icons.project />}
            title="No Projects"
            description="To create a project, click below"
            isDialogTrigger
            buttonLabel="New Project"
          />
          <Dialog.Content>
            <CreateProjectForm />
          </Dialog.Content>
        </Dialog>
      }
    />
  );
}
