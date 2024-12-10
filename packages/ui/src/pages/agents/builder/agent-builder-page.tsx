import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { api, appQueryClient } from '../../../api/api-library';
import PageLayout from '../../../components/layouts/page-layout';
import { PageLoader } from '../../../components/loaders/page-loader';
import { Skeleton } from '../../../components/ui/skeleton';
import { useToast } from '../../../hooks/useToast';
import { Agent } from '../../../models/agent/agent-model';
import { Project } from '../../../models/project/project-model';
import { NavAgentSelector } from '../../projects/components/nav-selectors/nav-agent-selector';
import { NavProjectSelector } from '../../projects/components/nav-selectors/nav-project-selector';

import { AgentWorkflowContainer } from './agent-workflow-container';

export function AgentBuilderPage() {
  const { toast } = useToast();
  const { projectId, agentId } = useParams();

  const [project, setProject] = useState<Project>();
  const [agent, setAgent] = useState<Agent>();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);

  useEffect(() => {
    //Have to use this ugly mess because we can't use the useApiQuery hook on this component because the agentId might not exist yet.
    //So I'm doing the call here myself but using the react query client so it still uses and caches data.
    if (agentId && projectId) {
      Promise.all([
        appQueryClient.fetchQuery({
          queryKey: ['agents', 'getById', agentId, projectId],
          queryFn: async () => {
            const response = await api.agents.getById({
              id: agentId,
            });

            if (response.data) {
              return response.data;
            } else {
              throw response.error;
            }
          },
        }),
        appQueryClient.fetchQuery({
          queryKey: ['projects', 'getById', projectId],
          queryFn: async () => {
            const response = await api.projects.getById({ id: projectId });
            if (response.data) {
              return response.data;
            } else {
              throw response.error;
            }
          },
        }),
      ])
        .then(([agentResponse, projectResponse]) => {
          //Set Agent
          if (agentResponse) {
            setAgent(agentResponse);
          } else {
            toast({ title: 'Agent not found', variant: 'destructive' });
          }

          //Set Project
          if (projectResponse) {
            setProject(projectResponse);
          } else {
            toast({ title: 'Project not found', variant: 'destructive' });
          }
        })
        .finally(() => {
          setIsLoadingProject(false);
          setIsLoadingAgent(false);
        });
    } else if (projectId) {
      appQueryClient
        .fetchQuery({
          queryKey: ['projects', 'getById', projectId],
          queryFn: async () => {
            const response = await api.projects.getById({ id: projectId });

            if (response.data) {
              return response.data;
            } else {
              throw response.error;
            }
          },
        })
        .then((response) => {
          if (response) {
            setProject(response);
          } else {
            toast({ title: 'Project not found', variant: 'destructive' });
          }
        })
        .finally(() => {
          setIsLoadingProject(false);
          setIsLoadingAgent(false);
        });
    } else {
      //Shouldn't be able to get to this page without a projectId
      throw Error('Project ID is required to load agent details');
    }
  }, [projectId, toast, agentId]);

  if (isLoadingProject || isLoadingAgent) {
    return (
      <PageLoader>
        <Skeleton className="h-full w-full" />
      </PageLoader>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <PageLayout
      title={agent ? 'Configure' : 'New Agent'}
      breadcrumbs={
        agent
          ? [
              { label: 'Projects ', href: '/projects' },
              {
                label: project.name,
                href: `/projects/${projectId}`,
                additionalButton: <NavProjectSelector />,
              },
              {
                label: 'Agents',
                href: `/projects/${projectId}/agents`,
              },
              {
                label: agent.name,
                href: `/projects/${projectId}/agents/${agentId}`,
                additionalButton: <NavAgentSelector />,
              },
            ]
          : [
              { label: 'Projects ', href: '/projects' },
              {
                label: project.name,
                href: `/projects/${projectId}`,
                additionalButton: <NavProjectSelector />,
              },
              {
                label: 'Agents',
                href: `/projects/${projectId}/agents`,
              },
            ]
      }
      //   actions={[
      //     <Button loading={isSavingAgent} onClick={() => {}}>
      //       Save
      //     </Button>,
      //   ].filter(Boolean)}
    >
      <div className="flex h-full relative" id="workflow-builder-container">
        <AgentWorkflowContainer agent={agent} />
      </div>
    </PageLayout>
  );
}
