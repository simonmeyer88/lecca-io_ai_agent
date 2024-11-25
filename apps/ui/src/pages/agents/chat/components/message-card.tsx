import { useMemo } from 'react';

import { Icons } from '@/components/icons';
import { MarkdownViewer } from '@/components/markdown-viewer';
import { useUser } from '@/hooks/useUser';
import { Agent } from '@/models/agent/agent-model';
import { Knowledge } from '@/models/knowledge-model';
import {
  FormattedTaskAssistantMessage,
  FormattedTaskMessage,
} from '@/models/task/formatted-task-message-model';
import { WorkflowApp } from '@/models/workflow/workflow-app-model';
import { Workflow } from '@/models/workflow/workflow-model';
import { WorkspaceUser } from '@/models/workspace-user-model';
import { cn } from '@/utils/cn';

import { MessageMeta } from '../utils/message-meta';

import { MessageAgentCard } from './message-agent-card';
import { MessageSystemCard } from './message-system-card';
import { MessageUserCard } from './message-user-card';
import { MessageToolCard } from './tool-card';

type Props = {
  message: FormattedTaskMessage;
  agent: Agent;
  knowledge: Knowledge[];
  workflows: Workflow[];
  mappedApps: { [key: string]: WorkflowApp };
  agents: Agent[];
  workspaceUsers: WorkspaceUser[];
  messageIndex: number;
  messageMeta: MessageMeta;
};

