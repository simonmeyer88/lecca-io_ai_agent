import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useApiQuery from '../../api/use-api-query';
import { useUser } from '../../hooks/useUser';
import { Agent } from '../../models/agent/agent-model';
import { Project } from '../../models/project/project-model';
import { Task } from '../../models/task/task-model';
import { cn } from '../../utils/cn';
import { timeAgo } from '../../utils/dates';
import { Icons } from '../icons';

import { Avatar } from './avatar';
import { Button } from './button';
import { Command } from './command';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Tooltip } from './tooltip';

type Props = {
  agentId: string | undefined;
  projectId: string | undefined;
  isCollapsed: boolean;
};

export function AgentGlobalSearch(props: Props) {
  const { enabledFeatures } = useUser();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const isMac = useMemo(() => {
    return navigator.userAgent.includes('Mac');
  }, []);

  const { data: projects } = useApiQuery({
    service: 'projects',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: tasks } = useApiQuery({
    service: 'tasks',
    method: 'getList',
    apiLibraryArgs: props.agentId
      ? {
          config: {
            params: {
              filterBy: [`agentId:${props.agentId}`],
            },
          },
        }
      : props.projectId
        ? {
            config: {
              params: {
                filterBy: [`projectId:${props.agentId}`],
              },
            },
          }
        : {},
  });

  const setFilteredResultGroups = React.useMemo(() => {
    const resultObject: Record<string, Agent[] | Project[] | Task[]> = {
      Projects: projects ?? [],
    };

    if (enabledFeatures.AGENTS) {
      resultObject.Agents = agents ?? [];
      resultObject.Tasks = tasks ?? [];
    }

    return resultObject;
  }, [projects, enabledFeatures.AGENTS, agents, tasks]);

  const RenderResultGroups = React.useMemo(() => {
    return Object.entries(setFilteredResultGroups).map(([key, value]) => {
      return (
        <Command.Group key={key} heading={key}>
          {value.map((result) => {
            let link: undefined | string;

            if (key === 'Projects') {
              link = `/projects/${result.id}`;
            } else if (key === 'Agents') {
              link = `/agents/${result.id}`;
            } else if (key === 'Tasks') {
              link = `/tasks/${result.id}`;
            } else {
              throw new Error(`No link for this search type: ${key}`);
            }

            return (
              <Command.Item
                key={result.id}
                onSelect={() => {
                  setOpen(false);
                  navigate(link);
                }}
                className="flex justify-between group"
              >
                <div className="flex flex-col">
                  <div className="flex space-x-2 items-center">
                    {key === 'Agents' && (
                      <Avatar className="size-6 border">
                        <Avatar.Image
                          src={(result as Agent)?.profileImageUrl ?? undefined}
                          alt="User Profile Image"
                        />
                        <Avatar.Fallback>
                          {result.name![0].toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                    )}
                    {key === 'Projects' && (
                      <Icons.project className="text-muted-foreground p-0.5" />
                    )}
                    {key === 'Tasks' && (
                      <Icons.messageSquareText className="text-muted-foreground p-0.5" />
                    )}
                    <span className="line-clamp-1">{result.name}</span>
                  </div>
                  {key === 'Tasks' && (
                    <span className="text-xs text-muted-foreground pl-7">
                      {result.createdAt
                        ? timeAgo(result.createdAt as Date)
                        : null}
                    </span>
                  )}
                </div>
                <div>
                  <Icons.chevronRight className="text-muted-foreground text-xs hidden group-hover:block" />
                </div>
              </Command.Item>
            );
          })}
        </Command.Group>
      );
    });
  }, [navigate, setFilteredResultGroups]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div>
      <div className="relative">
        {props.isCollapsed ? (
          <div className="w-full px-4 sm:px-2 flex justify-between items-center pt-1">
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  asChild
                  onClick={() => setOpen(true)}
                  size="icon"
                  className={cn('size-5', {
                    hidden: !props.isCollapsed,
                  })}
                >
                  <Icons.search className="size-4 pr-1" />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content side="right">Search</Tooltip.Content>
            </Tooltip>
          </div>
        ) : (
          <>
            <Input
              type="search"
              placeholder="Search..."
              onClick={() => setOpen(true)}
              className="cursor-pointer h-7 text-xs"
            />
            <Command.Shortcut className="absolute right-4 top-1/2 -translate-y-1/2">
              {isMac ? '⌘ + K' : 'Ctrl + K'}
            </Command.Shortcut>
          </>
        )}
      </div>
      <Command.Dialog open={open} onOpenChange={setOpen}>
        <Command.Input placeholder="Search..." />
        <ScrollArea className="max-h-[600px]">
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            {RenderResultGroups}
          </Command.List>
        </ScrollArea>
      </Command.Dialog>
    </div>
  );
}
