import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useReactFlow } from 'reactflow';
import { v4 } from 'uuid';

import { api, appQueryClient } from '../../api/api-library';
import useApiMutation from '../../api/use-api-mutation';
import { Icons } from '../../components/icons';
import PageLayout from '../../components/layouts/page-layout';
import { PageLoader } from '../../components/loaders/page-loader';
import { Button } from '../../components/ui/button';
import { Popover } from '../../components/ui/popover';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import { useApplicationSideNav } from '../../hooks/useApplicationSideNav';
import { useProjectWorkflow } from '../../hooks/useProjectWorkflow';
import { useToast } from '../../hooks/useToast';
import { Execution } from '../../models/execution-model';
import { Project } from '../../models/project/project-model';
import { WorkflowTemplate } from '../../models/workflow-template-model';
import { Workflow } from '../../models/workflow/workflow-model';

import { NavExecutionSelector } from './components/nav-selectors/nav-execution-selector';
import { NavProjectSelector } from './components/nav-selectors/nav-project-selector';
import { NavWorkflowSelector } from './components/nav-selectors/nav-workflow-selector';
import {
  formatEdgesForSaving,
  formatNodesForSaving,
} from './components/workflow/nodes/node-utils';
import { WorkflowContainer } from './components/workflow/workflow-container';

