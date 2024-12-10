import { useParams } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { DataTable } from '../../components/data-table/data-table';
import { EmptyPlaceholder } from '../../components/empty-placeholder';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { PageLoader } from '../../components/loaders/page-loader';
import { TableLoader } from '../../components/loaders/table-loader';
import { columns } from '../executions/components/table/executions-table-columns';

import { NavProjectSelector } from './components/nav-selectors/nav-project-selector';

export function ProjectExecutionsPage() {
  const { projectId } = useParams();

  const { data: project, isLoading: isLoadingProject } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: { id: projectId! },
  });

  const { data: executions, isLoading: isLoadingExecutions } = useApiQuery({
    service: 'executions',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  if (isLoadingProject) {
    return (
      <PageLoader>
        <TableLoader />
      </PageLoader>
    );
  }

  return (
    <PageLayout
      title={'Executions'}
      breadcrumbs={[
        {
          href: '/projects',
          label: 'Projects',
        },
        {
          href: `/projects/${projectId}`,
          label: project?.name || 'Unknown Project Name',
          additionalButton: <NavProjectSelector />,
        },
      ]}
      className="space-y-6"
    >
      <DataTable
        columns={columns}
        isLoading={isLoadingExecutions}
        data={executions}
        emptyPlaceholder={
          <EmptyPlaceholder
            icon={<Icons.executions />}
            title="No Executions"
            description="Once your executions run, you'll see the executions here."
          />
        }
      />
    </PageLayout>
  );
}
