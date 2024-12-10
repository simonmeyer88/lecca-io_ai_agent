import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { api, appQueryClient } from '../../../api/api-library';
import useApiMutation from '../../../api/use-api-mutation';
import PageLayout from '../../../components/layouts/page-layout';
import { PageLoader } from '../../../components/loaders/page-loader';
import { useOnborda } from '../../../components/onboarda/OnbordaContext';
import { Button } from '../../../components/ui/button';
import { Form } from '../../../components/ui/form';
import { Skeleton } from '../../../components/ui/skeleton';
import { Tabs } from '../../../components/ui/tabs';
import { useToast } from '../../../hooks/useToast';
import { useUser } from '../../../hooks/useUser';
import {
  Agent,
  CreateAgentType,
  UpdateAgentType,
  createAgentSchema,
} from '../../../models/agent/agent-model';
import { AiProvider } from '../../../models/ai-provider-model';
import { Project } from '../../../models/project/project-model';
import { NavAgentSelector } from '../../projects/components/nav-selectors/nav-agent-selector';
import { NavProjectSelector } from '../../projects/components/nav-selectors/nav-project-selector';

import { AgentBuilderActionsContent } from './agent-builder-actions-content';
import { AgentBuilderAdvancedSettingsContent } from './agent-builder-advanced-settings-content';
import { AgentBuilderConnectionsContent } from './agent-builder-connections-content';
import { AgentBuilderKnowledgeContent } from './agent-builder-knowledge-content';
import { AgentBuilderProfileContent } from './agent-builder-profile-content';
import { AgentBuilderSubAgentContent } from './agent-builder-sub-agent-content';
import { AgentBuilderWorkflowContent } from './agent-builder-workflow-content';

