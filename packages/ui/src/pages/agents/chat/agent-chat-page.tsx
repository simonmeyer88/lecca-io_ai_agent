import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import useApiQuery from '../../../api/use-api-query';
import { UserSettings } from '../../../components/layouts/application-side-nav';
import { Loader } from '../../../components/loaders/loader';
import { useOnborda } from '../../../components/onboarda/OnbordaContext';
import { useUser } from '../../../hooks/useUser';
import { FormattedTaskMessage } from '../../../models/task/formatted-task-message-model';
import { NavAgentSelector } from '../../projects/components/nav-selectors/nav-agent-selector';

import { Chat } from './components/chat';
import { formatSavedMessagesToStreamedMessageFormat } from './utils/format-saved-messages-to-streamed-message-format';

export function AgentChatPage() {
  const { workspaceUser } = useUser();
  const { projectId, agentId, taskId } = useParams();
  const { startOnborda } = useOnborda();
  const [alreadyShowedAgentOverview, setAlreadyShowedAgentOverview] =
    useState(false);

  const { data: agent, isLoading: isLoadingAgent } = useApiQuery({
    service: 'agents',
    method: 'getById',
    apiLibraryArgs: {
      id: agentId!,
    },
  });
  const { data: task, isLoading: isLoadingTask } = useApiQuery({
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
    setTimeout(() => {
      if (
        !alreadyShowedAgentOverview &&
        window.innerWidth > 700 &&
        !workspaceUser?.user?.toursCompleted?.includes('agents-overview') &&
        !isLoadingAgent
      ) {
        setAlreadyShowedAgentOverview(true);
        startOnborda('agents-overview');
      }
    }, 500);
  }, [
    alreadyShowedAgentOverview,
    isLoadingAgent,
    startOnborda,
    workspaceUser?.user?.toursCompleted,
  ]);

  if ((isLoadingAgent || isLoadingTask) && !formattedTaskMessage?.length) {
    return <Loader />;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div>
      <nav className="w-full flex items-center justify-between py-1">
        <div>
          <div className="mx-2 sm:mx-4 flex items-center space-x-1">
            <Link to={`/agents/${agentId}`}>
              <span>{agent.name}</span>
            </Link>
            <NavAgentSelector />
          </div>
        </div>
        <div className="hidden sm:flex items-center">
          <UserSettings isCollapsed={false} className="size-8" />
        </div>
      </nav>
      <Chat
        agent={agent}
        taskId={taskId}
        projectId={projectId!}
        defaultMessages={
          formattedTaskMessage as unknown as FormattedTaskMessage[]
        }
      />
    </div>
  );
}
