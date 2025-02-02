import { Link, useNavigate, useParams } from 'react-router-dom';

import useApiMutation from '../../api/use-api-mutation';
import useApiQuery from '../../api/use-api-query';
import { useApplicationSideNav } from '../../hooks/useApplicationSideNav';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';
import { Icons } from '../icons';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { DropdownMenu } from '../ui/dropdown-menu';
import { ResizablePanel } from '../ui/resizable';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Tooltip } from '../ui/tooltip';

import { Credits, MainSideNavContent, Nav } from './application-side-nav';

export function AgentSideNav() {
  const { agentId, projectId } = useParams();
  const { isCollapsed } = useApplicationSideNav();

  const { data: agent } = useApiQuery({
    service: 'agents',
    method: 'getById',
    apiLibraryArgs: {
      id: agentId!,
    },
  });

  if (!agent) {
    return null;
  }

  return (
    <ResizablePanel
      collapsible={true}
      className={cn(
        'transition-all duration-500 ease-in-out hidden sm:flex flex-col justify-between min-w-[50px] bg-popover',
        `${isCollapsed ? 'max-w-[50px]' : 'max-w-[245px]'} `,
      )}
    >
      <div>
        <div className="flex items-center px-4 sm:px-2 py-1 w-full">
          {agent ? (
            <div className="w-full flex justify-between items-center pt-2">
              <Link to={`/agents/${agentId}`}>
                <div
                  className={cn('flex items-center space-x-2 w-full', {
                    'px-2': !isCollapsed,
                    'px-1': isCollapsed,
                  })}
                >
                  <Avatar className="size-6 border">
                    <Avatar.Image
                      src={agent?.profileImageUrl ?? undefined}
                      alt={`${agent.name} Profile Image`}
                    />
                    <Avatar.Fallback>
                      {agent?.name![0].toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <span
                    className={cn('text-nowrap truncate', {
                      hidden: isCollapsed,
                    })}
                  >
                    {/* Truncate after 10 characters */}
                    {agent.name.substring(0, 18) +
                      (agent.name.length! > 18 ? '...' : '')}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                asChild
                size="icon"
                className={cn('size-8', {
                  hidden: isCollapsed,
                })}
              >
                <Link
                  to={`/redirect?redirect=/projects/${projectId}/agents/${agent.id}`}
                  className="space-x-2"
                >
                  <Icons.squarePen className="size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <Skeleton
              className={cn('mt-4 h-6 w-full', {
                'mx-2': !isCollapsed,
                'mx-1': isCollapsed,
              })}
            />
          )}
        </div>
        <div className="w-full px-4 sm:px-2 flex justify-between items-center pt-1">
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                variant="ghost"
                asChild
                size="icon"
                className={cn('size-8', {
                  hidden: !isCollapsed,
                })}
              >
                <Link
                  to={`/redirect?redirect=/projects/${projectId}/agents/${agent.id}`}
                >
                  <Icons.squarePen className="size-4" />
                </Link>
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content side="right">Start new chat</Tooltip.Content>
          </Tooltip>
        </div>
        <AgentSideNavContent isCollapsed={isCollapsed} />
      </div>

      <div>
        <Separator />
        <Link to="/">
          <div className="flex items-center  py-2 w-full space-x-2 px-4">
            <Icons.chevronLeft className="size-4" />
            <span
              className={cn('text-muted-foreground text-xs text-nowrap', {
                hidden: isCollapsed,
              })}
            >
              Home
            </span>
          </div>
        </Link>
      </div>
    </ResizablePanel>
  );
}

export function AgentSideNavContent({
  isCollapsed,
  isSheet,
}: {
  isCollapsed: boolean;
  isSheet?: boolean;
}) {
  const { taskId, agentId, projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: tasks, isLoading: isLoadingTasks } = useApiQuery({
    service: 'tasks',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`agentId:${agentId}`],
        },
      },
    },
  });

  const deleteMutation = useApiMutation({
    service: 'tasks',
    method: 'delete',
  });

  if (isLoadingTasks && !isCollapsed) {
    // Only show spinner when the left rail is open
    return (
      <div className="flex items-center justify-center h-[20dvh]">
        <Icons.spinner className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col justify-between', {
        'h-[calc(100dvh-100px)]': !isCollapsed,
        'h-[calc(100dvh-130px)]': isCollapsed,
      })}
    >
      {tasks?.length === 0 && !isCollapsed ? (
        <div className="w-full px-4 sm:px-2 flex justify-between items-center pt-1 h-[20dvh]">
          <span className="text-center w-full text-muted-foreground text-xs text-nowrap">
            No Conversations
          </span>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <Nav
            isCollapsed={isCollapsed}
            isSheet={isSheet}
            className="space-y-0"
            links={
              isCollapsed
                ? []
                : (tasks?.map((task) => {
                    return {
                      // title: task.name,
                      // truncate title at 30 characters if the title has more than 30 characters
                      title:
                        task.name.substring(0, 28) +
                        (task.name.length > 28 ? '...' : ''),
                      to: `/projects/${projectId}/agents/${agentId}/tasks/${task.id}`,
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      icon: () => <></>,
                      dropdownMenuContent: (
                        <DropdownMenu.Content side="right">
                          <DropdownMenu.Item
                            onSelect={async () => {
                              await deleteMutation.mutateAsync(
                                { id: task.id },
                                {
                                  onSuccess: () => {
                                    toast({ title: 'Conversation deleted' });
                                    if (taskId === task.id) {
                                      // Redirect to the agent's page if the current task is deleted
                                      navigate(
                                        `/projects/${projectId}/agents/${agentId}`,
                                      );
                                    }
                                  },
                                },
                              );
                            }}
                          >
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      ),
                    };
                  }) ?? [])
            }
          />
        </div>
      )}
      <div>
        <Separator className="mb-0" />
        <MainSideNavContent isCollapsed={isCollapsed} isOnAgentSideNav />
        <Separator className="mb-4" />
        <Credits isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