export function WorkflowBuilderPage() {
  const {
    setHasRenderedInitialData,
    setSaveWorkflow,
    takeSnapshot,
    setIsSaving,
    isSaving,
    workflowOrientation,
    rerenderKey,
  } = useProjectWorkflow();
  const { toast } = useToast();
  const { setNodes, setEdges } = useReactFlow();
  const { setIsCollapsed } = useApplicationSideNav();

  const [tempIsActive, setTempIsActive] = useState(false);
  const [tempWorkflowTitle, setTempWorkflowTitle] = useState('');

  const { projectId, workflowId, executionId, workflowTemplateId } =
    useParams();
  const [searchParams] = useSearchParams();

  const [project, setProject] = useState<Project>();
  const [workflow, setWorkflow] = useState<Workflow>();
  const [workflowTemplate, setWorkflowTemplate] = useState<WorkflowTemplate>();
  const [execution, setExecution] = useState<Execution>();
  const [newlyCreatedWorkflowId, setNewlyCreatedWorkflowId] =
    useState<string>();

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true);
  const [isLoadingExecution, setIsLoadingExecution] = useState(true);
  const [isLoadingWorkflowTemplate, setIsLoadingWorkflowTemplate] =
    useState(true);

  const createWorkflowMutation = useApiMutation({
    service: 'workflows',
    method: 'create',
    apiLibraryArgs: {},
  });

  const updateWorkflowMutation = useApiMutation({
    service: 'workflows',
    method: 'update',
  });

  const { getNodes, getEdges, fitView } = useReactFlow();

  const handleSave = useCallback(async () => {
    const nodes = getNodes();
    const edges = getEdges();

    takeSnapshot();

    const formattedNodes = formatNodesForSaving(nodes);
    const formattedEdges = formatEdgesForSaving(edges);

    setIsSaving(true);

    if (workflowId || newlyCreatedWorkflowId) {
      return await updateWorkflowMutation.mutateAsync(
        {
          id: workflowId || newlyCreatedWorkflowId,
          data: {
            name: tempWorkflowTitle,
            nodes: formattedNodes,
            isActive: tempIsActive,
            edges: formattedEdges,
            workflowOrientation,
          },
        },
        {
          onSettled: () => {
            setIsSaving(false);
          },
        },
      );
    } else if (projectId) {
      return await createWorkflowMutation.mutateAsync(
        {
          projectId,
          data: {
            name: tempWorkflowTitle,
            nodes: formattedNodes,
            isActive: tempIsActive,
            edges: formattedEdges,
            workflowOrientation,
          },
        },
        {
          onSuccess: (data) => {
            setNewlyCreatedWorkflowId(data.id);
            window.history.pushState(
              {},
              '',
              `/projects/${projectId}/workflows/${data.id}`,
            );

            toast({ title: 'Workflow saved' });
          },
          onSettled: () => {
            setIsSaving(false);
          },
        },
      );
    } else {
      throw Error('Project ID is required to save workflow');
    }
    // createWorkflowMutation and updateWorkflowMutation are causing infinite loops
    // Don't need them in dependency array anyway since the functions are called with different arguments within the useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // createWorkflowMutation,
    getEdges,
    getNodes,
    takeSnapshot,
    newlyCreatedWorkflowId,
    projectId,
    setIsSaving,
    tempIsActive,
    tempWorkflowTitle,
    // updateWorkflowMutation,
    workflowId,
    workflowOrientation,
  ]);

  const panToCenter = useCallback(() => {
    fitView({ duration: 200, padding: 0.2 });
  }, [fitView]);

  const handleClear = () => {
    setNodes([
      {
        id: v4(),
        data: {
          placeholderType: 'trigger',
        },
        position: { x: 0, y: 0 },
        type: 'placeholder',
      },
    ]);
    setEdges([]);
    toast({ title: 'Workflow cleared' });
    setTimeout(() => {
      panToCenter();
    }, 200);
  };

  const handleTitleChange = async (title: string) => {
    if (title === '') {
      return;
    }

    setTempWorkflowTitle(title);
  };

  useEffect(() => {
    //Have to use this ugly mess because we can't use the useApiQuery hook on this component because the workflowId might not exist yet.
    //So I'm doing the call here myself but using the react query client so it still uses and caches data.
    if (workflowId && projectId) {
      Promise.all([
        appQueryClient.fetchQuery({
          queryKey: ['workflows', 'getById', workflowId, projectId],
          queryFn: async () => {
            const response = await api.workflows.getById({
              id: workflowId,
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
        .then(([workflowResponse, projectResponse]) => {
          //Set Workflow
          if (workflowResponse) {
            setWorkflow(workflowResponse);
          } else {
            toast({ title: 'Workflow not found', variant: 'destructive' });
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
          setIsLoadingExecution(false);
          setIsLoadingWorkflow(false);
          setIsLoadingWorkflowTemplate(false);
        });
    } else if (workflowTemplateId && projectId) {
      Promise.all([
        appQueryClient.fetchQuery({
          queryKey: [
            'workflowTemplates',
            'getById',
            workflowTemplateId,
            projectId,
          ],
          queryFn: async () => {
            const response = await api.workflowTemplates.getById({
              id: workflowTemplateId,
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
        .then(([workflowTemplateResponse, projectResponse]) => {
          //Set Workflow
          if (workflowTemplateResponse) {
            setWorkflowTemplate(workflowTemplateResponse);
          } else {
            toast({
              title: 'Workflow template not found',
              variant: 'destructive',
            });
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
          setIsLoadingExecution(false);
          setIsLoadingWorkflow(false);
          setIsLoadingWorkflowTemplate(false);
        });
    } else if (executionId && projectId) {
      Promise.all([
        appQueryClient.fetchQuery({
          queryKey: ['executions', 'getById', executionId, projectId],
          queryFn: async () => {
            const response = await api.executions.getById({
              id: executionId,
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
        .then(([executionResponse, projectResponse]) => {
          //Set Workflow
          if (executionResponse) {
            setExecution(executionResponse);
          } else {
            toast({ title: 'Execution not found', variant: 'destructive' });
          }

          //Set Project
          if (projectResponse) {
            setProject(projectResponse);
          } else {
            toast({ title: 'Project not found', variant: 'destructive' });
          }
        })
        .finally(() => {
          setIsLoadingExecution(false);
          setIsLoadingWorkflow(false);
          setIsLoadingProject(false);
          setIsLoadingWorkflowTemplate(false);
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
          setIsLoadingExecution(false);
          setIsLoadingProject(false);
          setIsLoadingWorkflow(false);
          setIsLoadingWorkflowTemplate(false);
        });
    } else {
      //Shouldn't be able to get to this page without a projectId
      throw Error('Project ID is required to load workflow details');
    }
  }, [
    executionId,
    projectId,
    toast,
    workflowId,
    rerenderKey,
    workflowTemplateId,
  ]);

  useEffect(() => {
    if (!executionId) {
      //Since we're not buildling in execution review mode, we don't need to collapse the side nav
      setIsCollapsed(true);
    }
  }, [executionId, setIsCollapsed]);

  useEffect(() => {
    if (!workflowId && !workflowTemplateId) {
      setTempWorkflowTitle('Untitled Workflow');
    } else if (workflow) {
      setTempIsActive(workflow?.isActive ?? false);
    }

    if (workflow || workflowTemplate) {
      setTempWorkflowTitle(
        workflow?.name ?? workflowTemplate?.name ?? 'Untitled Workflow',
      );
      setTempIsActive(workflow?.isActive ?? false);
    }
  }, [workflow, workflowId, workflowTemplate, workflowTemplateId]);

  useEffect(() => {
    if (!isLoadingProject && !isLoadingWorkflow && !isLoadingWorkflowTemplate) {
      setTimeout(() => {
        //This is just used to know when to auto open nodes when they're created.
        //I never want the nodes to be auto opened on execution review because we're never adding nodes in that view.
        if (!executionId) {
          setHasRenderedInitialData(true);
        }
      }, 2000);
    }
  }, [
    isLoadingProject,
    isLoadingWorkflow,
    isLoadingExecution,
    setHasRenderedInitialData,
    isLoadingWorkflowTemplate,
    executionId,
  ]);

  useEffect(() => {
    if (searchParams.get('defaultName'))
      setTempWorkflowTitle(searchParams.get('defaultName') as string);
  }, [searchParams]);

  useEffect(() => {
    setSaveWorkflow(() => handleSave);
  }, [handleSave, setSaveWorkflow]);

  if (
    isLoadingProject ||
    isLoadingWorkflow ||
    isLoadingExecution ||
    isLoadingWorkflowTemplate
  ) {
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
      editableTitleDefaultValue={executionId ? undefined : tempWorkflowTitle}
      title={executionId ? `#${execution?.executionNumber}` : undefined}
      titleButton={
        executionId ? <NavExecutionSelector /> : <NavWorkflowSelector />
      }
      defaultIsEditingTitle={!workflowId && !newlyCreatedWorkflowId}
      onTitleChange={executionId ? undefined : handleTitleChange}
      breadcrumbs={
        executionId
          ? [
              { label: 'Projects ', href: '/projects' },
              {
                label: project.name,
                href: `/projects/${projectId}`,
                additionalButton: <NavProjectSelector />,
              },
              {
                label: 'Executions',
                href: `/projects/${projectId}/executions`,
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
                label: 'Workflows',
                href: `/projects/${projectId}/workflows`,
              },
            ]
      }
      actions={
        executionId && execution
          ? [<ExecutionInformation execution={execution} />]
          : [
              <Switch
                checked={tempIsActive}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onCheckedChange={(checked) => {
                  setTempIsActive(checked);
                }}
              />,
              <Button
                className="space-x-2"
                onClick={handleClear}
                variant={'outline'}
              >
                <span>Clear</span> <Icons.x className="size-4" />
              </Button>,
              <Button
                loading={isSaving}
                onClick={async () => {
                  await handleSave();
                  toast({ title: 'Workflow saved' });
                }}
              >
                Save
              </Button>,
              (workflowId != null || newlyCreatedWorkflowId != null) && (
                <Button variant="outline" size={'icon'} asChild>
                  <Link
                    to={`/projects/${projectId}/workflows/${workflowId ?? newlyCreatedWorkflowId}/settings`}
                  >
                    <Icons.gear />
                  </Link>
                </Button>
              ),
            ]
      }
    >
      <div className="flex h-full relative" id="workflow-builder-container">
        <WorkflowContainer
          workflowData={workflow ?? execution ?? workflowTemplate}
        />
      </div>
    </PageLayout>
  );
}

function ExecutionInformation({ execution }: { execution: Execution }) {
  const { projectId } = useParams();

  const Status = useMemo(() => {
    const { status, statusMessage } = execution;

    if (!status || !statusMessage) {
      return null;
    }

    // Split the value by underscore, capitalize the first letter of each part, and join them with a space
    const formattedStatus = status
      .split('_') // Split the string by underscores
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
      .join(' '); // Join them back with spaces

    return (
      <Popover>
        <Popover.Trigger className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
          {status === 'RUNNING' ? (
            <Icons.spinner className="w-4 h-4 animate-spin text-status-warning" />
          ) : status === 'FAILED' ? (
            <Icons.executionFailed className="w-4 h-4 text-status-error" />
          ) : status === 'NEEDS_INPUT' ? (
            <Icons.pencilNotebook className="w-4 h-4 text-status-warning" />
          ) : status === 'SCHEDULED' ? (
            <Icons.calendarClock className="w-4 h-4 text-status-warning" />
          ) : (
            <Icons.executionSucceeded className="w-4 h-4 text-status-good" />
          )}
          <span>{formattedStatus}</span>
        </Popover.Trigger>
        <Popover.Content>
          <div className="p-4 text-sm">
            <div>
              <span className="font-medium">{formattedStatus}</span>
              <Separator className="my-2" />
              <span className="text-muted-foreground">{statusMessage}</span>
              {status === 'SCHEDULED' && execution.continueExecutionAt && (
                <>
                  <Separator className="my-2" />
                  <span className="text-muted-foreground">
                    Scheduled to run at{' '}
                    {new Date(execution.continueExecutionAt).toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover>
    );
  }, [execution]);

  const RunTime = useMemo(() => {
    const { startedAt, stoppedAt } = execution;

    if (!startedAt || !stoppedAt) {
      return null;
    }

    const start = new Date(startedAt);
    const end = new Date(stoppedAt);
    const diff = end.getTime() - start.getTime();

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return (
      <Popover>
        <Popover.Trigger className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
          <Icons.clock className="w-4 h-4" />
          {hours > 0 && <span>{`${hours}h`}</span>}
          {minutes > 0 && <span>{` ${minutes}m`}</span>}
          {seconds > 0 && <span>{` ${seconds}s`}</span>}
        </Popover.Trigger>
        <Popover.Content>
          <div className="p-4 text-sm">
            <div>
              <span className="font-medium">Run Time</span>
              <Separator className="my-2" />
              {hours > 0 && (
                <span className="text-muted-foreground">{`${hours}h`}</span>
              )}
              {minutes > 0 && (
                <span className="text-muted-foreground">{` ${minutes}m`}</span>
              )}
              {seconds >= 0 && (
                <span className="text-muted-foreground">{` ${seconds}s`}</span>
              )}{' '}
              <span className="text-muted-foreground">to run execution</span>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    );
  }, [execution]);

  const StartedAndStoppedAt = useMemo(() => {
    const { startedAt, stoppedAt } = execution;

    if (!startedAt || !stoppedAt) {
      return null;
    }

    const start = new Date(startedAt);
    const end = new Date(stoppedAt);

    return (
      <Popover>
        <Popover.Trigger className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
          <Icons.calendar className="w-4 h-4" />
          <span>
            {start.toLocaleDateString()} {start.toLocaleTimeString()}
          </span>
          {start.toLocaleDateString() === end.toLocaleDateString() ? (
            <span> - {end.toLocaleTimeString()}</span>
          ) : start.toLocaleTimeString() === end.toLocaleTimeString() ? null : ( // If if was so fast that it was the same minute, then we don't need to show the date
            <span>
              - {end.toLocaleDateString()} {end.toLocaleTimeString()}
            </span>
          )}
        </Popover.Trigger>
        <Popover.Content>
          <div className="p-4 text-sm">
            <div>
              <span className="font-medium">Started</span>
              <Separator className="my-2" />
              <span className="text-muted-foreground">
                {start.toLocaleDateString()} {start.toLocaleTimeString()}
              </span>
              <Separator className="my-2" />
              <span className="font-medium">Stopped</span>
              <Separator className="my-2" />
              <span className="text-muted-foreground">
                {end.toLocaleDateString()} {end.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </Popover.Content>
      </Popover>
    );
  }, [execution]);

  return (
    <div className="flex items-center justify-end space-x-6 text-sm mr-4 lg:min-w-[450px] sm:hidden lg:flex">
      {Status}
      {StartedAndStoppedAt}
      {RunTime}
      <Button variant={'outline'} asChild>
        <Link
          to={`/projects/${projectId}/workflows/${execution.workflow?.id}`}
          className="space-x-2"
        >
          <span>View Workflow</span>
          <Icons.arrowRight />
        </Link>
      </Button>
    </div>
  );
}
