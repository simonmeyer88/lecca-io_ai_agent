import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { AgentDropdownMenu } from '@/components/dropdown-menus/agent-dropdown-menu';
import { EmptyPlaceholder } from '@/components/empty-placeholder';
import { SelectProjectForAgentForm } from '@/components/forms/select-project-for-agent-form';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { GridLoader } from '@/components/loaders/grid-loader';
import { PageLoader } from '@/components/loaders/page-loader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Agent } from '@/models/agent/agent-model';
import { toLocaleDateStringOrUndefined } from '@/utils/dates';

import { NavProjectSelector } from './components/nav-selectors/nav-project-selector';

export function ProjectAgentsPage() {
  const [search, setSearch] = useState('');
  const { projectId } = useParams();

  const { data: project, isLoading: isLoadingProject } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: { id: projectId! },
  });

  const { data: agents, isLoading: isLoadingAgents } = useApiQuery({
    service: 'agents',
    method: 'getList',
    apiLibraryArgs: {
      config: {
        params: {
          filterBy: [`projectId:${projectId}`],
        },
      },
    },
  });

  if (isLoadingAgents || isLoadingProject) {
    return (
      <PageLoader>
        <GridLoader
          itemClassName="h-36"
          className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
        />
      </PageLoader>
    );
  }

  return (
    <PageLayout
      title={'Agents'}
      actions={[
        <Dialog>
          <Dialog.Trigger asChild>
            <Button
              variant={'expandIcon'}
              Icon={Icons.arrowRight}
              iconPlacement="right"
            >
              New Agent
            </Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>,
      ]}
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
      <Input
        type="search"
        placeholder="Search agents..."
        className="py-2 w-[200px] lg:w-[250px] ml-1"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      {agents?.length ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {agents
            ?.filter(
              (agent) =>
                agent.name
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()) ||
                (agent.description &&
                  agent.description
                    .toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase())),
            )
            .map((agent) => (
              <AgentCard key={agent.id} agent={agent} projectId={projectId!} />
            ))}
        </div>
      ) : (
        <Dialog>
          <EmptyPlaceholder
            icon={<Icons.agent />}
            title="No Agents"
            description="To create an agent, click below"
            isDialogTrigger
            buttonLabel="New Agent"
          />
          <Dialog.Content>
            <SelectProjectForAgentForm />
          </Dialog.Content>
        </Dialog>
      )}
    </PageLayout>
  );
}

function AgentCard({ agent, projectId }: { agent: Agent; projectId: string }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => {
        navigate(`/projects/${projectId}/agents/${agent.id}`);
      }}
    >
      <Card.Header>
        <Card.Title className="flex justify-between space-x-4 items-start">
          <div className="flex flex-col space-y-1">
            <span>{agent.name}</span>
            <span className="line-clamp-3 text-sm font-normal text-muted-foreground">
              {agent.description}
            </span>
          </div>
          <AgentDropdownMenu projectId={projectId} agentId={agent.id} />
        </Card.Title>
      </Card.Header>
      <Card.Content></Card.Content>
      <Card.Footer className="text-muted-foreground text-xs flex justify-between">
        <span>Updated on {toLocaleDateStringOrUndefined(agent.updatedAt)}</span>
      </Card.Footer>
    </Card>
  );
}
