import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useApiQuery from '../../../api/use-api-query';
import { UserSettings } from '../../../components/layouts/application-side-nav';
import { Loader } from '../../../components/loaders/loader';
import { FormattedTaskMessage } from '../../../models/task/formatted-task-message-model';

import { Chat } from './components/chat';
import { formatSavedMessagesToStreamedMessageFormat } from './utils/format-saved-messages-to-streamed-message-format';

export function AgentChatPage() {
  const { projectId, agentId, taskId } = useParams();
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

  if ((isLoadingAgent || isLoadingTask) && !formattedTaskMessage?.length) {
    return <Loader />;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div>
      <nav className="w-full flex items-center justify-between py-1">
        <div></div>
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