export function AgentConfigurePage() {
  const { toast } = useToast();
  const { workspaceUser, enabledFeatures, aiProviders } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultName = searchParams.get('defaultName');
  const { startOnborda } = useOnborda();

  const form = useForm<UpdateAgentType>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: defaultName ?? 'Untitled Agent',
      description: '',
      connectionIds: [],
      knowledgeIds: [],
      actionIds: [],
      workflowIds: [],
      agentIds: [],
      instructions: '',
      webAccess: false,
      phoneAccess: false,
      llmProvider: Object.keys(aiProviders)[0],
      llmModel: Object.keys(
        aiProviders[Object.keys(aiProviders)[0] as AiProvider]
          ?.languageModels ?? {},
      )[0],
    },
  });

  const [isSavingAgent, setIsSavingAgent] = useState(false);
  const navigate = useNavigate();

  const { projectId, agentId } = useParams();

  const [project, setProject] = useState<Project>();
  const [agent, setAgent] = useState<Agent>();
  const [newlyCreatedAgentId, setNewlyCreatedAgentId] = useState<string>();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);

  const createAgentMutation = useApiMutation({
    service: 'agents',
    method: 'create',
    apiLibraryArgs: {},
  });

  const updateAgentMutation = useApiMutation({
    service: 'agents',
    method: 'update',
  });

  const handleSave = useCallback(
    async (values: UpdateAgentType, args?: { disableToast?: boolean }) => {
      setIsSavingAgent(true);

      if (agentId || newlyCreatedAgentId) {
        return await updateAgentMutation.mutateAsync(
          {
            id: agentId || newlyCreatedAgentId,
            data: values,
          },
          {
            onSuccess: () => {
              if (!args?.disableToast) {
                toast({ title: 'Agent saved' });

                if (newlyCreatedAgentId) {
                  //If it's a new agent, go to the agent page after saving
                  navigate(
                    `/projects/${projectId}/agents/${newlyCreatedAgentId}`,
                  );
                }
              }
            },
            onSettled: () => {
              setIsSavingAgent(false);
            },
          },
        );
      } else if (projectId) {
        return await createAgentMutation.mutateAsync(
          {
            projectId,
            data: values as CreateAgentType,
          },
          {
            onSuccess: (data) => {
              setNewlyCreatedAgentId(data.id);

              if (!args?.disableToast) {
                toast({ title: 'Agent saved' });

                //If it's a new agent, go to the agent page after saving
                navigate(`/projects/${projectId}/agents/${data.id}`);
              } else {
                //We disableToast when saving connections for agents.
                //So we don't want to show a toast everytime or redirect to the agent page on creation.
                //We will update the url so that if they reload they are taken to the edit page, not a new agent page.
                window.history.pushState(
                  {},
                  '',
                  `/projects/${projectId}/agents/${data.id}/configure`,
                );
              }
            },
            onSettled: () => {
              setIsSavingAgent(false);
            },
          },
        );
      } else {
        throw Error('Project ID is required to save agent');
      }
      // createAgentMutation and updateAgentMutation are causing infinite loops
      // Don't need them in dependency array anyway since the functions are called with different arguments within the useCallback
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // createAgentMutation,
      // updateAgentMutation,
      agentId,
      navigate,
      newlyCreatedAgentId,
      projectId,
      toast,
    ],
  );

  const handleTabChange = (value: string) => {
    // Update the search params with the new tab value
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    setTimeout(() => {
      if (
        window.innerWidth > 700 &&
        !workspaceUser?.user?.toursCompleted?.includes('agents-overview')
      ) {
        startOnborda('agents-overview');
      }
    }, 500);
  }, [startOnborda, workspaceUser?.user?.toursCompleted]);

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

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name ?? 'Untitled Agent',
        description: agent.description ?? '',
        actionIds: agent.agentActions?.map((action) => action.actionId) ?? [],
        connectionIds:
          agent.connections?.map((connection) => connection.id) ?? [],
        knowledgeIds:
          agent.agentKnowledge?.map(({ knowledge }) => knowledge.id) ?? [],
        variableIds:
          agent.agentVariables?.map(({ variable }) => variable.id) ?? [],
        workflowIds:
          agent.agentWorkflows?.map(({ workflow }) => workflow.id) ?? [],
        agentIds:
          agent.agentSubAgents?.map(({ subagent }) => subagent.id) ?? [],
        llmConnectionId: agent.llmConnection?.id ?? undefined,
        llmModel: agent.llmModel,
        llmProvider: agent.llmProvider,
        webAccess: agent.agentWebAccess?.webSearchEnabled ?? false, //eventually we'll break up websearch and web access up. For now, they are the same.
        phoneAccess: agent.agentPhoneAccess?.outboundCallsEnabled ?? false,
        instructions: agent.instructions ?? '',
        frequencyPenalty: agent.frequencyPenalty ?? 0,
        presencePenalty: agent.presencePenalty ?? 0,
        maxRetries: agent.maxRetries ?? 0,
        maxTokens: agent.maxTokens ?? 4095,
        maxToolRoundtrips: agent.maxToolRoundtrips ?? 5,
        messageLookbackLimit: agent.messageLookbackLimit ?? 5,
        temperature: agent.temperature ?? 1,
      });
    }
  }, [form, agent]);

  if (isLoadingProject || isLoadingAgent) {
    return (
      <PageLoader>
        <Skeleton className="h-full w-full" />
      </PageLoader>
    );
  }

  if (!project || !agent) {
    return null;
  }

  return (
    <PageLayout
      title={agent ? `Configure ${agent.name}` : 'New Agent'}
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
      actions={[
        (agentId ?? newlyCreatedAgentId) ? (
          <Button
            variant={'outline'}
            onClick={() => {
              navigate(
                `/projects/${projectId}/agents/${agentId ?? newlyCreatedAgentId}`,
              );
            }}
          >
            Chat
          </Button>
        ) : null,
        <Button
          loading={isSavingAgent}
          onClick={() => {
            form.handleSubmit(async (values) => {
              await handleSave(values);
            })();
          }}
        >
          Save
        </Button>,
      ].filter(Boolean)}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => handleSave(values))}>
          <Tabs
            defaultValue={searchParams.get('tab') ?? 'profile'}
            className="h-full w-full mb-4"
            onValueChange={handleTabChange} // Add this line
          >
            <Tabs.List className="mb-2">
              <Tabs.Trigger value="profile" id={'onboarding-agent-profile-tab'}>
                Agent Profile
              </Tabs.Trigger>
              {enabledFeatures.KNOWLEDGE && (
                <Tabs.Trigger
                  value="knowledge"
                  id={'onboarding-agent-knowledge-tab'}
                >
                  Knowledge
                </Tabs.Trigger>
              )}
              {enabledFeatures.CONNECTIONS && (
                <Tabs.Trigger
                  value="connections"
                  id={'onboarding-agent-connections-tab'}
                >
                  Connections
                </Tabs.Trigger>
              )}

              <Tabs.Trigger value="actions" id={'onboarding-agent-actions-tab'}>
                Quick Actions
              </Tabs.Trigger>
              {enabledFeatures.WORKFLOWS && (
                <Tabs.Trigger
                  value="workflows"
                  id={'onboarding-agent-workflows-tab'}
                >
                  Workflow Tools
                </Tabs.Trigger>
              )}
              <Tabs.Trigger
                value="agents"
                id={'onboarding-agent-sub-agents-tab'}
              >
                Sub-Agents
              </Tabs.Trigger>
              <Tabs.Trigger
                value="advanced"
                id={'onboarding-agent-advanced-tab'}
              >
                Advanced Settings
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="profile">
              <AgentBuilderProfileContent form={form} />
            </Tabs.Content>
            <Tabs.Content value="knowledge">
              <AgentBuilderKnowledgeContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="connections">
              <AgentBuilderConnectionsContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="actions">
              <AgentBuilderActionsContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="workflows">
              <AgentBuilderWorkflowContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="agents">
              <AgentBuilderSubAgentContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content>
            {/* <Tabs.Content value="variables">
              <AgentBuilderVariableContent
                form={form}
                save={() => {
                  form.handleSubmit(async (values) => {
                    await handleSave(values, { disableToast: true });
                  })();
                }}
              />
            </Tabs.Content> */}
            <Tabs.Content value="advanced">
              <AgentBuilderAdvancedSettingsContent agent={agent} />
            </Tabs.Content>
          </Tabs>
        </form>
      </Form>
    </PageLayout>
  );
}
