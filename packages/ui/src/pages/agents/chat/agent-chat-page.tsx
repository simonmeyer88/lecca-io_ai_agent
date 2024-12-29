import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useApiQuery from '../../../api/use-api-query';
import PageLayout from '../../../components/layouts/page-layout';
import { Loader } from '../../../components/loaders/loader';
import { FormattedTaskMessage } from '../../../models/task/formatted-task-message-model';
import { NavAgentSelector } from '../../projects/components/nav-selectors/nav-agent-selector';

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

  if (isLoadingAgent && !formattedTaskMessage?.length) {
    return <Loader />;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <PageLayout
      titleButton={<NavAgentSelector />}
      title={agent.name}
      breadcrumbs={[
        {
          href: `/`,
          label: 'Overview',
        },
      ]}
      className="!px-0"
      actions={[]}
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
