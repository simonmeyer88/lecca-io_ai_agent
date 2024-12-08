import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Command } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/useUser';
import { Agent } from '@/models/agent/agent-model';
import { Project } from '@/models/project/project-model';
import { Workflow } from '@/models/workflow/workflow-model';

import { ScrollArea } from './scroll-area';

export function GlobalSearch() {
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

  const { data: workflows } = useApiQuery({
    service: 'workflows',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const { data: agents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {},
  });

  const setFilteredResultGroups = React.useMemo(() => {
    const resultObject: Record<string, Agent[] | Project[] | Workflow[]> = {
      Projects: projects ?? [],
    };

    if (enabledFeatures.AGENTS) {
      resultObject.Agents = agents ?? [];
    }

    if (enabledFeatures.WORKFLOWS) {
      resultObject.Workflows = workflows ?? [];
    }

    return resultObject;
  }, [
    projects,
    enabledFeatures.AGENTS,
    enabledFeatures.WORKFLOWS,
    agents,
    workflows,
  ]);

  const RenderResultGroups = React.useMemo(() => {
    return Object.entries(setFilteredResultGroups).map(([key, value]) => {
      return (
        <Command.Group key={key} heading={key}>
          {value.map((result) => {
            let link: undefined | string;

            if (key === 'Projects') {
              link = `/projects/${result.id}`;
            } else if (key === 'Workflows') {
              link = `/workflows/${result.id}`;
            } else if (key === 'Agents') {
              link = `/agents/${result.id}`;
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
                className="flex justify-between"
              >
                <span>{result.name}</span>
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
    <div className="hidden md:block">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search..."
          onClick={() => setOpen(true)}
          className="md:w-[300px] cursor-pointer"
        />
        <Command.Shortcut className="absolute right-4 top-1/2 -translate-y-1/2">
          {isMac ? '⌘ + K' : 'Ctrl + K'}
        </Command.Shortcut>
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
