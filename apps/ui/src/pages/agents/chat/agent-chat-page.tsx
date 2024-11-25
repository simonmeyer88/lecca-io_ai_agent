import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import useApiQuery from '@/api/use-api-query';
import { Icons } from '@/components/icons';
import PageLayout from '@/components/layouts/page-layout';
import { Loader } from '@/components/loaders/loader';
import { Button } from '@/components/ui/button';
import { useApplicationSideNav } from '@/hooks/useApplicationSideNav';
import { FormattedTaskMessage } from '@/models/task/formatted-task-message-model';
import { NavAgentSelector } from '@/pages/projects/components/nav-selectors/nav-agent-selector';
import { NavProjectSelector } from '@/pages/projects/components/nav-selectors/nav-project-selector';
import { NavTaskSelector } from '@/pages/projects/components/nav-selectors/task-selector';

import { Chat } from './components/chat';
import { formatSavedMessagesToStreamedMessageFormat } from './utils/format-saved-messages-to-streamed-message-format';

export function AgentChatPage() {
  const { projectId, agentId, taskId } = useParams();
  const { setIsCollapsed } = useApplicationSideNav();
  const { data: project } = useApiQuery({
    service: 'projects',
    method: 'getById',
    apiLibraryArgs: {
      id: projectId!,
    },
  });
  const { data: agent, isLoading: isLoadingAgent } = useApiQuery({
    service: 'agents',
    method: 'getById',
    apiLibraryArgs: {
      id: agentId!,
    },
  });

  const { data: task } = useApiQuery({
    service: 'tasks',
    method: 'getById',
    apiLibraryArgs: {
      id: taskId ?? '', //Might not exist and that's okay
    },
  });

  const formattedTaskMessage = useMemo(() => {
    if (task?.messages) {
      return formatSavedMessagesToStreamedMessageFormat({
        messages: task.messages,
        currentAgentId: agentId!,
      });
    }
    return null;
  }, [agentId, task?.messages]);

  useEffect(() => {
    setIsCollapsed(true);
  }, [setIsCollapsed]);

  if (isLoadingAgent && !formattedTaskMessage?.length) {
    return <Loader />;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <PageLayout
      titleButton={<NavTaskSelector />}
      title={task?.name ?? 'New Conversation'}
      className="!px-0"
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
          label: 'Agents',
          href: `/projects/${projectId}/agents`,
        },
        {
          label: agent.name,
          href: `/projects/${projectId}/agents/${agent.id}`,
          additionalButton: <NavAgentSelector />,
        },
      ]}
      actions={[
        <Button variant="outline" asChild size="icon">
          <Link
            to={`/redirect?redirect=/projects/${projectId}/agents/${agent.id}`}
            className="space-x-2"
          >
            <Icons.squarePen className="size-4" />
          </Link>
        </Button>,
      ]}
    >
      <div className="flex space-x-0 lg:space-x-8 w-full">
        <Chat
          agent={agent}
          taskId={taskId}
          projectId={projectId!}
          defaultMessages={
            formattedTaskMessage as unknown as FormattedTaskMessage[]
          }
        />
      </div>
    </PageLayout>
  );
}
