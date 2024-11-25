import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { api, appQueryClient } from '@/api/api-library';
import useApiMutation from '@/api/use-api-mutation';
import useApiQuery from '@/api/use-api-query';
import { DataTableToolbarAction } from '@/components/data-table/data-table-toolbar-action';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { SelectProjectForWorkflowTemplateForm } from '@/components/forms/select-project-for-template-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { GridLoader } from '@/components/loaders/grid-loader';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { WorkflowTemplate } from '@/models/workflow-template-model';
import { WorkflowAppActionType } from '@/models/workflow/workflow-app-action-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';
import { WorkflowAppTriggerType } from '@/models/workflow/workflow-app-trigger-model';
import { cn } from '@/utils/cn';

export function WorkflowTemplatesPage() {
  const { workspaceUser } = useUser();
  const [includeType, setIncludeType] = useState<string[]>([]);
  const [sharedToType, setSharedToType] = useState<
    'project' | 'workspace' | 'global'
  >('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingWorkflowTemplates, setIsLoadingWorkflowTemplates] =
    useState(true);
  const [workflowTemplates, setWorkflowTemplates] =
    useState<WorkflowTemplate[]>();
  const [refretchTrigger, setRefretchTrigger] = useState<number>(0); //will incremenet when needs to refetch. HACK since we're not using react hook for the query

  const { data: apps, isLoading: isLoadingApps } = useApiQuery({
    service: 'workflowApps',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const filteredWorkflowTemplates = useMemo(() => {
    return workflowTemplates?.filter(
      (template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, workflowTemplates]);

  useEffect(() => {
    if (sharedToType === 'project') {
      setIsLoadingWorkflowTemplates(true);
      const config = {
        params: {
          includeType,
        },
      };

      appQueryClient
        .fetchQuery({
          queryKey: ['workflowTemplates', 'getList', config],
          queryFn: async () => {
            const response = await api.workflowTemplates.getList({
              config,
            });

            if (response.data) {
              return response.data;
            } else {
              throw response.error;
            }
          },
        })
        .then((data) => {
          setWorkflowTemplates(data);
        });
      setIsLoadingWorkflowTemplates(false);
    } else if (sharedToType === 'global' || sharedToType === 'workspace') {
      setIsLoadingWorkflowTemplates(true);

      const config = {
        params: {
          sharedToType,
        },
      };

      appQueryClient
        .fetchQuery({
          queryKey: ['workflowTemplates', 'getSharedList', config],
          queryFn: async () => {
            const response = await api.workflowTemplates.getSharedList({
              config: {
                sharedToType,
              },
            });

            if (response.data) {
              return response.data;
            } else {
              throw response.error;
            }
          },
        })
        .then((data) => {
          setWorkflowTemplates(data);
        });
      setIsLoadingWorkflowTemplates(false);
    } else {
      throw new Error('Invalid sharedToType: ' + sharedToType);
    }
  }, [includeType, sharedToType, refretchTrigger]);

  return (
    <PageLayout
      title="Templates"
      subtitle="Browse templates for common use cases."
    >
      {isLoadingWorkflowTemplates || isLoadingApps || !workflowTemplates ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-[200px] lg:w-[250px]" />
          <GridLoader itemClassName="h-40" />
        </div>
      ) : (
        <Tabs className="space-y-6" defaultValue={sharedToType}>
          <div className="flex justify-between">
            <Input
              type="search"
              placeholder="Search templates..."
              className="py-2 w-[200px] lg:w-[250px] ml-1"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            {sharedToType === 'project' &&
              workspaceUser?.roles.includes('MAINTAINER') && (
                <DataTableToolbarAction
                  title="Filters"
                  Icon={Icons.filter}
                  options={[
                    {
                      label: 'All (Admin)',
                      value: 'all',
                    },
                  ]}
                  selectedValues={includeType}
                  onChange={(values) => setIncludeType(values)}
                />
              )}
          </div>
          <Tabs.List
            className={cn({
              hidden: !workspaceUser?.user?.email.includes('admin@lecca.io'),
            })}
          >
            <Tabs.Trigger
              onClick={() => setSharedToType('project')}
              value="project"
            >
              My Projects
            </Tabs.Trigger>
            <Tabs.Trigger
              onClick={() => setSharedToType('workspace')}
              value="workspace"
            >
              Shared with Workspace
            </Tabs.Trigger>
            <Tabs.Trigger
              onClick={() => setSharedToType('global')}
              value="global"
            >
              Public
            </Tabs.Trigger>
          </Tabs.List>
          {filteredWorkflowTemplates?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
              {filteredWorkflowTemplates?.map((template) => (
                <WorkflowTemplateCard
                  key={template.id}
                  template={template}
                  apps={apps!}
                  setRefetchTrigger={setRefretchTrigger}
                  sharedToType={sharedToType}
                  canShareToWorkspace={
                    !!workspaceUser?.roles.includes('MAINTAINER')
                  }
                  canShareToPublic={
                    !!workspaceUser?.user?.email.includes('admin@lecca.io')
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyPlaceholder
              className="w-full"
              title="No templates found"
              description={
                sharedToType === 'workspace'
                  ? 'Share an existing template to your workspace'
                  : 'Create a workflow and save it as a template'
              }
              icon={<Icons.templates />}
            />
          )}
        </Tabs>
      )}
    </PageLayout>
  );
}

export const WorkflowTemplateCard = ({
  template,
  apps,
  setRefetchTrigger,
  sharedToType,
  canShareToWorkspace,
  canShareToPublic,
  className,
}: {
  template: WorkflowTemplate;
  apps: WorkflowApp[];
  setRefetchTrigger: React.Dispatch<React.SetStateAction<number>>;
  sharedToType: 'project' | 'workspace' | 'global';
  canShareToWorkspace: boolean;
  canShareToPublic: boolean;
  className?: string;
}) => {
  const { toast } = useToast();

  const deleteMutation = useApiMutation({
    service: 'workflowTemplates',
    method: 'delete',
  });

  const shareToWorkspaceMutation = useApiMutation({
    service: 'workflowTemplates',
    method: 'shareToWorkspace',
  });

  const shareGloballyMutation = useApiMutation({
    service: 'workflowTemplates',
    method: 'shareGlobally',
  });

  //Should create a map for this to be more efficient
  const triggerAndActions = useMemo(() => {
    const triggerAndActionIds = template.triggerAndActionIds!;

    return (
      triggerAndActionIds
        .map((id) => {
          let actionOrTrigger:
            | WorkflowAppActionType
            | WorkflowAppTriggerType
            | undefined;

          let foundApp: WorkflowApp | undefined;

          apps?.some((app) => {
            if (id.includes('_trigger_')) {
              const foundTrigger = app.triggers.find(
                (trigger) => trigger.id === id,
              );
              if (foundTrigger) {
                actionOrTrigger = foundTrigger;
                foundApp = app;
                return true;
              }
            }

            if (id.includes('_action_')) {
              const foundAction = app.actions.find(
                (action) => action.id === id,
              );

              if (foundAction) {
                actionOrTrigger = foundAction;
                foundApp = app;
                return true;
              }
            }

            return false;
          });

          return { app: foundApp, actionOrTrigger };
        })
        .filter(({ app, actionOrTrigger }) => app && actionOrTrigger) ??
      ([] as (WorkflowAppActionType | WorkflowAppTriggerType)[])
    );
  }, [apps, template.triggerAndActionIds]);

  return (
    <Card className={cn('pt-0 flex flex-col justify-between', className)}>
      <Card.Header className="relative">
        <Card.Title className="flex justify-between items-center space-x-4">
          <span>{template.name}</span>
          {canShareToPublic && (
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <DotsHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                {sharedToType === 'project' && canShareToWorkspace && (
                  <AlertDialog>
                    <AlertDialog.Trigger asChild>
                      <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                        Share with Workspace
                      </DropdownMenu.Item>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                      <AlertDialog.Header>
                        <AlertDialog.Title>
                          Share with Workspace
                        </AlertDialog.Title>
                        <AlertDialog.Description>
                          This will share the template to all members of your
                          workspace. Including those outside of the project this
                          template was created in.
                        </AlertDialog.Description>
                        <AlertDialog.Description>
                          All project specific variables and connections will be
                          removed. All node outputs will be stripped to protect
                          sensitive data.
                        </AlertDialog.Description>
                        <AlertDialog.Description>
                          Once shared with your workspace, you cannot unshare
                          it. However, you can delete it.
                        </AlertDialog.Description>
                      </AlertDialog.Header>
                      <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action
                          onClick={async () => {
                            await shareToWorkspaceMutation.mutateAsync(
                              {
                                id: template.id,
                              },
                              {
                                onSuccess: () => {
                                  toast({
                                    title: 'Template shared to workspace',
                                  });
                                  setRefetchTrigger((prev) => prev + 1);
                                },
                              },
                            );
                          }}
                        >
                          Share
                        </AlertDialog.Action>
                      </AlertDialog.Footer>
                    </AlertDialog.Content>
                  </AlertDialog>
                )}
                {(sharedToType === 'project' || sharedToType === 'workspace') &&
                  canShareToPublic && (
                    <AlertDialog>
                      <AlertDialog.Trigger asChild>
                        <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                          Share to Public
                        </DropdownMenu.Item>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content>
                        <AlertDialog.Header>
                          <AlertDialog.Title>Share to Public</AlertDialog.Title>
                          <AlertDialog.Description>
                            Share with all Lecca.io users.
                          </AlertDialog.Description>
                          <AlertDialog.Description>
                            All variables and connections will be removed. All
                            node outputs will be stripped to protect sensitive
                            data.
                          </AlertDialog.Description>
                          <AlertDialog.Description>
                            Once shared, you cannot unshare it. However, you can
                            delete it.
                          </AlertDialog.Description>
                          <AlertDialog.Description>
                            Templates will be reviewed by our team before being
                            published.
                          </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                          <AlertDialog.Action
                            onClick={async () => {
                              await shareGloballyMutation.mutateAsync(
                                {
                                  id: template.id,
                                },
                                {
                                  onSuccess: () => {
                                    toast({
                                      title: 'Template shared to public',
                                    });
                                    setRefetchTrigger((prev) => prev + 1);
                                  },
                                },
                              );
                            }}
                          >
                            Share
                          </AlertDialog.Action>
                        </AlertDialog.Footer>
                      </AlertDialog.Content>
                    </AlertDialog>
                  )}
                <DropdownMenu.Separator />
                {(sharedToType === 'project' ||
                  (canShareToPublic && sharedToType === 'global') ||
                  (canShareToWorkspace && sharedToType === 'workspace')) && (
                  <AlertDialog>
                    <AlertDialog.Trigger asChild>
                      <DropdownMenu.Item onSelect={(e) => e.preventDefault()}>
                        Delete
                      </DropdownMenu.Item>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                      <AlertDialog.Header>
                        <AlertDialog.Title>Delete Template</AlertDialog.Title>
                        <AlertDialog.Description>
                          Are you sure you want to delete this template?
                        </AlertDialog.Description>
                      </AlertDialog.Header>
                      <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action
                          onClick={async () => {
                            await deleteMutation.mutateAsync(
                              {
                                id: template.id,
                              },
                              {
                                onSuccess: () => {
                                  toast({ title: 'Template deleted' });
                                  setRefetchTrigger((prev) => prev + 1);
                                },
                              },
                            );
                          }}
                        >
                          Delete
                        </AlertDialog.Action>
                      </AlertDialog.Footer>
                    </AlertDialog.Content>
                  </AlertDialog>
                )}
              </DropdownMenu.Content>
            </DropdownMenu>
          )}
        </Card.Title>
        <Card.Description className="line-clamp-3">
          {template.description}
        </Card.Description>
      </Card.Header>
      <Card.Footer className="w-full justify-between">
        {triggerAndActions && (
          <Avatar.Group limit={3} className="items-center mr-4">
            <Avatar.GroupList>
              {triggerAndActions!.map(({ actionOrTrigger, app }, index) => {
                return (
                  <Avatar
                    key={actionOrTrigger!.id + index}
                    className={cn(
                      'flex items-center justify-center border rounded-full bg-background cursor-pointer',
                      {
                        'dark:bg-accent-foreground dark:border-border/20 dark:invert':
                          actionOrTrigger?.iconUrl,
                      },
                    )}
                  >
                    <Avatar.Image
                      src={
                        actionOrTrigger!.iconUrl ?? app?.logoUrl ?? undefined
                      }
                      className="rounded-none object-contain size-5"
                    />
                  </Avatar>
                );
              })}
            </Avatar.GroupList>
            <Popover>
              <Popover.Trigger asChild>
                <Avatar.OverflowIndicator className="border cursor-pointer object-contain size-9" />
              </Popover.Trigger>
              <Popover.Content>
                <div className="p-4 text-sm">
                  <p>
                    {triggerAndActions
                      .slice(3)!
                      .map(({ actionOrTrigger }) => actionOrTrigger!.name)
                      .join(', ')}
                  </p>
                </div>
              </Popover.Content>
            </Popover>
          </Avatar.Group>
        )}
        <UseTemplateButton template={template} />
      </Card.Footer>
    </Card>
  );
};

const UseTemplateButton = ({ template }: { template: WorkflowTemplate }) => {
  return template.sharedTo === 'project' ? (
    <Button asChild size="sm">
      <Link to={`/workflow-templates/${template.id}`}>
        <span>Use Template</span>
      </Link>
    </Button>
  ) : (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button size="sm">
          <span>Use Template</span>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <SelectProjectForWorkflowTemplateForm templateId={template.id} />
      </Dialog.Content>
    </Dialog>
  );
};
