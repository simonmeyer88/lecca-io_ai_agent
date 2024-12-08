import React from 'react';

import useApiQuery from '@/api/use-api-query';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';

type ProjectAgentContextProps = {
  //
  workflowApps?: WorkflowApp[];
  workflowAppsLoading: boolean;
  mappedWorkflowApps?: { [key: string]: WorkflowApp };
};

export const ProjectAgentContext =
  React.createContext<ProjectAgentContextProps>({
    workflowApps: [],
    workflowAppsLoading: true,
    mappedWorkflowApps: {},
  });

export const ProjectAgentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: workflowApps, isLoading: workflowAppsLoading } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
    reactQueryArgs: {
      queries: {
        staleTime: 1000 * 60 * 60, //60 minutes
      },
    },
  });

  const mappedWorkflowApps = React.useMemo(() => {
    if (!workflowApps) {
      return {};
    }

    return workflowApps.reduce(
      (acc, app) => {
        acc[app.id] = app;
        return acc;
      },
      {} as { [key: string]: WorkflowApp },
    );
  }, [workflowApps]);

  return (
    <ProjectAgentContext.Provider
      value={{
        workflowAppsLoading,
        mappedWorkflowApps,
        workflowApps,
      }}
    >
      {children}
    </ProjectAgentContext.Provider>
  );
};