export function MessageCard({
  message,
  agent,
  workspaceUsers,
  knowledge,
  workflows,
  agents,
  mappedApps,
  messageIndex,
  messageMeta,
}: Props) {
  const { workspaceUser } = useUser();

  const MessageContent = useMemo(() => {
    switch (message.role) {
      case 'user': {
        const content = message.content;
        const data = message.data;
        /**
         * A workspace user, agent, or workflow can all message an agent.
         * They are all considered "users" in this context.
         */
        const taskMessageWorkspaceUserId = data?.workspaceUserId;
        let taskMessageWorkspaceUser: WorkspaceUser | undefined | null;

        const taskMessageAgentId = data?.agentId;
        let taskMessageAgent: Agent | undefined;

        const taskMessageWorkflowId = data?.workflowId;
        let taskMessageWorkflow: Workflow | undefined;

        if (taskMessageWorkspaceUserId === workspaceUser?.id) {
          taskMessageWorkspaceUser = workspaceUser;
        } else if (taskMessageWorkspaceUserId) {
          taskMessageWorkspaceUser = workspaceUsers?.find(
            (wu) => wu.id === taskMessageWorkspaceUserId,
          );
        } else if (taskMessageWorkflowId) {
          taskMessageWorkflow = workflows?.find(
            (workflow) => workflow.id === taskMessageWorkflowId,
          );
        } else if (taskMessageAgentId) {
          taskMessageAgent = agents?.find(
            (agent) => agent.id === taskMessageAgentId,
          );
        } else {
          //If there is no message data then we will assume it's being streamed.
          //Streamed data can only happen as a user chats. So we will default to the current user.
          taskMessageWorkspaceUser = workspaceUser!;
        }

        return (
          <MessageUserCard
            user={{
              agent: taskMessageAgent,
              workflow: taskMessageWorkflow,
              workspaceUser: taskMessageWorkspaceUser!,
            }}
            agent={agent}
            content={content}
            createdAt={message.createdAt}
            mappedApps={mappedApps}
          />
        );
      }
      case 'assistant': {
        const content = message.content;
        const data = message.data;
        const taskMessageAgentId = data?.agentId;
        let taskMessageAgent: Agent | undefined;

        if (taskMessageAgentId) {
          taskMessageAgent = agents?.find(
            (agent) => agent.id === taskMessageAgentId,
          );
        } else {
          taskMessageAgent = agent!;
        }

        if (Array.isArray(content)) {
          //This is used when the assistant response is fully generated.
          return (
            <div>
              {content.map((c, i) => {
                switch (c.type) {
                  case 'text':
                    return (
                      <MessageAgentCard
                        key={i}
                        agent={taskMessageAgent!}
                        textContent={c.text}
                        status={'idle'}
                        createdAt={message.createdAt}
                      />
                    );
                  default:
                    return 'Unknown type';
                }
              })}
            </div>
          );
        } else {
          //Is is used while the response is generating, it's just a string.
          return (
            <MessageAgentCard
              agent={taskMessageAgent!}
              textContent={content}
              status="idle"
              createdAt={message.createdAt}
            />
          );
        }
      }
      case 'system':
        return (
          <MessageSystemCard
            createdAt={message.createdAt}
            textContent={message.content}
          />
        );
      default:
        return <MarkdownViewer>{'Unknown role'}</MarkdownViewer>;
    }
  }, [
    agent,
    agents,
    mappedApps,
    message.content,
    message.createdAt,
    message.data,
    message.role,
    workflows,
    workspaceUser,
    workspaceUsers,
  ]);

  const ToolInvocations = useMemo(() => {
    const toolInvocations = (message as FormattedTaskAssistantMessage)
      .toolInvocations;

    const previousType = messageMeta.data[messageIndex - 1]?.type;

    if (!toolInvocations) {
      if (previousType === 'start' || previousType === 'between') {
        //To get the count, go backwards until you reach the type start
        let count = 0;
        let i = messageIndex - 1;

        while (i >= 0) {
          count++;
          if (messageMeta.data[i]?.type === 'start') {
            //Set the count on the start so we can use in UI
            messageMeta.data[i].count = count;
            messageMeta.data[i].isWorking = false;
            break;
          }
          i--;
        }

        //Set the count on the end so we can use in UI
        messageMeta.data[messageIndex] = {
          ...messageMeta.data[messageIndex],
          type: 'end',
          count,
          isWorking: false,
        };
      }

      return null;
    }

    if (previousType === 'start' || previousType === 'between') {
      messageMeta.data[messageIndex] = {
        ...messageMeta.data[messageIndex],
        type: 'between',
      };
    } else {
      messageMeta.data[messageIndex] = {
        ...messageMeta.data[messageIndex],
        isWorking: true,
        type: 'start',
      };
    }

    messageMeta.forceRefresh();

    const data = (message as any).data as { agentId: string };

    const taskMessageAgentId = data?.agentId;
    let taskMessageAgent: Agent | undefined;

    if (taskMessageAgentId) {
      taskMessageAgent = agents?.find(
        (agent) => agent.id === taskMessageAgentId,
      );
    } else {
      taskMessageAgent = agent!;
    }

    return toolInvocations.map((tool) => {
      return (
        <MessageToolCard
          key={tool.toolCallId}
          tool={tool}
          mappedApps={mappedApps}
          workflows={workflows}
          knowledge={knowledge}
          agents={agents}
          //Passing the id so that the component can fetch the agent by id with it's tools.
          //this is because the getList agents doesn't return the tools. We could add the expansion,
          //but I'd rather not do that.
          agentId={taskMessageAgent!.id!}
        />
      );
    });
  }, [
    agent,
    agents,
    knowledge,
    mappedApps,
    message,
    messageIndex,
    messageMeta,
    workflows,
  ]);

  const StartToolBlock = () => {
    const startBlock = messageMeta.data[messageIndex];

    if (startBlock?.type === 'start') {
      return (
        <div className="flex items-center space-x-2 mb-6">
          <div className="border rounded-md p-1.5 mr-1">
            <Icons.app className="size-5" />
          </div>
          {startBlock.isWorking ? (
            <div className="flex items-center space-x-1.5 text-sm">
              <span className="font-medium">{agent.name}</span>
              <span className="text-muted-foreground animate-pulse">
                is working...
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-sm">
              <span className="font-medium">{startBlock.count}</span>
              <span className="text-muted-foreground">
                {startBlock.count && startBlock.count === 1 ? 'tool' : 'tools'}
              </span>
              <span className="text-muted-foreground">used by</span>
              <span className="font-medium">{agent.name}</span>
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  };

  // const EndToolBlock = () => {
  //   if (messageMeta.data[messageIndex]?.type === 'end') {
  //     return <div className="" />;
  //   } else {
  //     return null;
  //   }
  // };

  return (
    <div
      className={cn('animate-fade-in w-full sm:px-10', {
        '!mt-6': messageMeta.data[messageIndex]?.type,
        '!mt-2': messageMeta.data[messageIndex]?.type === 'start',
      })}
    >
      {/* {EndToolBlock} */}
      {MessageContent}
      {StartToolBlock()}
      {ToolInvocations}
    </div>
  );
}
