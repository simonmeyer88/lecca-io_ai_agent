import React, { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import useApiQuery from '../../../api/use-api-query';
import PageLayout from '../../../components/layouts/page-layout';
import { PageSideNavLink } from '../../../components/layouts/page-side-nav';
import { Loader } from '../../../components/loaders/loader';
import { NavProjectSelector } from '../../projects/components/nav-selectors/nav-project-selector';
import { NavWorkflowSelector } from '../../projects/components/nav-selectors/nav-workflow-selector';

export function WorkflowSettingsLayout() {
  const { projectId, workflowId } = useParams();
  const { data: project } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: {
      id: projectId!,
    },
  });
  const { data: workflow, isLoading: isLoadingWorkflow } = useApiQuery({
    service: 'workflows',
    method: 'getById',
    apiLibraryArgs: {
      id: workflowId!,
    },
  });

  const leftRailNavigationItems: React.ReactNode[] = useMemo(
    () => [
      <PageSideNavLink
        item={{
          title: 'General',
          to: `/projects/${projectId}/workflows/${workflowId}/settings`,
        }}
      />,
    ],
    [projectId, workflowId],
  );

  if (isLoadingWorkflow) {
    return <Loader />;
  }

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return (
    <PageLayout
      title="Settings"
      breadcrumbs={[
        {
          label: 'Projects',
          href: '/projects',
        },
        {
          label: project?.name || '',
          href: `/projects/${projectId}`,
          additionalButton: <NavProjectSelector />,
        },
        {
          label: 'Workflows',
          href: `/projects/${projectId}/workflows`,
        },
        {
          label: workflow.name,
          href: `/projects/${projectId}/workflows/${workflowId}`,
          additionalButton: <NavWorkflowSelector />,
        },
      ]}
      leftRailNavigationItems={leftRailNavigationItems}
    >
      <Outlet />
    </PageLayout>
  );
}
